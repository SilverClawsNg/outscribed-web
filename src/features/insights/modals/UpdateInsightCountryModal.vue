<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useInsightDraftStore } from '../stores/InsightDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateCountryRequest } from '../types/InsightsTypes'
import { useModalStore } from '@/stores/modalStore'
import { getValidCountry } from '@/utils/validators'
import { CountrySelectItems } from '@/utils/selectItemHelper'

// --- INITIALIZE STORES ---
const insightStore = useInsightDraftStore()
const modalStore = useModalStore()

// --- FORM DATA ---
const formData = ref<UpdateCountryRequest>({
   insightId: '',
  country: '-1'
})


// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!insightStore.activeInsight) {
    // 1. Lock down the form immediately to block accidental click updates
    lockSubmission.value = true
    
    // 2. Pass a friendly, descriptive error straight down to your message layout
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current insight details. Refresh page and try again",
      status: 204 // Standard missing resource code
    })
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.insightId = insightStore.activeInsight.insightId
  formData.value.country = insightStore.activeInsight.country ?? '-1'
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

   const parsedCountry = getValidCountry(formData.value.country);

  return {
       country: !parsedCountry
      ? 'Please select a country.' 
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


// --- SUBMIT FORM TO STORE ---
async function handleFormSubmission() {

  // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return


  startLoading()

 const { success, error } = await insightStore.updateInsightCountry(formData.value!)

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

    <h2>Which country gets the reality check?</h2>

    <FormProgress :progress="progressState" />
    
    <form @submit.prevent="handleFormSubmission" autocomplete="off">

      
      <fieldset :disabled="progressState.type === 'Loading'  || lockSubmission">
         <select v-model="formData.country" class="form-field">
            <option value="-1">-- select country --</option>
            <option v-for="item in CountrySelectItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
      </fieldset>
      
                <span v-if="formSubmitted && validationErrors.country" class="validation-message">
        {{ validationErrors.country }}
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