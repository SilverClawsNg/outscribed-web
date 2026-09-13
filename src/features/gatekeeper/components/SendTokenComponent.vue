<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { isValidEmail } from '@/utils/validators'

const props = defineProps<{ 
  isLoading: boolean;
  captchaToken: string; // Passed down from parent after captcha gate completes
}>()

const emit = defineEmits<{
  (e: 'submit', email: string): void
  (e: 'warning', message: string): void
  (e: 'clear-warning'): void
}>()

const emailAddress = ref('')
const formSubmitted = ref(false)

const validationErrors = computed(() => {
  const emailText = emailAddress.value || ''
  return {
    email: emailText === '' || !isValidEmail(emailText)
      ? 'Enter a valid email address'
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
  if (!isFormValid.value || !props.captchaToken) return

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

    <span v-if="formSubmitted && validationErrors.email" class="validation-message">
      {{ validationErrors.email }}
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