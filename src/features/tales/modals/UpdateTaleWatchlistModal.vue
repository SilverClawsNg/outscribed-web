<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateWatchlistRequest } from '../types/TalesTypes'
import { useModalStore } from '@/stores/modalStore'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdateWatchlistRequest>({
   taleId: '',
   title: '',
   summary: '',
   sourceUrl: '',
   source: ''
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
  formData.value.title = taleStore.activeTale.watchlistTitle ?? ''
  formData.value.summary = taleStore.activeTale.watchlistSummary ?? ''
  formData.value.source = taleStore.activeTale.watchlistSource ?? ''
  formData.value.sourceUrl = taleStore.activeTale.watchlistUrl ?? ''
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
const summaryText = formData.value.summary || '';
const sourceText = formData.value.source || '';
const urlText = formData.value.sourceUrl || '';

  return {
  
    title: titleText === '' || titleText.length < 8 || titleText.length > 128
      ? 'Title must be between 8 and 128 characters'
      : '',

       summary: summaryText === '' || summaryText.length < 8 || summaryText.length > 512
      ? 'Summary must be between 8 and 128 characters'
      : '',

       source: sourceText === '' || sourceText.length < 2 || sourceText.length > 36
      ? 'Source must be between 2 and 36 characters'
      : '',

       url: urlText === '' || urlText.length < 8 || urlText.length > 256
      ? 'Source Url must be between 3 and 256 characters'
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

 const { success, error } = await taleStore.updateTaleWatchlist(formData.value!)

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

    <h2>Wire in the facts</h2>

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleFormSubmission" autocomplete="off">

      <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <input 
            v-model="formData.title" 
            type="text" 
            id="Title" 
            class="form-field" 
            placeholder="Title" 
          />
        </fieldset>
            <span v-if="formSubmitted && validationErrors.title" class="validation-message">
        {{ validationErrors.title }}
      </span>

        <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <textarea 
            v-model="formData.summary" 
            type="text" 
            id="Summary" 
            class="form-field" 
            placeholder="Summary" 
          ></textarea>
        </fieldset>
  <span v-if="formSubmitted && validationErrors.summary" class="validation-message">
        {{ validationErrors.summary }}
      </span>
      <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <input 
            v-model="formData.source" 
            type="text" 
            id="Source" 
            class="form-field" 
            placeholder="Source e.g. CNN" 
          />
        </fieldset>
  <span v-if="formSubmitted && validationErrors.source" class="validation-message">
        {{ validationErrors.source }}
      </span>
      <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <input 
            v-model="formData.sourceUrl" 
            type="text" 
            id="SourceUrl" 
            class="form-field" 
            placeholder="Source url e.g. https://cnn.com" 
          />
        </fieldset>
  <span v-if="formSubmitted && validationErrors.url" class="validation-message">
        {{ validationErrors.url }}
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