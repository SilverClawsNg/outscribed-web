<script setup lang="ts">
// --- IMPORTS ---
import { ref, onBeforeMount, onMounted, watch, computed } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import RichTextEditor from '@/components/RichTextEditor.vue'
import FormProgress from '@/components/FormProgress.vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateDetailRequest } from '../types/TalesTypes'
import { useModalStore } from '@/stores/modalStore'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore()
const modalStore = useModalStore()
const isMounted = ref(false)

// --- DEFINE FORM DATA ---
const formData = ref<UpdateDetailRequest>({
   taleId: '',
   detail: ''
})

onMounted(() => {
  isMounted.value = true
})

// --- SET GUARD FOR NULL DETAILS / INITIALIZE FORM DATA ---
onBeforeMount(() => {
  if (!taleStore.activeTale) {
    lockSubmission.value = true
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current tale details. Refresh page and try again",
      status: 204
    })
    return
  }

  formData.value.taleId = taleStore.activeTale.taleId
  formData.value.detail = taleStore.activeTale.detail ?? ''
  resetProgress()
})

// Helper to extract visible plain text
function getPlainText(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const plainTextDetail = computed(() => getPlainText(formData.value.detail))
const detailLength = computed(() => plainTextDetail.value.trim().length)

// --- UI TRANSACTION STATES ---
const lockSubmission = ref(false)
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

const formSubmitted = ref(false)

const validationErrors = computed(() => {
  const detailText = formData.value.detail || ''
  return {
    detail: detailText === '' || detailLength.value < 512 || detailLength.value > 65535
      ? 'Detail must be between 512 and 65535 characters'
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
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  }, 
  { immediate: true }
)

async function handleFormSubmission() {
  formSubmitted.value = true
  if (!isFormValid.value) return

  startLoading()

  const { success, error } = await taleStore.updateTaleDetails(formData.value!)

  if (!success) {
    if (error) {
      if (error.title === 'Blank Response') {
        lockSubmission.value = true
      }
      setError(error)
    } else {
      setWarning('An unknown error occurred. Refresh page and try again')
    }
  } else {
    modalStore.pop()
  }
}
</script>

<template>
  <div class="form-container">
    <FormProgress :progress="progressState" />

    <!-- 🎯 Teleport Submit Action directly into Editor Modal Header -->
    <Teleport 
      v-if="isMounted && modalStore.activeModal?.id" 
      :to="`#modal-header-submit-${modalStore.activeModal.id}`"
    >
      <button 
        type="button" 
        class="btn-header-submit"  
        @click="handleFormSubmission"
        :disabled="progressState.type === 'Loading' || lockSubmission"
        title="Update Tale"
      >
        <SvgIcons name="edit" />
        <span>{{ progressState.type === 'Loading' ? 'Saving...' : 'Update' }}</span>
      </button>
    </Teleport>

    <form @submit.prevent="handleFormSubmission">
      <RichTextEditor 
        id="editor"
        v-model="formData.detail" 
      />
         
      <div class="form-errors">
        <span v-if="formSubmitted && validationErrors.detail" class="validation-message">
          {{ validationErrors.detail }}
        </span>
        <span 
          v-else
          class="character-counter"
          :class="{ 
            'is-warning': detailLength > 64000 && detailLength <= 65535,
            'is-over-limit': detailLength < 512 || detailLength > 65535 
          }"
        >
          {{ detailLength }}/65535
        </span>
      </div>
    </form>
  </div>
</template>

<style scoped>
@import "@/assets/css/form-container-editor.less";

.btn-header-submit {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background-color: var(--color-primary, #0f172a);
  color: #ffffff;
  border: none;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover, #1e293b);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>