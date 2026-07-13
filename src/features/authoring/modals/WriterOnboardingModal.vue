<script setup lang="ts">
import { ref, watch, computed, onBeforeMount } from 'vue'
import { useAuthoringStore } from '../stores/AuthoringStore'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useModalStore } from '@/stores/modalStore'
import { CountrySelectItems } from '@/utils/selectItemHelper'
import { useFormProgress } from '@/composables/useFormProgress'
import type { WriterOnboardingRequest } from '../types/AuthoringTypes'
import { getValidCountry } from '@/utils/validators'
import { postAsync } from '@/api/apiPostServices'
import { APIError } from '@/api/apiTypes'
import FormProgress from '@/components/FormProgress.vue'

const authoringStore = useAuthoringStore()
const modalStore = useModalStore()
const authStore = useAuthStore()

const { progressState, startLoading, setSuccess, setWarning, setError, resetProgress } = useFormProgress()

// 🎯 1. INITIALIZE LOCAL FORM DATA CONTAINER
// Give it a strict type so your v-models benefit from IDE autocomplete
const formData = ref<WriterOnboardingRequest>({
      confirm: false,
      country: '-1'
})

onBeforeMount(() => {

  resetProgress()

})

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

  const parsedCountry = getValidCountry(formData.value.country);

  return {
    structural: !authoringStore.structureAcknowledged
      ? 'Read & confirm the structural attestation' 
      : '',
      
   liability: !authoringStore.liabilityAcknowledged
      ? 'Read & confirm the liability attestation' 
      : '',

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

async function handleFinalOnboardingSubmit() {

    // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

    formData.value.confirm = authoringStore.isFullyCertified;

  const { success, error } = await authoringStore.submitWriterOnboarding(formData.value)

  if(!success){

    if(error){
      setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    // Happy Path: Save verification token context and advance
  setSuccess('Onboarding was successfully.')
  
      modalStore.pop() 
  }

}

</script>

<template>

  <div class="form-container">

    <h2>Unlock your creative dashboard workspace.</h2>

  <FormProgress :progress="progressState" />

      <fieldset :disabled="progressState.type === 'Loading'">
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

       <div class="ticks read-only-check" @click="modalStore.push('StructuralAttestation', 'Structure Attestation')">
        <input type="checkbox" :checked="authoringStore.structureAcknowledged" disabled />
        <label>I confirm that I have read and understood the OutScribed Story Structure
 guidelines. I will apply these principles when creating and publishing tales.</label>
      </div>
              <span v-if="formSubmitted && validationErrors.structural" class="validation-message">
        {{ validationErrors.structural }}
      </span>

      <div class="ticks read-only-check" @click="modalStore.push('LiabilityAttestation', 'Liability Attestation')">
        <input type="checkbox" :checked="authoringStore.liabilityAcknowledged" disabled />
        <label>I confirm that I have read and understood the OutScribed Legal Responsibility
 guidelines. I will conform to these principles when creating and publishing tales.</label>
      </div>

                <span v-if="formSubmitted && validationErrors.liability" class="validation-message">
          {{ validationErrors.liability }}
        </span>

    <div class="action-footer">
      <button 
        class="btn primary" 
        :disabled="!authoringStore.isFullyCertified || progressState.type === 'Loading'"
        @click="handleFinalOnboardingSubmit"
      >
        {{ progressState.type === 'Loading' ? 'Onboarding...' : 'Complete Onboarding' }}
      </button>
    </div>
  </div>

</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>