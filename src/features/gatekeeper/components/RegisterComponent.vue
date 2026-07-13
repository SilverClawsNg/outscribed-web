<script setup lang="ts">
import { ref } from 'vue'
import { APIError } from '@/api/apiTypes.ts'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts'
import type { SendTokenResponse, CheckUsernameResponse} from '@/features/gatekeeper/types/GatewayTypes.ts'
import { postAsync } from '@/api/apiPostServices'
import { getAsync } from '@/api/apiGetServices'

// Composables & Shared UI
import { useFormProgress } from '@/composables/useFormProgress.ts'
import FormProgress from '@/components/FormProgress.vue'

// Step Subcomponents
import SendTokenStep from './SendTokenComponent.vue'
import VerifyTokenStep from './VerifyTokenComponent.vue'
import CreateAccessStep from './CreateAccessComponent.vue'

import { useModalStore } from '@/stores/modalStore'

const modalStore = useModalStore()

const authStore = useAuthStore()

const isFormLoading = ref(false)
const isUsernameError = ref(false)

const activeStep = ref(1)

//const router = useRouter()
//const route = useRoute()


// 🎯 Conditional layout environment prop flags
interface Props {
  isPage?: boolean
}
withDefaults(defineProps<Props>(), {
  isPage: true
})

// 🎯 Add specialized modal action emits alongside your success emit
const emit = defineEmits<{
  success: []
}>()

// Initialize state container with default state
const { progressState, startLoading, setSuccess, setWarning, setError, resetProgress } = useFormProgress()

// State Persistence across Step Transitions
const verificationId = ref<string | null>(null)
const savedEmailAddress = ref('')
const countdownTimer = ref(0)
const canResendToken = ref(false)

let timerInterval: number | null = null

// Derived from environment configs (swaps automatically between dev/prod)
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)

/**
 * --- STEP 1: Submit Email & Captcha Verification ---
 */
async function onEmailSubmitted(email: string, captchaToken: string) {
  isFormLoading.value = true
  savedEmailAddress.value = email
  startLoading()

  const sendTokenData = {
    emailAddress: email,
    captchaToken: captchaToken,
    type: 1 // PreRegistrationVerification Enum Value
  }

  const outcome = await postAsync<SendTokenResponse>('/api/token', sendTokenData, false)

   if (outcome.isFailure) {
      isFormLoading.value = false;
    
    // 🛡️ THE FIX: Ensure outcome.error is not null before feeding it to setError
    if (outcome.error) {
      setError(outcome.error)
    } else {
      // Fallback in case a failure happens without an explicit server payload
      setError(new APIError(0, 'Server Error', 'An unknown server failure occurred.  Refresh page and try again'))
    }
    return
  } else {

    // 🎯 CASE 2: The endpoint hit HTTP 200, but identity domain rules failed (e.g., wrong password)
  if (!outcome.value || !outcome.value?.verificationId) {

      setError(new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again'))
      return
  }

  // Happy Path: Save verification token context and advance
  setSuccess('Verification token sent successfully.')

    verificationId.value = outcome.value.verificationId
    activeStep.value = 2
    isFormLoading.value = false
    startResendTimer()
  }
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
    type: 1 // PreRegistrationVerification Enum Value
  }

    const outcome = await postAsync<boolean>('/api/token/verify', verifyTokenData, false)

      
   if (outcome.isFailure) {
      isFormLoading.value = false;
    
    // 🛡️ THE FIX: Ensure outcome.error is not null before feeding it to setError
    if (outcome.error) {
      setError(outcome.error)
    } else {
      // Fallback in case a failure happens without an explicit server payload
      setError(new APIError(0, 'Server Error', 'An unknown server failure occurred.  Refresh page and try again'))
    }
    return
  } else {
    // Token is good, clear the countdown background thread and proceed
          setSuccess('Verification completed successfully.')

    if (timerInterval) clearInterval(timerInterval)
    activeStep.value = 3
    isFormLoading.value = false
  }
}

/**
 * --- STEP 3: Complete Account Setup ---
 */
async function onAccessCompleted(payload: { username: string; title: string; password?: string }) {
  isFormLoading.value = true
  
  startLoading()
  
// 🎯 Store does all token mutations under the hood, returning Result<boolean>
  const outcome = await authStore.createAccess({
    verificationId: verificationId.value,
    username: payload.username,
    title: payload.title,
    password: payload.password
  })


 // 🎯 2. Guard with an explicit check on outcome.isFailure
  if (outcome.isFailure) {
  isFormLoading.value = false;
    
    // 🛡️ THE FIX: Ensure outcome.error is not null before feeding it to setError
    if (outcome.error) {
      setError(outcome.error)
    } else {
      // Fallback in case a failure happens without an explicit server payload
      setError(new APIError(0, 'Authentication Error', 'An unexpected connection failure occurred.'))
    }
    return
  }

  //const returnUrl = (route.query.returnUrl as string) || '/timelines'
  //router.push(returnUrl)
    emit('success')

}

/**
 * --- Live Username Evaluation Hook ---
 * Exposed to Step 3 for real-time availability checks
 */
async function checkUsernameAvailability(username: string): Promise<boolean> {
  
  if (username.length < 3 || username.length > 20) return false
  
  startLoading()

  const outcome = await getAsync<CheckUsernameResponse>(`/api/check/username?username=${username}`, false, {} as CheckUsernameResponse)

if (outcome.isFailure) {
    
    // 🛡️ THE FIX: Ensure outcome.error is not null before feeding it to setError
    if (outcome.error) {
      setError(outcome.error)
    } else {
      // Fallback in case a failure happens without an explicit server payload
      setError(new APIError(0, 'Server Error', 'An unknown server failure occurred.  Refresh page and try again'))
    }

    isUsernameError.value = true;
 return false;
  }

  if(!outcome.value || outcome.value.isAvailable){

    isUsernameError.value = true;
    setWarning('Username is already in use. Please choose another.')
 return false;
  }

  setSuccess('Congrats. Username is free to use.')
 
  return true;
}

/**
 * --- Countdown Timer Utilities ---
 */
function startResendTimer() {
  if (timerInterval) clearInterval(timerInterval)
  
  canResendToken.value = false
  countdownTimer.value = 90
  
  // 🎯 Explicitly use window.setInterval to guarantee a numeric return type
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
  activeStep.value = 1 // Kick back to Step 1 to re-trigger Captcha challenges
}

</script>

<template>

  <div class="form-container boxed">

     <template v-if="isPage">
    <h1>Create Account</h1>
    </template>

    <h2>Get started with a free membership</h2>

  <FormProgress :progress="progressState" :is-boxed="true" />

    <article class="multi-form">
      
      <section>
        <div class="multi-form__header">
          <span :class="{ active: activeStep === 1 }"></span>
          <h3>Enter Email Address</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 1 }">
          <SendTokenStep 
            v-if="activeStep === 1"
            :is-loading="isFormLoading" 
            :site-key="siteKey" 
            @submit="onEmailSubmitted"
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
          />
        </div>
      </section>

    </article>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-container.less";
</style>