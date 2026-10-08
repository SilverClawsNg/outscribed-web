<!-- components/auth/panes/LoginRegisterPane.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'

export interface LoginRequest {
  username: string
  password: string
}

export interface ReserveRequest {
  username: string
  password: string
  captchaToken: string
}

const props = defineProps<{
  isLoading: boolean
  captchaErrorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'submit-reserve', payload: ReserveRequest): void
  (e: 'submit-login', payload: LoginRequest): void
  (e: 'warning', message: string): void
  (e: 'clear-warning'): void
}>()

const username = ref('')
const password = ref('')
const passwordVisible = ref(false)

// Captcha embedded state
const siteKey = ref(import.meta.env.VITE_CLOUDFLARE_SITE_KEY)
const captchaToken = ref<string | null>(null)
const isCaptchaVisible = ref(false)
const captchaFailed = ref(false)

// 1. Tracks whether the user has attempted to submit via either action
const formSubmitted = ref(false)

// 2. Pure, derivative validation state
const validationErrors = computed(() => {
const usernameText = username.value.trim()
const passwordText = password.value || ''

const sanitizedUsername = usernameText.replace(/^@+/, '').trim()

  return {
    username: usernameText === ''
      ? 'Username is required.'
      :  sanitizedUsername.length < 2 || sanitizedUsername.length > 20
        ? 'Username must be between 2 and 20 characters.'
        : '',

    password: passwordText === ''
      ? 'Password is required.'
      : passwordText.length < 8
        ? 'Password must be at least 8 characters.'
        : '',

    captcha: isCaptchaVisible.value && !captchaToken.value
      ? 'Please complete the security check.'
      : ''

  }
})

// 3. Form is valid if all computed error fields are empty strings
const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

// 4. Centralized watcher to synchronize top-level warning state with the parent orchestrator
watch(
  [isFormValid, formSubmitted],
  ([isValid, submitted]) => {
    if (!submitted) return

    if (!isValid) {
      emit('warning', 'Please fix the highlighted errors before continuing.')
    } else {
      emit('clear-warning')
    }
  },
  { immediate: true }
)

// --- Handlers for Primary and Secondary Actions ---
function handleReserve() {
  formSubmitted.value = true
  if (!isFormValid.value) return

  // 🎯 Silent Bypass Check:
  // If Captcha has already resolved in the background (e.g. localhost/pass-through),
  // fire immediately WITHOUT un-hiding or rendering the captcha container UI.
  if (captchaToken.value) {
    executeReserveSubmit(captchaToken.value)
    return
  }

  // Otherwise, expose the widget container so the user can interactively solve it
  isCaptchaVisible.value = true
}

// --- SUBMIT ACTIONS ---
function executeReserveSubmit(token: string) {
  emit('submit-reserve', {
    username: username.value.trim(),
    password: password.value,
    captchaToken: token
  })
}

function handleLogin() {
  formSubmitted.value = true
  if (!isFormValid.value) return

  emit('submit-login', {
    username: username.value.trim(),
    password: password.value
  })
}

// --- CAPTCHA HANDLERS ---
function handleCaptchaSuccess(token: string) {
  captchaToken.value = token
  captchaFailed.value = false

  // If user has already initiated registration, auto-submit once Captcha clears
  if (formSubmitted.value && isFormValid.value) {
    executeReserveSubmit(token)
  }
}

function handleCaptchaError() {
  captchaToken.value = null
  captchaFailed.value = true
  isCaptchaVisible.value = true // Ensure box is revealed so user can inspect error/retry
}

function resetCaptcha() {
  captchaToken.value = null
  captchaFailed.value = false
}

</script>

<template>
  <form @submit.prevent>
    <!-- Username Field -->
    <fieldset :disabled="isLoading">
      <div class="input-wrapper">
  <span class="at-symbol" aria-hidden="true">@</span>
      <input
        id="username"
        v-model="username"
        type="text"
        class="form-field has-username" 
        placeholder="Username"
      />
      </div>
      
    </fieldset>
    <span v-if="formSubmitted && validationErrors.username" class="validation-message">
      {{ validationErrors.username }}
    </span>

    <!-- Password Field -->
    <fieldset class="form-group password-box" :disabled="isLoading">
         <button 
          type="button" 
          class="show-password" 
          @click="passwordVisible = !passwordVisible"
        >
          👁️
        </button>
        <input 
          v-model="password" 
          :type="passwordVisible ? 'text' : 'password'" 
          class="form-field" 
          placeholder="Password" 
        />
    
    </fieldset>
    <span v-if="formSubmitted && validationErrors.password" class="validation-message">
      {{ validationErrors.password }}
    </span>

    <!-- Action Buttons -->
    <div class="button-holder dual">
      <!-- Primary Intent: Registration -->
      <button
        type="button"
        class="btn btn--secondary"
        :disabled="isLoading"
        @click="handleReserve"
      >
        {{ isLoading ? 'Reserving...' : 'Become An OutScriber' }}
      </button>

      <!-- Secondary Intent: Existing User Login -->
      <button
        type="button"
        class="btn btn--primary"
        :disabled="isLoading"
        @click="handleLogin"
      >
        {{ isLoading ? 'Signing In...' : 'Sign In' }}
      </button>
    </div>
    
    <!-- Embedded Inline Captcha Gate -->
    <div v-show="isCaptchaVisible" class="captcha-container">
      <template v-if="captchaFailed || props.captchaErrorMessage">
        <div class="captcha-error-box">
          <p>{{ props.captchaErrorMessage || 'Security verification failed. Please try again.' }}</p>
          <button type="button" class="btn btn--secondary btn--sm" @click="resetCaptcha">
            Retry Security Check
          </button>
        </div>
      </template>

      <template v-else>
        <p class="captcha-label">Security Check</p>
        <TurnstileWidget 
          :site-key="siteKey" 
          @success="handleCaptchaSuccess"
          @error="handleCaptchaError"
        />
      </template>
      
      <span v-if="formSubmitted && validationErrors.captcha" class="validation-message">
        {{ validationErrors.captcha }}
      </span>
    </div>

  </form>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";

.captcha-container {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--color-bg-subtle, #f9fafb);
  border: 1px dashed var(--color-border, #d1d5db);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .captcha-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-muted, #6b7280);
    margin-bottom: 0.5rem;
  }
}

.captcha-error-box {
  text-align: center;
  p {
    color: var(--color-error, #dc2626);
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
}

.btn--sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

</style>