
<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue';
import { useAuthenticationStore } from '../stores/AuthenticationStore';
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { APIError } from '@/api/apiTypes'

const emit = defineEmits<{ (e: 'success'): void }>();
const authStore = useAuthenticationStore();

const step = ref<'request' | 'reset'>('request');
const loading = ref(false);
const email = ref('');
const captchaVerified = ref(false);
const newPassword = ref('');
const confirm = ref(false);
const isResend = ref(false);

const captchaToken = ref<string | null>(null)
const verificationId = ref('')
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)
const captchaFailed = ref(false)
const captchaErrorMessage = ref<string>('')

const { progressState, startLoading, setSuccess, setError, setWarning, resetProgress } = useFormProgress()
const isFormLoading = ref(false)

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


const otpDigits = reactive<string[]>(Array(6).fill(''));
const timer = ref(67);
let timerInterval: number | null = null;

const fullToken = computed(() => otpDigits.join(''));

async function handleRequestReset() {
  if (!captchaVerified.value) return;
  isResend.value = true;
  loading.value = true;
  try {
    await authStore.sendToken({   
     emailAddress: email.value,
      verificationId: verificationId.value,
      type: 2,
      isResend: isResend.value,
      CaptchaToken: captchaToken.value });
    step.value = 'reset';
    startTimer();
  } catch (err: any) {
    alert(err?.message || 'Error requesting token');
  } finally {
    loading.value = false;
  }
}

async function handlePerformReset() {
  if (fullToken.value.length < 6) {
    alert('Please enter all 6 digits');
    return;
  }
  loading.value = true;
  try {
    await authStore.resetPassword({
      verificationId: verificationId.value,
      confirm: confirm.value,
      password: newPassword.value,
    });
    alert('Password reset successful! You can now log in.');
    emit('success');
  } catch (err: any) {
    alert(err?.message || 'Password reset failed');
  } finally {
    loading.value = false;
  }
}

function onPinInput(idx: number, event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.value && idx < 5) {
    const nextInput = document.getElementById(`pin-${idx + 1}`);
    nextInput?.focus();
  }
}

function onPinDelete(idx: number, event: KeyboardEvent) {
  if (!otpDigits[idx] && idx > 0) {
    const prevInput = document.getElementById(`pin-${idx - 1}`);
    prevInput?.focus();
  }
}

function startTimer() {
  timer.value = 67;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = window.setInterval(() => {
    if (timer.value > 0) timer.value--;
    else clearInterval(timerInterval!);
  }, 1000);
}

function resendToken() {
  handleRequestReset();
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
<template>
 <div class="auth-card">

     <div class="auth-card__header">
        <div class="auth-card__header--logo">
         <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
        </div>
        <h1 class="auth-card__header--title">Reset </h1>
        <p class="auth-card__header--subtitle">to update your login details</p>
      </div>

      <FormProgress :progress="progressState" />

    <!-- STEP 1: Request One-Time Password Token -->
     <template v-if="step === 'request'">

    <form @submit.prevent="handleRequestReset" class="auth-form">
      
      <fieldset class="auth-card__form--group">
        <label class="auth-card__form--label">Enter your email address. We would send you a recovery token</label>
        <input
          v-model="email"
          class="auth-card__form--input"
          type="email"
          placeholder="Email address"
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
    
      <button type="submit" class="auth-card__form--action" :disabled="loading">
        {{ loading ? 'Creating...' : 'Create Account' }}
      </button>

      <div class="auth-card__form--option">
          <span>Remember your password?</span>
           <RouterLink to="/login" title="Login">Log In</RouterLink>
        </div>

    </form>

     </template>
     
    <!-- STEP 2: Input OTP & Set New Password -->
      <template v-else-if="step === 'reset'">

    <form @submit.prevent="handlePerformReset" class="auth-form">
      <p class="form-instruction">
        Enter the one-time password sent to <strong>{{ email }}</strong>
      </p>

      <!-- 6-Digit Code Input Boxes -->
      <div class="pin-inputs">
        <input
          v-for="(digit, idx) in 6"
          :key="idx"
          :id="`pin-${idx}`"
          v-model="otpDigits[idx]"
          type="text"
          maxlength="1"
          class="pin-box"
          @input="onPinInput(idx, $event)"
          @keydown.delete="onPinDelete(idx, $event)"
        />
      </div>

      <p class="form-instruction">
        Enter your new secret. You may find it easier to remember a sentence than a series of cryptic letters
      </p>

      <div class="form-group">
        <input
          v-model="newPassword"
          type="password"
          placeholder="Password"
          required
        />
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">Reset Password</button>

      <!-- Resend Counter -->
      <p class="resend-text">
        Didn't receive the one-time password?
        <button
          type="button"
          class="resend-btn"
          :disabled="timer > 0"
          @click="resendToken"
        >
          Resend
        </button>
        <span v-if="timer > 0"> in {{ timer }} seconds...</span>
      </p>
    </form>
     </template>
     
  </div>
</template>


<style scoped lang="less">
@import "@/assets/css/auth-card.less";

.pin-inputs {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;

  .pin-box {
    width: 48px;
    height: 52px;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    border: 1px solid #a0aec0;
    border-radius: 8px;
    &:focus { border-color: #0070f3; outline: none; }
  }
}

.resend-text {
  text-align: center;
  font-size: 0.9rem;
  color: #4a5568;

  .resend-btn {
    background: none;
    border: none;
    color: #0070f3;
    font-weight: 600;
    cursor: pointer;
    &:disabled { color: #a0aec0; cursor: not-allowed; }
  }
}

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