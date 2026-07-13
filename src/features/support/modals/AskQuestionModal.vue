<script setup lang="ts">

// --- IMPORTS ---
import { ref, watch, computed, onBeforeMount } from 'vue'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { AskQuestionRequest } from '../types/SupportTypes'
import { useModalStore } from '@/stores/modalStore'
import { postAsync } from '@/api/apiPostServices';
import { isValidEmail } from '@/utils/validators';

// --- INITIALIZE STORES ---
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<AskQuestionRequest>({
  question: '',
  emailAddress: ''
})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {
  const questionText = formData.value.question || '';
  const emailAddress = formData.value.emailAddress || '';

  return {
    question: questionText.length < 10 || questionText.length > 2096
      ? 'Question must be between 10 and 2096 characters'
      : '',
    emailAddress: !isValidEmail(emailAddress)
      ? 'Please enter a valid email address'
      : ''
  }
})

// 3. Form is valid if all computed error fields are empty strings
const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})


// 4. Lifecycle Execution: Equivalent to OnAfterRenderAsync(firstRender)
onBeforeMount(async () => {
 
  // Ensure DOM has entirely settled printing the v-html payload
  resetProgress()

});


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


async function handleFormSubmission() {

 // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

        const outcome = await postAsync('/api/inquiries/ask', formData.value, false);

      if (outcome.isFailure) {
       
    if(outcome.error){
    setError(outcome.error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
      }else{
 
    // Close down the active overlay panel instance securely
    modalStore.pop()
  
  }


}

</script>

<template>

     <div class="form-container">

    <h2>Ask. We will try to help you</h2>

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleFormSubmission" autocomplete="off">

        <fieldset :disabled="progressState.type === 'Loading'">
      <input 
        v-model="formData.emailAddress" 
        type="email" 
        placeholder="Email Address" 
        class="form-field" 
        required 
      />
    </fieldset>
   <span v-if="formSubmitted  && validationErrors.emailAddress" class="validation-message">
    {{ validationErrors.emailAddress }}
  </span>
         <fieldset :disabled="progressState.type === 'Loading'">
          <textarea 
            v-model="formData.question" 
            type="text" 
            id="Question" 
            class="form-field" 
            placeholder="Your Question" 
          ></textarea>
        </fieldset>
             <span v-if="formSubmitted  && validationErrors.question" class="validation-message">
    {{ validationErrors.question }}
  </span>
   <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
              :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Ask' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>