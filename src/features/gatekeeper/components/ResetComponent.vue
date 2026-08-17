<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
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
import CompleteResetStep from './ResetPasswordComponent.vue'

const authStore = useAuthStore()

const isFormLoading = ref(false)

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
 * --- STEP 1A: Initial Email & Captcha Verification ---
 * Hits POST /api/token
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
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.  Refresh page and try again.'))
    return
  }

  if (!outcome.value?.verificationId) {
    setError(new APIError(0, 'Server Error', 'Invalid response from server.'))
    return
  }

  // Happy Path: Store verification ID and advance to Step 2
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
async function onResendSubmitted(email: string, captchaToken: string) {
  if (!verificationId.value) {
    setError(new APIError(0, 'Client Error', 'Missing verification state. Please restart registration.'))
    return
  }

  isFormLoading.value = true
  startLoading()

  const resendTokenData = {
    verificationId: verificationId.value,
    emailAddress: email,
    captchaToken: captchaToken,
    type: 1
  }

  const outcome = await postAsync<SendTokenResponse>('/api/token/resend', resendTokenData, false)

  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.  Refresh page and try again.'))
    return
  }

  if (outcome.value?.verificationId) {
    // Update verificationId if server issues a new one
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
    type: 1 // PreRegistrationVerification Enum Value
  }

    const outcome = await postAsync<boolean>('/api/token/verify', verifyTokenData, false)
      
  if (outcome.isFailure) {
    isFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.  Refresh page and try again.'))
    return
  }
      
  setSuccess('Verification completed successfully.')
    if (timerInterval) clearInterval(timerInterval)
    activeStep.value = 3
    isFormLoading.value = false
}

/**
 * --- STEP 3: Complete Account Setup ---
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
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.  Refresh page and try again.'))
    return
  }


  //const returnUrl = (route.query.returnUrl as string) || '/timelines'
  //router.push(returnUrl)
    emit('success')

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

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

</script>

<template>

  <div class="form-container boxed">

     <template v-if="isPage">
    <h1>Reset Password</h1>
    </template>

    <h2>Follow these steps to reset your password</h2>

 <FormProgress :progress="progressState" :is-boxed="true" />

    <article class="multi-form">
      
      <section>
        <div class="multi-form__header">
          <span :class="{ active: activeStep === 1 }"></span>
          <h3>Enter Email Address</h3>
        </div>
        <div class="multi-form__step" :class="{ expanded: activeStep === 1 }">
           <!-- Initial Send Step (No verificationId yet) -->
        <SendTokenStep 
          v-if="activeStep === 1 && !verificationId"
          :is-loading="isFormLoading" 
          :site-key="siteKey" 
          @submit="onEmailSubmitted"
          @warning="setWarning"
          @clear-warning="() => { if (progressState.type === 'Warning') resetProgress() }"
        />

        <!-- Resend Token Step (Has verificationId, displays saved email read-only) -->
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
          <h3>Complete Reset</h3>
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
  </div>
</template>
<style lang="less" scoped>
@import "@/assets/css/form-container.less";
</style>