<script setup lang="ts">
import { ref, reactive, onUnmounted, watch, computed } from 'vue';
import { useAuthenticationStore } from '../stores/AuthenticationStore';
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { APIError } from '@/api/apiTypes'
import { isValidEmail } from '@/utils/validators'
import SvgIcons from '@/components/SvgIcons.vue'
import HelpIcon from '@/components/HelpIcon.vue'

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'logIn'): void
}>();

const props = defineProps<{
    isPage?: boolean
    message?: string
}>()

const authStore = useAuthenticationStore();

// 🎯 Step sequence: Selection -> Verify (if token) -> Handle (Final Setup)
const step = ref<'selection' | 'verify' | 'handle'>('selection');

const emailAddress = ref('')
const username = ref('')
const password = ref('')
const passwordVisible = ref(false)
const captchaToken = ref<string | null>(null)
const verificationId = ref<string | null>(null)
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)
const captchaFailed = ref(false)
const captchaErrorMessage = ref<string>('')
const isResend = ref(false);

const inputs = ref<HTMLInputElement[]>([])
const tokenbits = ref<string[]>(['', '', '', '', '', ''])
let timerInterval: number | null = null
const countdownTimer = ref(0)
const canResendToken = ref(false)
const maxTimeoutMs = 60000 
const startTime = ref<number>(0)
const isPolling = ref(false)
let pollingTimer: number | null = null

const sendTokenFormSubmitted = ref(false)
const verifyTokenFormSubmitted = ref(false)
const finalizeAccountFormSubmitted = ref(false)

const isSendTokenFormLoading = ref(false)
const isVerifyTokenFormLoading = ref(false)
const isFinalizeAccountFormLoading = ref(false)

const { progressState, startLoading, setSuccess, setError, setWarning, resetProgress } = useFormProgress()

function handleCaptchaSuccess(token: string) {
  captchaToken.value = token
  captchaFailed.value = false
}

function handleCaptchaError() {
  captchaToken.value = null
  captchaFailed.value = true
}

function resetCaptcha() {
  captchaToken.value = null
  captchaFailed.value = false
}

// --- 1. TOKEN SEND FORM VALIDATION ---
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
    } else if (progressState.value.type === 'Warning') {
      resetProgress()
    }
  }, 
  { immediate: true }
)

// --- 2. HANDLE / PASSWORD FORM VALIDATION ---
const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{0,18}[a-zA-Z0-9])?$/;

const finalizeAccountFormValidationErrors = computed(() => {
  const usernameText = username.value || '';
  const passwordText = password.value || '';
  let usernameError = '';

  if (usernameText === '') {
    usernameError = 'Handle is required.';
  } else if (usernameText.length < 2 || usernameText.length > 20) {
    usernameError = 'Handle must be between 2 and 20 characters.';
  } else if (!USERNAME_REGEX.test(usernameText)) {
    if (usernameText.includes(' ')) {
      usernameError = 'Handle cannot contain spaces.';
    } else if (usernameText.includes('@')) {
      usernameError = 'Do not include the @ symbol.';
    } else {
      usernameError = 'Only letters, numbers, underscores (_), and hyphens (-) are allowed.';
    }
  }

  return {
    username: usernameError,
    password: passwordText === '' || passwordText.length < 8
      ? 'Enter a password of at least 8 characters'
      : ''
  }
})

const isFinalizeAccountFormValid = computed(() => {
  return Object.values(finalizeAccountFormValidationErrors.value).every(error => error === '')
})

watch(
  [isFinalizeAccountFormValid, finalizeAccountFormSubmitted], 
  ([isValid, submitted]) => {
    if (!submitted) return
    if (!isValid) {
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else if (progressState.value.type === 'Warning') {
      resetProgress()
    }
  }, 
  { immediate: true }
)

// --- OAUTH FLOW WITH TRANSACTION ID ---
async function triggerOAuth(provider: string) {
  const transactionId = crypto.randomUUID()
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const oauthUrl = `${baseUrl}/api/auth/oauth/${provider.toLowerCase()}?transactionId=${encodeURIComponent(transactionId)}`

  window.open(oauthUrl, 'OAuthWindow', 'width=600,height=700')
  startPollingForVerification(transactionId)
}

function startPollingForVerification(transactionId: string) {
  isPolling.value = true
  startLoading()
  startTime.value = Date.now()

  executePoll(transactionId)
}

async function executePoll(incomingTransactionId: string) {
  if (!isPolling.value || incomingTransactionId == null) return

  
  if (Date.now() - startTime.value > maxTimeoutMs) {
    stopPolling()
    setError(new APIError(408, 'Verification Timeout', 'Verification timed out. Please try again.'))
    return
  }

  try {

    const outcome = await authStore.poll({
      transactionId: incomingTransactionId
      });

    if (outcome.isFailure) {
      stopPolling()
      setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
      return
    }

    if (outcome.value) {
      stopPolling()
      verificationId.value = outcome.value
      // Transition to final Handle setup step
      step.value = 'handle'
      resetProgress()
      return
    }

    if (isPolling.value) {
      pollingTimer = window.setTimeout(() => executePoll(incomingTransactionId), 3000)
    }
  } catch (err) {
    stopPolling()
    console.log(`${err}`)
    setError(new APIError(0, 'Network Error', 'A connection error occurred.'))
  }
}

function stopPolling() {
  if (pollingTimer !== null) {
    clearTimeout(pollingTimer)
    pollingTimer = null
  }
  isPolling.value = false
  resetProgress()
}

// --- TOKEN FLOW ACTIONS ---
async function handleSendToken() {
  if (!captchaToken.value) {
    captchaFailed.value = true
    captchaErrorMessage.value = 'Please complete the security check.'
    return
  }

  isSendTokenFormLoading.value = true
  sendTokenFormSubmitted.value = true
  startLoading()

  const outcome = await authStore.sendToken({
    emailAddress: emailAddress.value,
    captchaToken: captchaToken.value,
    type: 1,
    isResend: isResend.value
  });

  isSendTokenFormLoading.value = false

  if (outcome.isFailure) {
    setError(outcome.error ?? new APIError(0, 'Server Error', 'Failed to send token.'))
  } else {
    verificationId.value = outcome.value // Backend returns verificationId
    startResendTimer()
    inputs.value[0]?.focus()
    step.value = 'verify'
    resetProgress()
  }
}


function handleResendToken() {
  if (timerInterval) clearInterval(timerInterval)
   isResend.value = true;
  step.value = 'selection';
  resetProgress()
}


function handleInput(e: Event, index: number) {
  const target = e.target as HTMLInputElement
  if (!target || !target.value) return
  if (index >= 0 && index < tokenbits.value.length) {
    tokenbits.value[index] = target.value[0] || ''
  }
  if (index < 5) {
    inputs.value[index + 1]?.focus()
  }
}

function handleKeyDown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace' && index > 0 && tokenbits.value[index] === '') {
    tokenbits.value[index - 1] = ''
    inputs.value[index - 1]?.focus()
  }
}

async function handleVerifyToken() {

if(!verificationId) return;

  isVerifyTokenFormLoading.value = true
  verifyTokenFormSubmitted.value = true
  startLoading()

  const outcome = await authStore.verifyToken({
    verificationId: verificationId.value,
    token: tokenbits.value.join('')
  })

  isVerifyTokenFormLoading.value = false

  if (outcome.isFailure) {
    setError(outcome.error ?? new APIError(0, 'Token Error', 'Invalid or expired token.'))
    return
  }

  // Token is verified -> Transition to Choose Handle step
  step.value = 'handle'
  resetProgress()
}

// --- FINAL ACCOUNT CREATION (CHOOSE HANDLE) ---
async function handleFinalizeAccount() {
  isFinalizeAccountFormLoading.value = true
  finalizeAccountFormSubmitted.value = true
  startLoading()

  const outcome = await authStore.register({
    verificationId: verificationId.value,
    username: username.value,
    password: password.value
  })

  if (outcome.isFailure) {
    isFinalizeAccountFormLoading.value = false
    setError(outcome.error ?? new APIError(0, 'Server Error', 'Failed to complete account setup.'))
    return
  }

  emit('success')
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

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  stopPolling()
});
</script>

<template>
  <div class="auth-card">
    <div class="auth-card__header">
      <div v-if="isPage" class="auth-card__header--logo">
        <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
      </div>
      <h1 class="auth-card__header--title">Sign Up</h1>
      <p class="auth-card__header--subtitle">{{ message }}</p>
      <HelpIcon topic="CreateAccount" />
    </div>

    <FormProgress :progress="progressState" />

    <!-- STEP 1: SELECTION (OAuth or Email + Captcha) -->
    <template v-if="step === 'selection'">
      <div class="auth-card__providers">
        <button type="button" class="auth-card__providers--btn" :disabled="isPolling" @click="triggerOAuth('Google')">
          <SvgIcons name="google" :size="30" /> Continue with Google
        </button>
        <button type="button" class="auth-card__providers--btn microsoft" :disabled="isPolling" @click="triggerOAuth('Microsoft')">
          <SvgIcons name="microsoft" :size="30" /> Continue with Microsoft
        </button>
        <button type="button" class="auth-card__providers--btn apple" :disabled="isPolling" @click="triggerOAuth('Apple')">
          <SvgIcons name="apple" :size="30" /> Continue with Apple
        </button>
      </div>

      <div class="divider-multi"><span></span></div>

      <form @submit.prevent="handleSendToken" class="auth-card__form">
        <fieldset class="auth-card__form--group">
          <label class="auth-card__form--label">OR enter your email address to receive a verification token</label>
          <input
            v-model="emailAddress"
            type="email"
            class="auth-card__form--input"
            placeholder="Email Address"
            required
          />
          <p v-if="sendTokenFormSubmitted && sendTokenFormValidationErrors.email" class="auth-card__form--error">
            {{ sendTokenFormValidationErrors.email }}
          </p>
        </fieldset>

        <!-- Captcha required specifically for Token generation route -->
        <div class="auth-card__captcha">
          <template v-if="captchaFailed">
            <p class="auth-card__captcha--error">
              {{ captchaErrorMessage || 'Security check failed.' }}
              <button type="button" @click="resetCaptcha">retry</button>
            </p>
          </template>
          <template v-else>
            <TurnstileWidget :site-key="siteKey" @success="handleCaptchaSuccess" @error="handleCaptchaError" />
          </template>
        </div>

        <button type="submit" class="auth-card__form--action" :disabled="isSendTokenFormLoading || isPolling">
          {{ isSendTokenFormLoading ? 'Sending Token...' : 'Request Token' }}
        </button>

        <div class="auth-card__form--option">
          <span>Already an OutScriber?</span>
          <button type="button" @click="emit('logIn')">Log In</button>
        </div>
      </form>
    </template>

    <!-- STEP 2: VERIFY TOKEN -->
    <template v-else-if="step === 'verify'">
      <form @submit.prevent="handleVerifyToken" class="otp-form">
        <label class="auth-card__form--label">
          Enter the 6-digit token sent to your email inbox (check spam if needed).
        </label>

        <div class="auth-card__tokenbits">
          <input
            v-for="(_, index) in 6"
            :key="index"
            ref="inputs"
            v-model="tokenbits[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="auth-card__tokenbits--box"
            @input="handleInput($event, index)"
            @keydown="handleKeyDown($event, index)"
          />
        </div>

        <button type="submit" class="auth-card__form--action" :disabled="isVerifyTokenFormLoading">
          {{ isVerifyTokenFormLoading ? 'Verifying...' : 'Verify Token' }}
        </button>

        <div class="auth-card__form--option">
          <span>Didn't receive the token?</span>
          <button type="button" :disabled="!canResendToken" @click="handleResendToken">
            Resend <span v-if="countdownTimer > 0">in {{ countdownTimer }}s</span>
          </button>
        </div>
      </form>
    </template>

    <!-- STEP 3: CHOOSE HANDLE (Finalize Account Setup) -->
    <template v-else-if="step === 'handle'">
      <form @submit.prevent="handleFinalizeAccount" class="auth-card__form">
        <label class="auth-card__form--label">
          Your identity is verified! Now, choose a unique handle and password to complete your account.
        </label>

        <fieldset class="auth-card__form--group">
          <label class="auth-card__form--label">Visible handle on all your content (letters, numbers, underscores)</label>
          <input
            v-model="username"
            class="auth-card__form--input"
            type="text"
            placeholder="Choose Handle (e.g. shadows)"
            required
          />
          <p v-if="finalizeAccountFormSubmitted && finalizeAccountFormValidationErrors.username" class="auth-card__form--error">
            {{ finalizeAccountFormValidationErrors.username }}
          </p>
        </fieldset>

        <fieldset class="auth-card__form--group">
          <label class="auth-card__form--label">Add a secure password</label>
          <div class="auth-card__form--password-wrapper">
            <button type="button" class="auth-card__form--show-password" @click="passwordVisible = !passwordVisible">
              👁️
            </button>
            <input
              v-model="password"
              class="auth-card__form--input"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="Password"
              required
            />
          </div>
          <p v-if="finalizeAccountFormSubmitted && finalizeAccountFormValidationErrors.password" class="auth-card__form--error">
            {{ finalizeAccountFormValidationErrors.password }}
          </p>
        </fieldset>

        <button type="submit" class="auth-card__form--action" :disabled="isFinalizeAccountFormLoading">
          {{ isFinalizeAccountFormLoading ? 'Creating Account...' : 'Complete Registration' }}
        </button>
      </form>
    </template>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/auth-card.less";
</style>