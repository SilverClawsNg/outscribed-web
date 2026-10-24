<script setup lang="ts">
import { ref, onBeforeMount, onMounted, watch, computed, nextTick } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import RichTextEditor from '@/components/RichTextEditor.vue'
import FormProgress from '@/components/FormProgress.vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateDetailRequest } from '../types/TalesTypes'
import { useModalStore } from '@/stores/modalStore'

const taleStore = useTaleDraftStore()
const modalStore = useModalStore()
const isMounted = ref(false)

const formData = ref<UpdateDetailRequest>({
   taleId: '',
   detail: ''
})

const props = defineProps<{
  modalWindowId: string
  payload?: any
}>()

onMounted(async () => {
  await nextTick()
  await nextTick()
  isMounted.value = true
})

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

function getPlainText(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const plainTextDetail = computed(() => getPlainText(formData.value.detail))
const detailLength = computed(() => plainTextDetail.value.trim().length)

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
  
  <div class="modal-editor-layout">
    <!-- 1. Top Progress / Alert Bar (Always visible) -->
    <FormProgress :progress="progressState" />

    <!-- 2. Form & Editor Area -->
    <form class="editor-form" @submit.prevent="handleFormSubmission">
      <RichTextEditor 
        id="editor"
        v-model="formData.detail" 
      />
          
      <!-- 3. Character Counter & Validation Messages -->
      <div class="form-counter-bar">
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

      <!-- 4. Pinned Full-Width Action Button -->
      <div class="form-action-bar">
        <button 
          type="submit" 
          class="btn-submit"  
          :disabled="progressState.type === 'Loading' || lockSubmission"
        >
          <SvgIcons name="edit" />
          <span>{{ progressState.type === 'Loading' ? 'Saving...' : 'Update Tale' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
<style scoped>
@import "@/assets/css/form-container-editor.less";
</style>