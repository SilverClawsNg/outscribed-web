<script setup lang="ts">
import { ref, computed, watch } from 'vue'

defineProps<{ isLoading: boolean; isUsernameError: boolean }>()

const emit = defineEmits<{ 
  (e: 'blurUsername', username: string): void
  (e: 'submit', data: { username: string; email: string; password: string }): void 
  (e: 'warning', message: string): void
  (e: 'clear-warning'): void
}>()

const username = ref('')
const email = ref('')
const password = ref('')
const passwordVisible = ref(false)

// Regex: 2 to 20 chars, letters, numbers, underscores (_), and hyphens (-).
const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{0,18}[a-zA-Z0-9])?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formSubmitted = ref(false)

const usernameLength = computed(() => username.value?.length || 0)
const passwordLength = computed(() => password.value?.length || 0)

const validationErrors = computed(() => {
  const usernameText = username.value || '';
  const emailText = email.value || '';
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

  let emailError = '';
  if (emailText === '') {
    emailError = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(emailText)) {
    emailError = 'Enter a valid email address.';
  }

  return {
    username: usernameError,
    email: emailError,
    password: passwordText === '' || passwordText.length < 8
      ? 'Password must be at least 8 characters.'
      : ''
  }
})

const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

watch(
  [isFormValid, formSubmitted], 
  ([isValid, submitted]) => {
    if (!submitted) return
    if (!isValid) {
      emit('warning', 'Ensure all fields are filled out correctly before submission.')
    } else {
      emit('clear-warning')
    }
  }, 
  { immediate: true }
)

function handleSubmit() {
  formSubmitted.value = true
  if (!isFormValid.value) return

  emit('submit', {
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- Username Field -->
    <fieldset class="boxed" :disabled="isLoading">
      <input 
        v-model="username" 
        type="text" 
        class="form-field" 
        placeholder="Username" 
        @blur="emit('blurUsername', username)"
      />
      <span 
        class="character-counter" 
        :class="{ 
          'is-warning': usernameLength < 2 || usernameLength === 20,
          'is-over-limit': usernameLength > 20 
        }"
      >
        {{ usernameLength }}/20
      </span>
    </fieldset>
    <span v-if="formSubmitted && validationErrors.username" class="validation-message">
      {{ validationErrors.username }}
    </span>

    <!-- Password Field -->
    <fieldset class="password-box" :disabled="isLoading">
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
      <span 
        class="character-counter" 
        :class="{ 
          'is-warning': passwordLength === 8,
          'is-over-limit': passwordLength < 8 
        }"
      >
        {{ passwordLength }}
      </span>
    </fieldset>
    <span v-if="formSubmitted && validationErrors.password" class="validation-message">
      {{ validationErrors.password }}
    </span>
    
    <!-- Email Field -->
    <fieldset class="boxed" :disabled="isLoading">
      <input 
        v-model="email" 
        type="email" 
        class="form-field" 
        placeholder="Email Address" 
      />
    </fieldset>
    <span v-if="formSubmitted && validationErrors.email" class="validation-message">
      {{ validationErrors.email }}
    </span>

    <div class="button-holder">
      <button 
        type="submit" 
        class="btn btn--secondary"  
        :disabled="isLoading || isUsernameError"
      >
        {{ isLoading && !isUsernameError ? 'Submitting...' : 'Register' }}
      </button>
    </div>
  </form>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>