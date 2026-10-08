<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useFormProgress } from '@/composables/useFormProgress'
import { APIError } from '@/api/apiTypes'
import HelpIcon from '@/components/HelpIcon.vue'
import LoginRegister from './LoginRegisterComponent.vue'
import Captcha from './CaptchaComponent.vue'
import AddToken from './AddTokenComponent.vue'
import SendToken from './SendTokenComponent.vue'

interface Props {
  isPage?: boolean
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  isPage: true,
  message: ''
})

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'forgotPassword'): void
}>()

const authStore = useAuthStore()

type ActivePanel = 'login-register' |'sendtoken' | 'verifytoken'
const activePanel = ref<ActivePanel>('login-register')
const verificationId = ref<string | null>(null)
const username = ref<string | null>(null)
const password = ref<string | null>(null)
const emailAddress = ref('')
const captchaState = ref<string>('READY')
const captchaErrorMessage = ref<string>('')

const { progressState, startLoading, setSuccess, setError, setWarning, resetProgress } = useFormProgress()
const isFormLoading = ref(false)
const hasSentToken = ref(false)

const countdownTimer = ref(0)
const canResendToken = ref(false)
let timerInterval: number | null = null

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

async function switchPanel(panel: ActivePanel) {
  activePanel.value = panel
  resetProgress()
  await nextTick()
}

const isPolling = ref(false)
const pollingTimer = ref<number | null>(null)


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

function startPolling() {
  if (pollingTimer.value !== null) clearInterval(pollingTimer.value)

  pollingTimer.value = window.setInterval(async () => {
    try {

    const outcome = await authStore.verifyAccount({
        username: username.value,
        password: password.value,
        verificationId: verificationId.value
      })

      // 1. Terminal Error -> Halt polling and show error
      if (outcome.isFailure) {
        stopPolling()
        setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
        return
      }

      // 2. Success -> Stop polling and notify parent component
      if (outcome.value === true) {
        stopPolling()
        emit('success')
      }

    } catch (err) {
      console.error('Polling error:', err)
    }
  }, 3000)
}

function stopPolling() {
  if (pollingTimer.value !== null) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
  isPolling.value = false
}

async function handleLogin(payload: { username: string; password: string }) {

  username.value = payload.username
  password.value = payload.password

  startLoading()
  isFormLoading.value = true

  const outcome = await authStore.login({
    username: payload.username,
    password: payload.password
  })

  isFormLoading.value = false

   if (outcome.isFailure) {
      setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
      return
    }

     console.log("Outside Returning from login");

    if(outcome.value){
      verificationId.value = outcome.value;
      
       console.log("Returning from login");
      switchPanel('sendtoken')

     

      return;
    }

  emit('success')
}


async function handleReserve(payload: { username: string; password: string; captchaToken:string }) {


   username.value = payload.username;
    password.value = payload.password;

  isFormLoading.value = true
  startLoading()



  const outcome = await authStore.reserveAccount({
    username: payload.username,
    password: payload.password,
    captchaToken: payload.captchaToken
  })

  isFormLoading.value = false

  if (outcome.isFailure) {
    if (outcome.error?.title === 'Captcha Error') {
      captchaState.value = 'FAILED'
      captchaErrorMessage.value = 'Captcha validation failed on server. Please re-verify.'
    } else {
      setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    }
    return
  }

      verificationId.value = outcome.value

  await switchPanel('sendtoken')
}

function handleCaptchaReset() {
  captchaState.value = 'READY'
  captchaErrorMessage.value = ''
}

async function onEmailSubmitted(email: string) {
  isFormLoading.value = true
  emailAddress.value = email
  startLoading()

      if (!hasSentToken.value) {
    const outcome = await authStore.sendToken({ verificationId: verificationId.value ?? '', emailAddress: email, type: 1 })
    isFormLoading.value = false
    hasSentToken.value = true

    if (outcome.isFailure) {
      setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
      return
    }

    setSuccess('Verification token sent successfully.')
    await switchPanel('verifytoken')
    startResendTimer()
  } else {
    const outcome = await authStore.resendToken({
      verificationId: verificationId.value  ?? '',
      emailAddress: email,
      type: 1
    })
    isFormLoading.value = false

    if (outcome.isFailure) {
      setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
      return
    }

    setSuccess('A new verification token has been sent.')
    await switchPanel('verifytoken')
    startResendTimer()
  }
 
}

function handleResendRequest() {
  if (timerInterval) clearInterval(timerInterval)
  switchPanel('sendtoken')
}

async function onTokenVerified(otpToken: string) {
  isFormLoading.value = true
  startLoading()

  const outcome = await authStore.createAccess({
    verificationId: verificationId.value,
    username: username.value,
    token: otpToken,
    password: password.value
  })

  isFormLoading.value = false

  if (outcome.isFailure) {
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred.'))
    return
  }

  emit('success')
}

onMounted(() => {
  resetProgress()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
   stopPolling()
})
</script>

<template>
  <div class="form-container" :class="{ 'boxed': isPage }">
    <!-- PANEL 1: LOGIN / REGISTER -->
    <div
      v-show="activePanel === 'login-register'"
      id="panel-login"
      role="tabpanel"
    >
      <div class="form-header">
        <template v-if="isPage">
          <h1 class="form-title">Becoming an OutScriber</h1>
        </template>
        <p v-if="props.message" class="context-message">{{ props.message }}</p>
        <h2>Enter a username and password to become an OutScriber or log back into your account</h2>
        <HelpIcon topic="CreateAccount" />
      </div>

      <LoginRegister
        :is-loading="isFormLoading"
        :captcha-error-message="captchaErrorMessage"
        @submit-login="handleLogin"
        @submit-reserve="handleReserve"
        @warning="setWarning"
      />

      <div class="form-options">
        <p class="switch-prompt">
          Forgotten password?
          <RouterLink v-if="isPage" to="/reset" title="Reset password">Start recovery</RouterLink>
          <button v-else type="button" class="btn-link" @click="emit('forgotPassword')">Start recovery</button>
        </p>
      </div>
    </div>

    <!-- PANEL 3: SEND / RESEND TOKEN EMAIL -->
     <!-- PANEL 3: SEND TOKEN & OAUTH SUITE -->
  <div v-show="activePanel === 'sendtoken'" id="panel-send-token" role="tabpanel">
    <div class="oauth-section">
      <p class="oauth-title">Fast-track with social account</p>
      
      <div class="oauth-stack">
        <button type="button" class="btn btn-oauth google" @click="triggerOAuth('Google')">
          <svg class="oauth-icon" viewBox="0 0 24 24"><!-- Google SVG --></svg>
          Continue with Google
        </button>

        <button type="button" class="btn btn-oauth apple" @click="triggerOAuth('Apple')">
          <svg class="oauth-icon" viewBox="0 0 24 24"><!-- Apple SVG --></svg>
          Continue with Apple
        </button>

        <button type="button" class="btn btn-oauth microsoft" @click="triggerOAuth('Microsoft')">
          <svg class="oauth-icon" viewBox="0 0 24 24"><!-- Microsoft SVG --></svg>
          Continue with Microsoft
        </button>

        <button type="button" class="btn btn-oauth facebook" @click="triggerOAuth('Facebook')">
          <svg class="oauth-icon" viewBox="0 0 24 24"><!-- Facebook SVG --></svg>
          Continue with Facebook
        </button>
      </div>

      <div class="divider">
        <span>or verify with email token</span>
      </div>
    </div>

    <!-- Email Fallback Sub-Component -->
    <SendToken 
      :is-loading="isFormLoading" 
      :default-email="emailAddress"
      @submit="onEmailSubmitted"
      @warning="setWarning"
      @clear-warning="() => { if (progressState.type === 'Warning') resetProgress() }"
    />
  </div>
  
    <!-- PANEL 4: VERIFY OTP TOKEN -->
    <div v-show="activePanel === 'verifytoken'" id="panel-verify-token" role="tabpanel">
      <AddToken 
        :is-loading="isFormLoading"
        :timer="countdownTimer"
        :can-resend="canResendToken"
        @verify="onTokenVerified"
        @resend="handleResendRequest"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";

.switch-prompt {
  margin: 0;
  display: inline-flex;
  gap: 0.25rem;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-link, #0066cc);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}
.oauth-section {
  margin-bottom: 1.5rem;

  .oauth-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-muted, #6b7280);
    margin-bottom: 0.75rem;
    text-align: center;
  }
}

.oauth-stack {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  .btn-oauth {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.65rem 1rem;
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: 6px;
    border: 1px solid var(--color-border, #d1d5db);
    background-color: var(--color-bg-surface, #ffffff);
    color: var(--color-text, #111827);
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover {
      background-color: var(--color-bg-hover, #f3f4f6);
    }

    &.apple {
      background-color: #000000;
      color: #ffffff;
      border-color: #000000;
      &:hover { background-color: #1a1a1a; }
    }
  }
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.25rem 0;
  color: var(--color-text-muted, #9ca3af);
  font-size: 0.8rem;

  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  span {
    padding: 0 0.75rem;
  }
}
</style>