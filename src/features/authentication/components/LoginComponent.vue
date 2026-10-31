<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAuthenticationStore } from '../stores/AuthenticationStore';
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { APIError } from '@/api/apiTypes'
import HelpIcon from '@/components/HelpIcon.vue'

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'forgotPassword'): void;
  (e: 'signUp'): void;
}>();

const props = defineProps<{
    isPage?: boolean;
    message?: string;
}>()

const authStore = useAuthenticationStore();

const loginFormSubmitted = ref(false);
const isLoginFormLoading = ref(false);

const { progressState, startLoading, setError, setWarning, resetProgress } = useFormProgress();

const username = ref('');
const password = ref('');
const passwordVisible = ref(false);

const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{0,18}[a-zA-Z0-9])?$/;

const loginFormValidationErrors = computed(() => {
  const usernameText = username.value || '';
  const passwordText = password.value || '';
  let usernameError = '';

  if (usernameText === '') {
    usernameError = 'Username is required.';
  } else if (usernameText.length < 2 || usernameText.length > 20) {
    usernameError = 'Username must be between 2 and 20 characters.';
  } else if (!USERNAME_REGEX.test(usernameText)) {
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
    password: passwordText === '' || passwordText.length < 8 ? 'Enter a valid password' : ''
  }
})

const isLoginFormValid = computed(() => {
  return Object.values(loginFormValidationErrors.value).every(error => error === '')
})

watch(
  [isLoginFormValid, loginFormSubmitted], 
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

async function handleLogin() {
  loginFormSubmitted.value = true;
  if (!isLoginFormValid.value) return;

  isLoginFormLoading.value = true;
  startLoading();

  const outcome = await authStore.login({
    username: username.value,
    password: password.value,
  });

  isLoginFormLoading.value = false;

  if (outcome.isFailure) {
    setError(outcome.error ?? new APIError(0, 'Server Error', 'An unknown server failure occurred. Refresh page and try again.'));
  } else {
    resetProgress();
    emit('success');
  }
}
</script>

<template>
  <div class="auth-card">
    <div class="auth-card__header">
      <div v-if="isPage" class="auth-card__header--logo">
        <router-link to="/" class="main-header__brand-link" title="OutScribed Home">
          <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
        </router-link>
      </div>
      <h1 class="auth-card__header--title">Log In</h1>
      <p class="auth-card__header--subtitle">{{ message }}</p>
      <HelpIcon topic="LoginAccount" />
    </div>

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleLogin" class="auth-card__form">
      <fieldset class="auth-card__form--group">
        <label class="auth-card__form--label">Enter your username</label>
        <input
          v-model="username"
          class="auth-card__form--input"
          type="text"
          placeholder="Username"
          pattern="[a-zA-Z0-9_]+"
          required
        />
        <p v-if="loginFormSubmitted && loginFormValidationErrors.username" class="auth-card__form--error">
          {{ loginFormValidationErrors.username }}
        </p>
      </fieldset>

      <fieldset class="auth-card__form--group">
        <label class="auth-card__form--label">Enter your password. 
          <button type="button" @click="emit('forgotPassword')" title="Reset Password">Did you forget it?</button>
        </label>
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
        <p v-if="loginFormSubmitted && loginFormValidationErrors.password" class="auth-card__form--error">
          {{ loginFormValidationErrors.password }}
        </p>
      </fieldset>

      <button type="submit" class="auth-card__form--action" :disabled="isLoginFormLoading">
        {{ isLoginFormLoading ? 'Logging in...' : 'Log In' }}
      </button>

      <div class="auth-card__form--option">
        <span>Don't have an account yet?</span>
        <button type="button" @click="emit('signUp')" title="Register">Create one now</button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/auth-card.less";
</style>