<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { APIError } from '@/api/apiTypes'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import type { SendTokenResponse, CheckUsernameResponse } from '@/features/gatekeeper/types/GatewayTypes'
import { postAsync } from '@/api/apiPostServices'
import { getAsync } from '@/api/apiGetServices'

import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'

import SendTokenStep from './SendTokenComponent.vue'
import ResendTokenStep from './ResendTokenComponent.vue'
import VerifyTokenStep from './VerifyTokenComponent.vue'
import CreateAccessStep from './CreateAccessComponent.vue'

interface Props {
  isPage?: boolean
}
withDefaults(defineProps<Props>(), {
  isPage: true
})

const emit = defineEmits<{
  success: []
}>()

const authStore = useAuthStore()
const isFormLoading = ref(false)
const isUsernameError = ref(false)
const activeStep = ref(1)

const { progressState, startLoading, setSuccess, setWarning, setError, resetProgress } = useFormProgress()

const verificationId = ref<string | null>(null)
const savedEmailAddress = ref('')
const captchaToken = ref<string | null>(null)
const countdownTimer = ref(0)
const canResendToken = ref(false)

let timerInterval: number | null = null
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)

// --- CAPTCHA GATE HANDLERS ---
function handleCaptchaSuccess(token: string) {
  captchaToken.value = token
  setSuccess('Security check completed. You may now continue.')
}

function handleCaptchaError() {
  captchaToken.value = null
  setError(new APIError(0, 'Security Error', 'Error occurred while verifying captcha. Please refresh and try again.'))
}

function handleCaptchaExpired() {
  captchaToken.value = null
  setWarning('Security token expired. Please verify the captcha again.')
}

// --- STEP 1A: Email Submission (Uses saved captchaToken) ---
async function onEmailSubmitted(email: string) {
  if (!captchaToken.value) {
    setWarning('Security token missing. Please complete the captcha.')
    return
  }

  isFormLoading.value = true
  savedEmailAddress.value = email
  startLoading()

  const sendTokenData = {
    emailAddress: email,
    captchaToken: captchaToken.value,
    type: 1
  }

  const outcome = await postAsync<SendTokenResponse>('/api/token', sendTokenData, false)

  if (outcome.isFailure) {
    isFormLoading.value = false
    captchaToken.value = null // Invalidate token on failure to force fresh verification
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    return
  }

  if (!outcome.value?.verificationId) {
    setError(new APIError(0, 'Server Error', 'Invalid response from server.'))
    return
  }

  setSuccess('Verification token sent successfully.')
  verificationId.value = outcome.value.verificationId
  activeStep.value = 2
  isFormLoading.value = false
  startResendTimer()
}

// --- STEP 1B: Resend Token ---
async function onResendSubmitted(email: string, newCaptchaToken: string) {
  if (!verificationId.value) {
    setError(new APIError(0, 'Client Error', 'Missing verification state. Please restart registration.'))
    return
  }

  isFormLoading.value = true
  startLoading()

  const resendTokenData = {
    verificationId: verificationId.value,
    emailAddress: email,
    captchaToken: newCaptchaToken,
    type: 1
  }

  const outcome = await postAsync<SendTokenResponse>('/api/token/resend', resendTokenData, false)

  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    return
  }

  if (outcome.value?.verificationId) {
    verificationId.value = outcome.value.verificationId
  }

  setSuccess('A new verification token has been sent.')
  activeStep.value = 2
  isFormLoading.value = false
  startResendTimer()
}

// --- STEP 2: Verify Token ---
async function onTokenVerified(otpToken: string) {
  isFormLoading.value = true
  startLoading()

  const verifyTokenData = {
    verificationId: verificationId.value,
    token: otpToken,
    type: 1
  }

  const outcome = await postAsync<boolean>('/api/token/verify', verifyTokenData, false)

  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    return
  }

  setSuccess('Verification completed successfully.')
  if (timerInterval) clearInterval(timerInterval)
  activeStep.value = 3
  isFormLoading.value = false
}

// --- STEP 3: Complete Registration ---
async function onAccessCompleted(payload: { username: string; title: string; password?: string }) {
  isFormLoading.value = true
  startLoading()

  const outcome = await authStore.createAccess({
    verificationId: verificationId.value,
    username: payload.username,
    title: payload.title,
    password: payload.password
  })

  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    return
  }

  emit('success')
}

async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (username.length < 3 || username.length > 20) return false
  startLoading()

  const outcome = await getAsync<CheckUsernameResponse>(`/api/check/username?username=${username}`, false, {} as CheckUsernameResponse)

  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    isUsernameError.value = true
    return false
  }

  if (outcome.value?.isAvailable) {
    isUsernameError.value = true
    setWarning('Username is already in use. Please choose another.')
    return false
  }

  setSuccess('Congrats. Username is free to use.')
  isUsernameError.value = false
  return true
}

function startResendTimer() {
  if (timerInterval) clearInterval(timerInterval)
  canResendToken.value = false
  countdownTimer.value = 90

  timerInterval = window.setInterval(() => {
    countdownTimer.value--
    if (countdownTimer.value <= 0) {
      if (timerInterval) clearInterval(timerInterval)
      canResendToken.value = true
    }
  }, 1000)
}

function handleResendRequest() {
  if (timerInterval) clearInterval(timerInterval)
  activeStep.value = 1
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>

  <div class="form-container" :class="{ 'boxed': isPage }">

    <template v-if="isPage">
      <h1 class="form-header">Create Account</h1>
    </template>

    <h2 class="form-subheader">Get started with a free membership</h2>

    <FormProgress :progress="progressState" :is-boxed="true" />

    <!-- STEP 0: CAPTCHA GATE SCREEN -->
    <div v-if="!captchaToken" class="captcha-gate">
      <p class="captcha-gate__instruction">Complete the security check below to proceed:</p>
      <TurnstileWidget 
        :site-key="siteKey" 
        @success="handleCaptchaSuccess"
        @error="handleCaptchaError"
        @expired="handleCaptchaExpired"
      />
    </div>

    <!-- MAIN REGISTRATION ACCORDION (UNLOCKED UPON CAPTCHA SUCCESS) -->
    <article v-else class="multi-form">
      <section>
        <div class="multi-form__header">
          <span :class="{ active: activeStep === 1 }"></span>
          <h3>Enter Email Address</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 1 }">
          <SendTokenStep 
            v-if="activeStep === 1 && !verificationId"
            :is-loading="isFormLoading" 
            :captcha-token="captchaToken"
            @submit="onEmailSubmitted"
            @warning="setWarning"
            @clear-warning="() => { if (progressState.type === 'Warning') resetProgress() }"
          />

          <ResendTokenStep 
            v-if="activeStep === 1 && verificationId"
            :is-loading="isFormLoading" 
            :site-key="siteKey"
            :email="savedEmailAddress"
            @submit="onResendSubmitted"
            @warning="setWarning"
            @clear-warning="() => { if (progressState.type === 'Warning') resetProgress() }"
          />
        </div>
      </section>

      <section>
        <div class="multi-form__header">
          <span :class="{ active: activeStep === 2 }"></span>
          <h3>Verify Email Address</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 2 }">
          <VerifyTokenStep 
            v-if="activeStep === 2"
            :is-loading="isFormLoading"
            :timer="countdownTimer"
            :can-resend="canResendToken"
            @verify="onTokenVerified"
            @resend="handleResendRequest"
          />
        </div>
      </section>

      <section>
        <div class="multi-form__header">
          <span :class="{ active: activeStep === 3 }"></span>
          <h3>Complete Registration</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 3 }">
          <CreateAccessStep 
            v-if="activeStep === 3"
            :is-loading="isFormLoading"
            :is-username-error="isUsernameError"
            @blur-username="checkUsernameAvailability"
            @submit="onAccessCompleted"
            @warning="setWarning"
            @clear-warning="() => { if (progressState.type === 'Warning') resetProgress() }"  
          />
        </div>
      </section>
    </article>

  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/boxed-form.less";
@import "@/assets/css/multi-form.less";
</style>