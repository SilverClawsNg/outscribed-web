
<script setup lang="ts">
import { ref, reactive, computed, onUnmounted, watch } from 'vue';
import { useAuthenticationStore } from '../stores/AuthenticationStore';
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { APIError } from '@/api/apiTypes'
import HelpIcon from '@/components/HelpIcon.vue'
import { isValidEmail } from '@/utils/validators'

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'logIn'): void
}>();

const props = defineProps<{
    isPage?: boolean
    message?: string
}>()

const authStore = useAuthenticationStore();

const step = ref<'request' | 'reset'>('request');
const emailAddress = ref('');
const newPassword = ref('');
const isResend = ref(false);
const canResendToken = ref(false)
const countdownTimer = ref(0)

const captchaToken = ref<string | null>(null)
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)
const captchaFailed = ref(false)
const captchaErrorMessage = ref<string>('')

const { progressState, startLoading, setSuccess, setError, setWarning, resetProgress } = useFormProgress()
const passwordVisible = ref(false)

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

//const otpDigits = reactive<string[]>(Array(6).fill(''));
const timer = ref(67);
let timerInterval: number | null = null;

const inputs = ref<HTMLInputElement[]>([])
const tokenbits = ref<string[]>(['', '', '', '', '', ''])

// 1. Tracks whether the user has at least attempted to submit the form once
const sendTokenFormSubmitted = ref(false)
const resetPasswordFormSubmitted = ref(false)

const isSendTokenFormLoading = ref(false)
const isResetPasswordFormLoading = ref(false)

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
  startLoading()

  const outcome = await authStore.sendToken({
      emailAddress: emailAddress.value,
      type: 2,
      isResend: isResend.value,
      captchaToken: captchaToken.value
    });

    isSendTokenFormLoading.value = false

  if (outcome.isFailure) {
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again.'))
  } else{
      startResendTimer()
      inputs.value[0]?.focus()
      step.value = 'reset';
      resetProgress()
  }
   
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
const resetPasswordFormValidationErrors = computed(() => {

  const passwordText = newPassword.value || '';

  return {
  
    tokenbits: tokenbits.value.some(bit => !bit)
      ? 'All token fields are required'
      : '',

      password: passwordText === '' || passwordText.length < 8
      ? 'Enter a valid password'
      : ''
  }
  
})

// 3. Form is valid if all computed error fields are empty strings
const isResetPasswordFormValid = computed(() => {
  return Object.values(resetPasswordFormValidationErrors.value).every(error => error === '')
})

watch(
  [isResetPasswordFormValid, resetPasswordFormSubmitted], 
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

async function handleResetPassword() {

  isResetPasswordFormLoading.value = true;
  startLoading()

  const outcome = await authStore.resetPassword({
      emailAddress: emailAddress.value,
      password: newPassword.value,
      token: tokenbits.value.join(''),
    });

  if (outcome.isFailure) {
    isResetPasswordFormLoading.value = false
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
  isResend.value = true;
  step.value = 'request';
  resetProgress()
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

</script>

<template>

 <div class="auth-card">

    <div class="auth-card__header">
        <div v-if="isPage" class="auth-card__header--logo">
         <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
        </div>
        <h1 class="auth-card__header--title">Reset </h1>
       <p class="auth-card__header--subtitle">{{ message }}</p>
        <HelpIcon topic="ResetPassword" />
    </div>

    <FormProgress :progress="progressState" />

    <!-- STEP 1: Request One-Time Password Token -->
    <template v-if="step === 'request'">

    <form @submit.prevent="handleSendToken" class="auth-card__form">
      
      <fieldset class="auth-card__form--group">
        <label class="auth-card__form--label">Enter your email address. We would send you a recovery token</label>
        <input
          v-model="emailAddress"
          class="auth-card__form--input"
          type="email"
          placeholder="Email address"
          required
        />
      </fieldset>

      <div class="divider-multi"><span></span></div>

      <!-- Cloudflare Turnstile / Captcha Divider -->

     <label class="auth-card__form--label">
        This website uses a security service to protect against malicious bots.
     </label>

      <div class="auth-card__captcha">

      <template v-if="captchaFailed">
        <p class="auth-card__captcha--error">{{ captchaErrorMessage || 'Security check failed. Ensure you are connected to the Internet before trying again.' }}
              <button type="button" @click="resetCaptcha">
            retry security check
          </button> or refresh page and try again.
          </p>
      </template>

      <template v-else>
        <TurnstileWidget 
          :site-key="siteKey" 
          @success="handleCaptchaSuccess"
          @error="handleCaptchaError"
        />
      </template>

      </div>

        <button type="submit" class="auth-card__form--action" 
        :disabled="isSendTokenFormLoading">
           {{ isSendTokenFormLoading ? 'Requesting...' : 'Request Token' }}
        </button>
    
      <div class="auth-card__form--option">
          <span>Remember your password?</span>
           <button type="button" @click="emit('logIn')" title="Login">Log In</button>
        </div>

    </form>

     </template>
     
    <!-- STEP 2: Input OTP & Set New Password -->
      <template v-else-if="step === 'reset'">

    <form @submit.prevent="handleResetPassword" class="auth-form">

      <label class="form-instruction">
        Enter the token sent to <strong>{{ emailAddress }}</strong>
      </label>

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
        <p v-if="resetPasswordFormSubmitted && resetPasswordFormValidationErrors.tokenbits" class="auth-card__form--error">
        {{ resetPasswordFormValidationErrors.tokenbits }}
         </p>
    </div>

      <fieldset class="auth-card__form--group">
         <label class="auth-card__form--label">
          Enter your new secret. You may find it easier to remember a sentence than a series of cryptic letters
        </label>
        <div class="auth-card__form--password-wrapper">
         <button 
          type="button" 
          class="auth-card__form--show-password"
          @click="passwordVisible = !passwordVisible"
        >
          👁️
        </button>
        <input
          v-model="newPassword"
          class="auth-card__form--input"
          :type="passwordVisible ? 'text' : 'password'" 
          placeholder="Password"
          required
        />
       </div>
      </fieldset>

       <button type="submit" class="auth-card__form--action" :disabled="isResetPasswordFormLoading">
        {{ isResetPasswordFormLoading ? 'Resetting...' : 'Reset Password' }}
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

     </template>
     
  </div>

</template>

<style scoped lang="less">
@import "@/assets/css/auth-card.less";
</style>