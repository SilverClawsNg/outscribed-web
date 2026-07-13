<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useInsightDraftStore } from '../stores/InsightDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateRequest } from '../types/InsightsTypes'
import { useModalStore } from '@/stores/modalStore'
import { getValidCategory } from '@/utils/validators'
import { CategorySelectItems } from '@/utils/selectItemHelper'

// --- INITIALIZE STORES ---
const insightStore = useInsightDraftStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdateRequest>({
   insightId: '',
   title: '',
   category: '-1'
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
  formData.value.title = insightStore.activeInsight.title
  formData.value.category = insightStore.activeInsight.category
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

const titleText = formData.value.title || '';
  const parsedCategory = getValidCategory(formData.value.category);

  return {
  
    title: titleText === '' || titleText.length < 8 || titleText.length > 128
      ? 'Title must be between 8 and 128 characters'
      : '',

    category: !parsedCategory
      ? 'Please select a category.' 
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

 const { success, error } = await insightStore.updateInsightBasic(formData.value)

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

    <h2>Update basic details</h2>

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleFormSubmission" autocomplete="off">

      <fieldset :disabled="progressState.type === 'Loading'  || lockSubmission">
          <input 
            v-model="formData.title" 
            id="Title" 
            class="form-field" 
            placeholder="Title" 
          />
        </fieldset>
           <span v-if="formSubmitted && validationErrors.title" class="validation-message">
        {{ validationErrors.title }}
      </span>

      <fieldset :disabled="progressState.type === 'Loading'  || lockSubmission">
         <select v-model="formData.category" class="form-field">
            <option value="-1">-- select category --</option>
            <option v-for="item in CategorySelectItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
      </fieldset>
               <span v-if="formSubmitted && validationErrors.category" class="validation-message">
        {{ validationErrors.category }}
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