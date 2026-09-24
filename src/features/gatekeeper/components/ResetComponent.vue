<script setup lang="ts">
import { ref, onUnmounted, onMounted  } from 'vue'
import { APIError } from '@/api/apiTypes.ts'
import type { SendTokenResponse } from '@/features/gatekeeper/types/GatewayTypes.ts'
import { postAsync } from '@/api/apiPostServices'
import PageStatusMessage from '@/components/PageStatusMessage.vue'

// Composables & Shared UI
import { useFormProgress } from '@/composables/useFormProgress.ts'
import FormProgress from '@/components/FormProgress.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'

// Step Subcomponents
import SendTokenStep from './SendTokenComponent.vue'
import ResendTokenStep from './ResendTokenComponent.vue'
import VerifyTokenStep from './VerifyTokenComponent.vue'
import CompleteResetStep from './ResetPasswordComponent.vue'
import HelpIcon from '@/components/HelpIcon.vue'

const isFormLoading = ref(false)
const activeStep = ref(1)

interface Props {
  isPage?: boolean
}
withDefaults(defineProps<Props>(), {
  isPage: true
})

const emit = defineEmits<{
  success: []
}>()

const { progressState, startLoading, setSuccess, setWarning, setError, resetProgress } = useFormProgress()

// State Persistence across Step Transitions
const verificationId = ref<string | null>(null)
const savedEmailAddress = ref('')
const countdownTimer = ref(0)
const canResendToken = ref(false)


// --- CAPTCHA GATE HANDLERS ---
const captchaToken = ref<string | null>(null)
const captchaState = ref<string>('')
const captchaErrorMessage = ref<string>('')

function handleCaptchaSuccess(token: string) {
  captchaToken.value = token
  captchaState.value = 'VERIFIED'
}

function handleCaptchaError() {
  captchaToken.value = null
  captchaState.value = 'FAILED'
  captchaErrorMessage.value = 'Error occurred while verifying captcha. Ensure you are connected to the Internet, refresh page and try again.'
}


function resetCaptcha() {
  captchaToken.value = null
  captchaState.value = 'READY'
}


let timerInterval: number | null = null

const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)

/**
 * --- STEP 1A: Initial Email Submission (Uses saved captchaToken) ---
 * Hits POST /api/token
 */
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
    type: 2 // PasswordReset Verification Enum Value
  }

  const outcome = await postAsync<SendTokenResponse>('/api/token', sendTokenData, false)

  if (outcome.isFailure) {
    isFormLoading.value = false

 // 🎯 DO NOT nullify token on standard form validation errors!
    // ONLY invalidate if backend explicitly reports a CAPTCHA verification failure:
    if (outcome.error?.title === 'Captcha Error') {
      captchaToken.value = null
      captchaState.value = 'FAILED'
      captchaErrorMessage.value = 'Captcha validation failed on server. Please re-verify.'
    }else{
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again.'))
    }
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

/**
 * --- STEP 1B: Resend Token Request ---
 * Hits POST /api/token/resend (requires existing verificationId and email)
 */
async function onResendSubmitted(email: string, newCaptchaToken: string) {
  if (!verificationId.value) {
    setError(new APIError(0, 'Client Error', 'Missing verification state. Please restart password reset.'))
    return
  }

  isFormLoading.value = true
  startLoading()

  const resendTokenData = {
    verificationId: verificationId.value,
    emailAddress: email,
    captchaToken: newCaptchaToken,
    type: 2
  }

  const outcome = await postAsync<SendTokenResponse>('/api/token/resend', resendTokenData, false)

  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again.'))
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

/**
 * --- STEP 2: Verify 6-Digit OTP Token ---
 */
async function onTokenVerified(otpToken: string) {
  isFormLoading.value = true
  startLoading()

  const verifyTokenData = {
    verificationId: verificationId.value,
    token: otpToken,
    type: 2
  }

  const outcome = await postAsync<boolean>('/api/token/verify', verifyTokenData, false)

  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again.'))
    return
  }

  setSuccess('Verification completed successfully.')
  if (timerInterval) clearInterval(timerInterval)
  activeStep.value = 3
  isFormLoading.value = false
}

/**
 * --- STEP 3: Complete Password Reset ---
 */
async function onResetPassword(password: string, confirm: boolean) {
  isFormLoading.value = true
  startLoading()

  const resetPasswordData = {
    verificationId: verificationId.value,
    password: password,
    confirm: confirm
  }

  const outcome = await postAsync<boolean>('/api/password/reset', resetPasswordData, false)

  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again.'))
    return
  }

  emit('success')
}

/**
 * --- Countdown Timer Utilities ---
 */
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

  <div class="form-container">

    <!-- STEP 0: CAPTCHA GATE SCREEN -->
     <template  v-if="!captchaToken">
      
       <template v-if="captchaState === 'FAILED'">

         <PageStatusMessage 
              title="Verification Failed!" 
              :message= 'captchaErrorMessage'
              icon="shield" 
              :is-standalone="true"
               >
                <template #actions>
                <button type="button" class="btn btn-secondary" @click="resetCaptcha">
                  Try Again
                </button>
              </template>
        </PageStatusMessage>
      
       </template>

      <template v-else>
      
          <PageStatusMessage 
              title="Performing security verification!" 
              message="This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot."
              icon="shield" 
              :is-standalone="true"
            />

              <TurnstileWidget 
              :site-key="siteKey" 
              @success="handleCaptchaSuccess"
              @error="handleCaptchaError"
            />

      </template>

     </template>

     <template  v-else >

         <div class="form-header">
        <template v-if="isPage">
          <h1 class="form-title">Reset Password</h1>
        </template>
        <h2>Complete these three quick steps to get a new password</h2>
        <HelpIcon topic="ResetPassword" />
    </div>
      
    <FormProgress :progress="progressState" :is-boxed="true" />

    <!-- MAIN RESET ACCORDION (UNLOCKED AFTER CAPTCHA VERIFICATION) -->
    <article class="multi-form">
      <section>
        <div class="multi-form__header">
          <span :class="{ active: activeStep === 1 }"></span>
          <h3>1. Enter your email address</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 1 }">
          <!-- Initial Send Step (Uses parent captchaToken) -->
          <SendTokenStep 
            v-if="activeStep === 1 && !verificationId"
            :is-loading="isFormLoading" 
            :captcha-token="captchaToken"
            @submit="onEmailSubmitted"
            @warning="setWarning"
            @clear-warning="() => { if (progressState.type === 'Warning') resetProgress() }"
          />

          <!-- Resend Token Step (Has verificationId, renders embedded Captcha for repeat tokens) -->
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
           <h3>2. Enter token sent to email address</h3>
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
          <h3>3. Enter your new passord</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 3 }">
          <CompleteResetStep 
            v-if="activeStep === 3"
            :is-loading="isFormLoading"
            @submit="onResetPassword"
            @warning="setWarning"
            @clear-warning="() => { if (progressState.type === 'Warning') resetProgress() }"  
          />
        </div>
      </section>
    </article>
    </template>

  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/multi-form.less";
</style>