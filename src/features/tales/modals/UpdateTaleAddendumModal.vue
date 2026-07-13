<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateAddendumRequest } from '../types/TalesTypes'
import { useModalStore } from '@/stores/modalStore'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdateAddendumRequest>({
   taleId: '',
  addendum: ''
})

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!taleStore.activeTale) {
    // 1. Lock down the form immediately to block accidental click updates
    lockSubmission.value = true
    
    // 2. Pass a friendly, descriptive error straight down to your message layout
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current tale details. Refresh page and try again",
      status: 204 // Standard missing resource code
    })
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.taleId = taleStore.activeTale.taleId
  formData.value.addendum = taleStore.activeTale.addendum ?? ''
  resetProgress()

})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---
const lockSubmission = ref(false)


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const addendumText = formData.value.addendum || '';

  return {
  
    addendum: addendumText === '' || addendumText.length < 3 || addendumText.length > 1024
      ? 'Addendum must be between 3 and 1024 characters'
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

async function handleFormSubmission() {

 // 1. Basic Client Side Pre-validation Guard
  formSubmitted.value = true

  if (!isFormValid.value) {
    setWarning('Ensure all fields are filled out correctly before submission.')
    return
  }

  startLoading()

 const { success, error } = await taleStore.updateTaleAddendum(formData.value!)

  if(!success){

    if(error){
      setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    // Close down the active overlay panel instance securely
    modalStore.pop()
  
  }
  
}

</script>

<template>

     <div class="form-container">

    <h2>Correct, clarify, or cancel. Each on its own line.</h2>

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleFormSubmission" autocomplete="off">

         <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <textarea 
            v-model="formData.addendum" 
            id="Addendum" 
            class="form-field" 
            placeholder="Addendum" 
          ></textarea>
        </fieldset>
                 <span v-if="formSubmitted && validationErrors.addendum" class="validation-message">
        {{ validationErrors.addendum }}
      </span>
   <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
              :disabled="progressState.type === 'Loading' || lockSubmission"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Update' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>