<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useInsightDraftStore } from '../stores/InsightDraftStore'
import RichTextEditor from '@/components/RichTextEditor.vue'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateDetailRequest } from '../types/InsightsTypes'
import { useModalStore } from '@/stores/modalStore'

// --- INITIALIZE STORES ---
const insightStore = useInsightDraftStore()
const modalStore = useModalStore()

// --- DEFINE FORM DATA ---
const formData = ref<UpdateDetailRequest>({
   insightId: '',
  detail: ''
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
  formData.value.detail = insightStore.activeInsight.detail ?? ''
  resetProgress()

})

// --- UI TRANSACTION STATES ---
const lockSubmission = ref(false)
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const detailText = formData.value.detail || '';

  return {
  
    detail: detailText === '' || detailText.length < 10 || detailText.length > 65535  || detailText === '<p></p>'
      ? 'Detail must be between 10 and 65535 characters'
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
 
   // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

const { success, error } = await insightStore.updateInsightDetails(formData.value!)

  if(!success){

    if(error){
      if(error.title = 'Blank Response'){
        lockSubmission.value = true
      }
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

   <FormProgress :progress="progressState" />

    <form>

      <RichTextEditor 
              id="editor"
              v-model="formData.detail" 
            />

           <span v-if="formSubmitted && validationErrors.detail" class="validation-message">
        {{ validationErrors.detail }}
      </span>

        <div class="button-holder">
          <button 
            type="button" 
            class="btn primary" 
            @click="handleFormSubmission"
            :disabled="progressState.type === 'Loading' || lockSubmission"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Update' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style scoped>
@import "@/assets/css/form-container-editor.less";
</style>