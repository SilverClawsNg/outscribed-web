<script setup lang="ts">
import { ref, watch, computed, onBeforeMount } from 'vue'
import { useAuthoringStore } from '../stores/AuthoringStore'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import HelpIcon from '@/components/HelpIcon.vue'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const authoringStore = useAuthoringStore()
const modalStore = useModalStore()
const { progressState, startLoading, setSuccess, setWarning, setError, resetProgress } = useFormProgress()

// Local checkbox state replacing forced modal reads
const isAgreed = ref(false)
const formSubmitted = ref(false)

onBeforeMount(() => {
  resetProgress()
})

// Derivative validation state
const validationErrors = computed(() => {
  return {
    attestation: !isAgreed.value
      ? 'You must acknowledge the structural guidelines and liability terms to proceed.'
      : ''
  }
})

const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

// Centralized form warning watcher
watch(
  [isFormValid, formSubmitted],
  ([isValid, submitted]) => {
    if (!submitted) return

    if (!isValid) {
      setWarning('Please acknowledge the terms before completing onboarding.')
    } else {
      if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  },
  { immediate: true }
)

async function handleFinalOnboardingSubmit() {
  formSubmitted.value = true

  if (!isFormValid.value) return

  startLoading()

  const { success, error } = await authoringStore.submitWriterOnboarding({
    confirm: true
  })

  if (!success) {
    if (error) {
      setError(error)
    } else {
      setWarning('An unknown error occurred. Refresh page and try again.')
    }
  } else {
    setSuccess('Onboarding successful.')
    emit('success')
  }
}

function openStructureModal() {
  modalStore.push('StructuralAttestation', 'Structural Guidelines')
}

function openLiabilityModal() {
  modalStore.push('LiabilityAttestation', 'Liability Terms')
}
</script>

<template>
  
  <div class="form-container">
    <div class="form-header">
      <h2>Before publishing your first tale on OutScribed, please acknowledge our structural guidelines and liability terms.</h2>
      <HelpIcon topic="OnboardWriter" />
    </div>

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleFinalOnboardingSubmit">
      <fieldset :disabled="progressState.type === 'Loading'">
       <div class="ticks">
  <label class="checkbox-label">
    <input 
      id="attestation-checkbox" 
      type="checkbox" 
      v-model="isAgreed" 
    />
    <span class="attestation-text">
      I confirm that I have read and agree to the 
      <a href="#" class="inline-link" @click.prevent="openStructureModal">
        Structural Guidelines
      </a> 
      and accept full responsibility under the 
      <a href="#" class="inline-link" @click.prevent="openLiabilityModal">
        Author Representation &amp; Liability Terms</a>.
    </span>
  </label>
</div>
      </fieldset>

      <span v-if="formSubmitted && validationErrors.attestation" class="validation-message">
        {{ validationErrors.attestation }}
      </span>

      <div class="action-footer">
        <button 
          type="submit" 
          class="btn btn--secondary"  
          :disabled="!isAgreed || progressState.type === 'Loading'"
        >
          {{ progressState.type === 'Loading' ? 'Onboarding...' : 'Complete Onboarding' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>