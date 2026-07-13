<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFormProgress } from '@/composables/useFormProgress'

defineProps<{ isLoading: boolean; isUsernameError: boolean }>()

const emit = defineEmits<{ 
  (e: 'blurUsername', username: string): void
  (e: 'submit', data: any): void 
}>()

const username = ref('')
const password = ref('')
const title = ref('')
const passwordVisible = ref(false)

const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const usernameText = username.value || '';
const passwordText = password.value || '';
const titleText = title.value || '';

  return {
  
    username: usernameText === '' || usernameText.length < 2 || usernameText.length > 20
      ? 'Enter a valid username'
      : '',

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
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      // Clear warning and clean up state immediately when compliance is met
      resetProgress()
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
    username: username.value,
    password: password.value,
    title: title.value
  })
}
</script>

<template>

  <form @submit.prevent="handleSubmit">

    <fieldset :disabled="progressState.type === 'Loading'">
      <input 
        v-model="username" 
        type="text" 
        class="form-field" 
        placeholder="Username" 
        @blur="emit('blurUsername', username)"
      />
    </fieldset>

     <span v-if="formSubmitted  && validationErrors.username" class="validation-message">
    {{ validationErrors.username }}
  </span>

    <fieldset class="password-box" :disabled="progressState.type === 'Loading'">
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

        <span v-if="formSubmitted  && validationErrors.password" class="validation-message">
    {{ validationErrors.password }}
  </span>

    <fieldset :disabled="progressState.type === 'Loading'">
      <input v-model="title" type="text" class="form-field" placeholder="Names" />
    </fieldset>

    <span v-if="formSubmitted  && validationErrors.title" class="validation-message">
    {{ validationErrors.title }}
  </span>

    <div class="button-holder">
      <button 
      type="submit" 
      class="btn contrast" 
      :disabled="isLoading || isUsernameError">
        {{ isLoading && !isUsernameError ? 'Submitting...' : 'Complete' }}
      </button>
    </div>
  </form>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>