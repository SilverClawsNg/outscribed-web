<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFormProgress } from '@/composables/useFormProgress'

defineProps<{ isLoading: boolean; isUsernameError: boolean }>()

const emit = defineEmits<{ 
  (e: 'blurUsername', username: string): void
  (e: 'submit', data: any): void 
   (e: 'warning', message: string): void
  (e: 'clear-warning'): void
}>()

const username = ref('')
const password = ref('')
const title = ref('')
const passwordVisible = ref(false)

// Regex: 2 to 20 chars, letters, numbers, underscores (_), and hyphens (-).
// Starts and ends with alphanumeric characters.
const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{0,18}[a-zA-Z0-9])?$/;

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// Clean character length derived directly from reactive state
const usernameLength = computed(() => username.value?.length || 0)
const passwordLength = computed(() => password.value?.length || 0)
const titleLength = computed(() => title.value?.length || 0)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const usernameText = username.value || '';
const passwordText = password.value || '';
const titleText = title.value || '';

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
      : '',

    title: titleText === ''
      ? 'Enter a valid title'
      : ''
  }
})

// 3. Form is valid if all computed error fields are empty strings
const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

// --- 4. The centralized warning to ensures the to warning is in sync with the form field warnings ---
// It monitors form health and automatically dictates top-level notification state
watch(
  [isFormValid, formSubmitted], 
  ([isValid, submitted]) => {
    // Don't disturb the user if they haven't tried to submit yet
    if (!submitted) return

     if (!isValid) {
      emit('warning', 'Ensure all fields are filled out correctly before submission.')
    } else {
      // Clear warning and clean up state immediately when compliance is met
      emit('clear-warning')
    }
  }, 
  { immediate: true }
)

function handleSubmit() {
    
  // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  emit('submit', {
    username: username.value.trim(),
    password: password.value,
    title: title.value
  })
}

</script>

<template>

  <form @submit.prevent="handleSubmit">

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
              'is-warning': usernameLength < 2 || usernameLength == 20,
              'is-over-limit': usernameLength > 20 
            }"
          >
            {{ usernameLength }}/20
          </span>
    </fieldset>

     <span v-if="formSubmitted  && validationErrors.username" class="validation-message">
    {{ validationErrors.username }}
  </span>

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
              'is-warning': passwordLength == 8,
              'is-over-limit': passwordLength < 8 
            }"
          >
            {{ passwordLength }}
          </span>
    </fieldset>

  <span v-if="formSubmitted  && validationErrors.password" class="validation-message">
    {{ validationErrors.password }}
  </span>

    <fieldset :disabled="isLoading">
      <input v-model="title" type="text" class="form-field" placeholder="Names" />
         <span 
            class="character-counter" 
            :class="{ 
              'is-warning': titleLength > 100 && titleLength <= 128,
              'is-over-limit': titleLength > 128 
            }"
          >
            {{ titleLength }}/128
          </span>
    </fieldset>

    <span v-if="formSubmitted  && validationErrors.title" class="validation-message">
    {{ validationErrors.title }}
  </span>

    <div class="button-holder">
      <button 
      type="submit" 
      class="btn btn--secondary"  
      :disabled="isLoading || isUsernameError">
        {{ isLoading && !isUsernameError ? 'Submitting...' : 'Complete' }}
      </button>
    </div>
  </form>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>