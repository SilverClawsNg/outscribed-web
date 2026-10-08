
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthenticationStore } from '../stores/AuthenticationStore';
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { APIError } from '@/api/apiTypes'

const emit = defineEmits<{
  (e: 'success', data?: any): void;
  (e: 'switch-to-register'): void;
}>();

const authStore = useAuthenticationStore();

const { progressState, startLoading, setSuccess, setError, setWarning, resetProgress } = useFormProgress()
const isFormLoading = ref(false)

const step = ref<'login' | 'verify'>('login');
const loading = ref(false);
const isResend = ref(false);

const captchaToken = ref<string | null>(null)
const verificationId = ref('')
const email = ref('')

const form = reactive({
  username: '',
  password: '',
});

const verifyForm = reactive({
  email: '',
  captchaVerified: false,
});

async function handleLogin() {
  loading.value = true;
  try {
    const response = await authStore.login({
      username: form.username,
      password: form.password,
    });

    if (response && response.value) {
      step.value = 'verify';
    } else {
      emit('success', response);
    }
  } catch (err: any) {
    alert(err?.message || 'Login failed');
  } finally {
    loading.value = false;
  }
}

async function handleSendTokenWithCaptcha() {
  if (!verifyForm.captchaVerified) return;
  isResend.value = true;
  loading.value = true;
  try {
    await authStore.sendToken({
      emailAddress: email.value,
      verificationId: verificationId.value,
      type: 2,
      isResend: isResend.value,
      CaptchaToken: captchaToken.value
    });
    alert('Token sent! Please check your email.');
  } catch (err: any) {
    alert(err?.message || 'Failed to send token');
  } finally {
    loading.value = false;
  }
}

function startOAuth(provider: string) {
  window.open(`/api/auth/external/${provider.toLowerCase()}`, '_blank');
}
</script>

<template>

  <div class="auth-card">

     <div class="auth-card__header">
        <div class="auth-card__header--logo">
         <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
        </div>
        <h1 class="auth-card__header--title">Log In</h1>
        <p class="auth-card__header--subtitle">to access your account</p>
      </div>

    <!-- FORM 1: Standard Login -->

    <FormProgress :progress="progressState" />
   
    <template v-if="step === 'login'">

    <form @submit.prevent="handleLogin" class="auth-card__form">

      <fieldset class="auth-card__form--group">
        <label class="auth-card__form--label">Enter your username</label>
        <input
          v-model="form.username"
         class="auth-card__form--input"
          type="text"
          placeholder="Username"
          pattern="[a-zA-Z0-9_]+"
          required
        />
      </fieldset>

      <fieldset class="auth-card__form--group">
        <label class="auth-card__form--label">Enter your password. <RouterLink to="/reset" title="Reset Password">Did you forget it?</RouterLink></label>
        <input
          v-model="form.password"
          class="auth-card__form--input"
          type="password"
          placeholder="Password"
          required
        />
      </fieldset>

      <button type="submit" class="auth-card__form--action" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Log In' }}
      </button>

      <div class="auth-card__form--option">
          <span>Don't have an account yet?</span>
           <RouterLink to="/register" title="Register">Create one now</RouterLink>
        </div>

    </form>

    </template>
     
    <!-- FORM 2: Unverified Account Verification Trigger (SendTokenWithCaptcha) -->
    <div v-else-if="step === 'verify'" class="auth-form">

      <p class="form-instruction bold">
        Hi @{{ form.username }}, we noticed your account has not been activated. This is likely because you have not added an email for password recovery. You can do so now.
      </p>

      <div class="oauth-providers">
        <button type="button" class="oauth-btn" @click="startOAuth('Google')">
          <img src="" alt="" /> Continue with Google (gmail)
        </button>
        <button type="button" class="oauth-btn" @click="startOAuth('Microsoft')">
          <img src="" alt="" /> Continue with Microsoft (Hotmail, outlook, etc.)
        </button>
        <button type="button" class="oauth-btn" @click="startOAuth('Apple')">
          <img src="" alt="" /> Continue with Apple
        </button>
      </div>

      <div class="captcha-wrapper">
        <span class="circle-node"></span>
        <p class="captcha-label">Other mails? Enter email address to receive a token</p>
      </div>

      <form @submit.prevent="handleSendTokenWithCaptcha" class="sub-form">
        <div class="form-group">
          <input
            v-model="verifyForm.email"
            type="email"
            placeholder="Email Address"
            required
          />
        </div>

        <div class="captcha-box">
          <input type="checkbox" id="login-captcha" v-model="verifyForm.captchaVerified" required />
          <label for="login-captcha">I am Human</label>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">Send Token</button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/auth-card.less";

.captcha-box {
  margin: 1rem 0;
  background: #edf2f7;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #cbd5e0;
}

.oauth-providers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .oauth-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    font-size: 0.95rem;
    cursor: pointer;
    &:hover { background: #f7fafc; }
    img { width: 20px; height: 20px; }
  }
}
</style>