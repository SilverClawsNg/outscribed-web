
<script setup lang="ts">
import { ref, reactive, onUnmounted, watch, computed } from 'vue';
import { useAuthenticationStore } from '../stores/AuthenticationStore';
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { APIError } from '@/api/apiTypes'
import { isValidEmail } from '@/utils/validators'
import SvgIcons from '@/components/SvgIcons.vue'

const emit = defineEmits<{ (e: 'success', data?: any): void }>();
const authStore = useAuthenticationStore();

const step = ref<'register' | 'selection' | 'verify'>('register');
const isLoading = ref(false);
const isResend = ref(false);
let pollInterval: number | null = null;

const username = ref('')
const emailAddress = ref('')
const password = ref('')
const passwordVisible = ref(false)
const captchaToken = ref<string | null>(null)
const verificationId = ref<string | null>(null)
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)
const captchaFailed = ref(false)
const captchaErrorMessage = ref<string>('')
const inputs = ref<HTMLInputElement[]>([])
const tokenbits = ref<string[]>(['', '', '', '', '', ''])
let timerInterval: number | null = null
const countdownTimer = ref(0)
const canResendToken = ref(false)
const MAX_POLLS = 20 // 20 attempts * 3 seconds = 60 seconds total
const maxTimeoutMs = 60000 // 60 seconds deadline
const startTime = ref<number>(0)
const isPolling = ref(false)
const pollingTimer = ref<number | null>(null)

// 1. Tracks whether the user has at least attempted to submit the form once
const reserveAccountFormSubmitted = ref(false)
const sendTokenFormSubmitted = ref(false)
const verifyTokenFormSubmitted = ref(false)

const isReserveAccountFormLoading = ref(false)
const isSendTokenFormLoading = ref(false)
const isVerifyTokenFormLoading = ref(false)

const { progressState, startLoading, setSuccess, setError, setWarning, resetProgress } = useFormProgress()


function handleCaptchaSuccess(token: string) {
  captchaToken.value = token
  captchaFailed.value = false;
}

function handleCaptchaError() {
  captchaToken.value = null
  captchaFailed.value = true;
}

function resetCaptcha() {
  captchaToken.value = null
  captchaFailed.value = false
}

// Regex: 2 to 20 chars, letters, numbers, underscores (_), and hyphens (-).
// Starts and ends with alphanumeric characters.
const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{0,18}[a-zA-Z0-9])?$/;

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const reserveAccountFormValidationErrors = computed(() => {

const usernameText = username.value || '';
const passwordText = password.value || '';

let usernameError = '';

  if (usernameText === '') {
    usernameError = 'Username is required.';
  } else if (usernameText.length < 2 || usernameText.length > 20) {
    usernameError = 'Username must be between 2 and 20 characters.';
  } else if (!USERNAME_REGEX.test(usernameText)) {
    // Specific feedback for special characters, spaces, or invalid start/end symbols
    if (usernameText.includes(' ')) {
      usernameError = 'Username cannot contain spaces.';
    } else if (usernameText.includes('@')) {
      usernameError = 'Do not include the @ symbol.';
    } else {
      usernameError = 'Only letters, numbers, underscores (_), and hyphens (-) are allowed.';
    }
  }

  return {
  
    username: usernameError,

    password: passwordText === '' || passwordText.length < 8
      ? 'Enter a valid password'
      : ''
  }
})

// 3. Form is valid if all computed error fields are empty strings
const isReserveAccountFormValid = computed(() => {
  return Object.values(reserveAccountFormValidationErrors.value).every(error => error === '')
})

// --- 4. The centralized warning to ensures the to warning is in sync with the form field warnings ---
// It monitors form health and automatically dictates top-level notification state
watch(
  [isReserveAccountFormValid, reserveAccountFormSubmitted], 
  ([isValid, submitted]) => {
    // Don't disturb the user if they haven't tried to submit yet
    if (!submitted) return

     if (!isValid) {
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      // Clear warning and clean up state immediately when compliance is met
       if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  }, 
  { immediate: true }
)

async function handleReserve() {

  isReserveAccountFormLoading.value = true
  reserveAccountFormSubmitted.value = true
  startLoading()

  const outcome = await authStore.reserveAccount({
    username: username.value,
    password: password.value,
    captchaToken: captchaToken.value
  })

  isReserveAccountFormLoading.value = false

  if (outcome.isFailure) {
    if (outcome.error?.title === 'Captcha Error') {
      captchaErrorMessage.value = outcome.error.detail ?? 'Captcha validation failed on server. Please re-verify.'
      handleCaptchaError()
    } else {
      setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    }
    return
  }

  verificationId.value = outcome.value
  step.value = 'selection';
  resetProgress()
}

const sendTokenFormValidationErrors = computed(() => {
  const emailText = emailAddress.value.trim()
  return {
    email: emailText === '' || !isValidEmail(emailText)
      ? 'Enter a valid email address'
      : ''
  }
})

const isSendTokenFormValid = computed(() => {
  return Object.values(sendTokenFormValidationErrors.value).every(error => error === '')
})

watch(
  [isSendTokenFormValid, sendTokenFormSubmitted], 
  ([isValid, submitted]) => {
    if (!submitted) return
   
     if (!isValid) {
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      // Clear warning and clean up state immediately when compliance is met
       if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  }, 
  { immediate: true }
)

async function handleSendToken() {

  isSendTokenFormLoading.value = true
  isResend.value = true
  startLoading()

  const outcome = await authStore.sendToken({
      emailAddress: emailAddress.value,
      verificationId: verificationId.value ?? '',
      type: 1,
      isResend: isResend.value,
      CaptchaToken: captchaToken.value
    });

  if (outcome.isFailure) {
    isSendTokenFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again.'))
    }
  
    startResendTimer()
    inputs.value[0]?.focus()
    step.value = 'verify';
    resetProgress()
}

function handleInput(e: Event, index: number) {
  const target = e.target as HTMLInputElement
  if (!target) return

  const val = target.value
  if (!val || !val[0]) return

  // 🎯 FIX: Force TypeScript to acknowledge that the index write operation is valid
  if (index >= 0 && index < tokenbits.value.length) {
    tokenbits.value[index] = val[0]
  }

  // Shift cursor focus to the next input field
  if (index < 5) {
    inputs.value[index + 1]?.focus()
  }

  // Auto-submit when all fields contain a valid, non-empty character string value
  //if (tokenbits.value.every(v => typeof v === 'string' && v !== '')) {
  //  emit('verify', tokenbits.value.join(''))
  //}
}

function handleKeyDown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace' && index > 0) {
    // 🎯 FIX: Safe array extraction guard for strict indexed checking rules
    const currentBoxValue = tokenbits.value[index]
    
    if (currentBoxValue === '') {
      tokenbits.value[index - 1] = ''
      inputs.value[index - 1]?.focus()
    }
  }
}

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const verifyTokenFormValidationErrors = computed(() => {
  return {
  
    tokenbits: tokenbits.value.some(bit => !bit)
      ? 'All token fields are required'
      : ''
  }
  
})

// 3. Form is valid if all computed error fields are empty strings
const isVerifyTokenFormValid = computed(() => {
  return Object.values(verifyTokenFormValidationErrors.value).every(error => error === '')
})

watch(
  [isVerifyTokenFormValid, verifyTokenFormSubmitted], 
  ([isValid, submitted]) => {
    if (!submitted) return
   
     if (!isValid) {
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      // Clear warning and clean up state immediately when compliance is met
       if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  }, 
  { immediate: true }
)

async function handleVerifyToken() {

  isVerifyTokenFormLoading.value = true;
  startLoading()

  const outcome = await authStore.verifyAccount({
      username: username.value,
      password: password.value,
      token: tokenbits.value.join(''),
    });

  if (outcome.isFailure) {
    isVerifyTokenFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    return
  }

  emit('success');
  
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
  
  step.value = 'selection';
  resetProgress()
}

function triggerOAuth(provider: string) {
  if (!verificationId.value) {
    console.error("Cannot initiate OAuth: Verification ID is missing.")
    return;
  }

  // 1. Open popup with explicit verificationId parameter
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const oauthUrl = `${baseUrl}/api/auth/oauth/${provider.toLowerCase()}?verificationId=${encodeURIComponent(verificationId.value)}`

   console.error(`The third party authentication url is ${oauthUrl}`)

  window.open(oauthUrl, 'OAuthWindow', 'width=600,height=700')

  // 2. Poll using verificationId
  startPolling()
}

async function executePoll() {
  if (!isPolling.value) return

  // Timeout Check
  if (Date.now() - startTime.value > maxTimeoutMs) {
    isPolling.value = false
    setError(new APIError(408, 'Verification Timeout', 'Verification timed out. Please refresh and try again.'))
    return
  }

  try {
    const outcome = await authStore.verifyAccount({
      username: username.value,
      password: password.value,
      verificationId: verificationId.value
    })

    if (outcome.isFailure) {
      isPolling.value = false
      setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
      return
    }

    if (outcome.value === true) {
      isPolling.value = false
      emit('success')
      return
    }

    // Schedule next poll in 3 seconds if still active
    if (isPolling.value) {
      setTimeout(executePoll, 3000)
    }

  } catch (err) {
    isPolling.value = false
    console.error('Polling error:', err)
    setError(new APIError(0, 'Network Error', 'A connection error occurred. Please try again.'))
  }
}

function startPolling() {
  isPolling.value = true
  startTime.value = Date.now()
  executePoll()
}

function stopPolling() {
  if (pollingTimer.value !== null) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
  isPolling.value = false
}


onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  stopPolling()
});

</script>

<template>

    <div class="auth-card">

    <div class="auth-card__header">
        <div class="auth-card__header--logo">
         <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
        </div>
        <h1 class="auth-card__header--title">Sign Up</h1>
        <p class="auth-card__header--subtitle">to contribute inspiring tales & insights</p>
      </div>

      <FormProgress :progress="progressState" />

    <!-- STEP 1: Reserve Account Form -->
      <template v-if="step === 'register'">

         <form @submit.prevent="handleReserve" class="auth-card__form">

      <fieldset class="auth-card__form--group">
        <label class="auth-card__form--label">Enter a unique name that would be visible on all your contents. Use only alphabets, numbers, and underscore</label>
        <input
          v-model="username"
         class="auth-card__form--input"
          type="text"
          placeholder="Username"
          pattern="[a-zA-Z0-9_]+"
          required
        />
      </fieldset>

      <fieldset class="auth-card__form--group">
        <label class="auth-card__form--label">Add a secret you would use with your username to access your account</label>
        <input
          v-model="password"
          class="auth-card__form--input"
          type="password"
          placeholder="Password"
          required
        />
      </fieldset>

      <div class="auth-card__divider"><span></span></div>

      <!-- Cloudflare Turnstile / Captcha Divider -->

     <label class="auth-card__form--label">
        This website uses a security service to protect against malicious bots.
      </label>
    
      <div class="auth-card__captcha">

      <template v-if="captchaFailed">
        <div class="captcha-error-box">
          <p>{{ captchaErrorMessage || 'Security verification failed. Please try again.' }}</p>
          <button type="button" class="btn btn--secondary btn--sm" @click="resetCaptcha">
            Retry Security Check
          </button>
        </div>
      </template>

      <template v-else>
        <TurnstileWidget 
          :site-key="siteKey" 
          @success="handleCaptchaSuccess"
          @error="handleCaptchaError"
        />
      </template>

      </div>
      
      <button type="submit" class="auth-card__form--action" :disabled="isReserveAccountFormLoading">
        {{ isReserveAccountFormLoading ? 'Creating...' : 'Create Account' }}
      </button>

      <div class="auth-card__form--option">
          <span>Already have an account?</span>
           <RouterLink to="/login" title="Login">Log In</RouterLink>
        </div>

    </form>

      </template>
   

    <!-- STEP 2: Verify Email / Third-Party OAuth -->
      <template v-else-if="step === 'selection'">
         <div class="auth-form">
     
        <label class="auth-card__form--label">
        Congrats. Your account has been created. To ensure you can recover if you forget your password, you need to add an email address. This also activates your account.
      </label>
      <div class="auth-card__providers">
        <button type="button" class="auth-card__providers--btn" @click="triggerOAuth('Google')">
          <SvgIcons name="google" :size="30" /> Continue with Google (gmail)
        </button>
        <button type="button" class="auth-card__providers--btn microsoft" @click="triggerOAuth('Microsoft')">
          <SvgIcons name="microsoft" :size="30" /> Continue with Microsoft (hotmail, outlook, etc.)
        </button>
        <button type="button" class="auth-card__providers--btn apple" @click="triggerOAuth('Apple')">
          <SvgIcons name="apple" :size="30" /> Continue with Apple
        </button>
      </div>

       <div class="auth-card__divider"><span></span></div>

      <!-- Token Email Request -->
      <form @submit.prevent="handleSendToken"  class="auth-card__form">
        <fieldset class="auth-card__form--group">
          <label class="auth-card__form--label">You can optionally request a token via other email types</label>
          <input
            v-model="emailAddress"
            type="email"
             class="auth-card__form--input"
            placeholder="Email Address"
            required
          />
        </fieldset>
        <button type="submit" class="auth-card__form--action" :disabled="isLoading">
          Request Token
        </button>
      </form>

    </div>
    </template>
   
     <template v-else-if="step === 'verify'" >
    <div class="auth-form">
     
        
  <form @submit.prevent="handleVerifyToken" class="otp-form">
    <div class="auth-card__tokenbits">
      <input
        v-for="(_, index) in 6"
        :key="index"
        ref="inputs"
        v-model="tokenbits[index]"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        class="auth-card__tokenbits--box"
        @input="handleInput($event, index)"
        @keydown="handleKeyDown($event, index)"
      />
    </div>

       <button type="submit" class="auth-card__form--action" :disabled="isVerifyTokenFormLoading">
        {{ isVerifyTokenFormLoading ? 'Submitting...' : 'Verify Token' }}
      </button>

      <div class="auth-card__form--option">
          <span>Didn't receive the token?</span>
           <button 
          type="button" 
          :disabled="!canResendToken"
          @click="handleResendRequest"
        >
          Resend <span v-if="countdownTimer > 0">in {{ countdownTimer }} seconds</span>
        </button>
        </div>

  </form>
      
    </div>
    </template>


    </div>

</template>

<style scoped lang="less">
@import "@/assets/css/auth-card.less";


.captcha-wrapper {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
  border-top: 1px solid #e2e8f0;

  .circle-node {
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #cbd5e0;
  }

  .captcha-label {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #4a5568;
  }

  .captcha-box {
    margin-top: 0.5rem;
    background: #edf2f7;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid #cbd5e0;
  }
}

</style>