<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeMount } from 'vue'

import { useProfileStore } from '../stores/ProfileStore' // 🚀 Import Profile Store
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import type { ArchiveProfileRequest } from '../types/IdentityTypes'

const profileStore = useProfileStore() // 💡 Instantiate Store
const modalStore = useModalStore()

// 🎯 1. INITIALIZE LOCAL FORM DATA CONTAINER
// Give it a strict type so your v-models benefit from IDE autocomplete
const formData = ref<ArchiveProfileRequest>({
      confirm: false
})

const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

onBeforeMount(() => {

  resetProgress()

})

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

  return {
  
      confirm: !formData.value.confirm 
      ? 'You must confirm action' 
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
      // 🎯 Only reset if we are clearing a warning!
      if (progressState.value.type === 'Warning') {
        resetProgress()
      }
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
  const { success, error } = await profileStore.unarchiveProfile(formData.value!)

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

onMounted(() => {
  resetProgress()
})

</script>

<template>
  
     <div class="form-container">

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleFormSubmission">

         <fieldset :disabled="progressState.type === 'Loading'">
      <div class="ticks">

  <input 
        v-model="formData.confirm" 
        type="checkbox" 
        id="Confirm"
      />
     <label For="Confirm">Tick to confirm unarchive action </label>

 </div>
     </fieldset>

  <span v-if="formSubmitted && validationErrors.confirm" class="validation-message">
        {{ validationErrors.confirm }}
      </span>
     
        <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
            :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Unarchive Profile' }}
          </button>
        </div>
    </form>
  </div>
      
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>