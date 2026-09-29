<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFormProgress } from '@/composables/useFormProgress'
import { isValidEmail } from '@/utils/validators'

const props = defineProps<{ 
  isLoading: boolean; 
  siteKey: string, 
  email: string }>()

const emit = defineEmits<{
  (e: 'submit', email: string): void
  (e: 'warning', message: string): void
  (e: 'clear-warning'): void
}>()

const emailAddress = ref(props.email)


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const emailText = emailAddress.value || '';

  return {
  
    email: emailText === '' || !isValidEmail(emailText)
      ? 'Enter a valid email address'
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

  emit('submit', emailAddress.value.trim())
  
}
</script>

<template>
  <form @submit.prevent="handleSubmit">

  <fieldset class="boxed" :disabled="isLoading">
      <input 
        v-model="emailAddress" 
        type="email" 
        placeholder="Email Address" 
        class="form-field" 
        required 
      />
    </fieldset>

      <span v-if="formSubmitted  && validationErrors.email" class="validation-message">
    {{ validationErrors.email }}
  </span>

    <div class="button-holder">
      <button 
        type="submit" 
        class="btn btn--secondary"  
        :disabled="isLoading"
      >
        {{ isLoading ? 'Submitting...' : 'Continue' }}
      </button>
    </div>
  </form>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>