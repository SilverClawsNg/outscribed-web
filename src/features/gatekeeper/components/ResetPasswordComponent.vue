<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useFormProgress } from '@/composables/useFormProgress'

const props = defineProps<{ isLoading: boolean; }>()
const emit = defineEmits<{ (e: 'submit', password: string, confirm: boolean): void }>()

const password = ref('')
const confirm = ref<boolean>(false)
const passwordVisible = ref(false)

const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const passwordText = password.value || '';

  return {
  
    confirm: !confirm.value
      ? 'You must confirm action' 
      : '',

    password: passwordText === '' || passwordText.length < 8
      ? 'Enter a valid password'
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
  
  emit('submit', password.value, confirm.value)
  
}
</script>

<template>
  <form @submit.prevent="handleSubmit">

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

    <div class="ticks">
       <input v-model="confirm" type="checkbox" id="Confirm" />
       <label For="Confirm">Tick to confirm password reset </label>
   </div>
   
</fieldset>

    <span v-if="formSubmitted  && validationErrors.confirm" class="validation-message">
    {{ validationErrors.confirm }}
  </span>
  
    <div class="button-holder">
      <button 
        type="submit" 
        class="btn contrast" 
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