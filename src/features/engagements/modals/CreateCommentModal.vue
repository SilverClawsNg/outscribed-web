<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeMount } from 'vue'
import { useDraftCommentsStore } from '../stores/DraftCommentsStore'
import { useContentCommentsStore } from '../stores/ContentCommentsStore'
import { useModalStore } from '@/stores/modalStore'
import type { ActiveContentContext } from '../types/EngagementTypes'
import { useFormProgress } from '@/composables/useFormProgress'
import PageStatusMessage from '@/components/PageStatusMessage.vue' 
import RichTextEditor from '@/components/RichTextEditor.vue'
import FormProgress from '@/components/FormProgress.vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { useLoginHint } from '@/utils/authHelper'

// --- DEFINE PROPS & STORES ---
const props = defineProps<{
  payload: unknown // Arrives untouched as raw payload from container
}>()

const content = computed(() => props.payload as ActiveContentContext)

const commentsStore = useDraftCommentsStore()
const contentStore = useContentCommentsStore()
const modalStore = useModalStore()
const isLoggedIn = useLoginHint()

const isMounted = ref(false)

const formData = ref({
  detail: ''
})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

onBeforeMount(() => {
  resetProgress()
})

onMounted(() => {
  isMounted.value = true
})

// Helper to extract visible plain text
function getPlainText(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const plainTextDetail = computed(() => getPlainText(formData.value.detail))
const detailLength = computed(() => plainTextDetail.value.trim().length)

// --- VALIDATION LOGIC ---
const formSubmitted = ref(false)

const validationErrors = computed(() => {
  const detailText = formData.value.detail || ''
  return {
    detail: detailText === '' || detailLength.value < 48 || detailLength.value > 4096 
      ? 'Detail must be between 48 and 4096 characters'
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

  const { success, error } = await commentsStore.createComment(
    formData.value.detail!
  )

  if (!success) {
    if (error) {
      setError(error)
    } else {
      setWarning('An unknown error occurred. Refresh page and try again')
    }
    return
  }

  // Preserve existing modal stack navigation logic
  if (modalStore.isPreviousModal('ContentComments')) {
    // Flow A: Opened from comments list -> Pop back to existing list
    modalStore.pop()
  } else {
    // Flow B: Opened from Content/Stats page -> Replace self with ContentComments view
    modalStore.replace('ContentComments', 'Comments')
  }
}
</script>

<template>
  <template v-if="!isLoggedIn">
    <PageStatusMessage 
      title="Login Required!" 
      message="Not yet an OutScriber? Its easy and free. If your session expired, sign back in to submit your comment."
      icon="warning"
      :is-standalone="true"
    >
      <template #actions>
        <button class="btn btn--primary" @click="modalStore.push('LoginUser', 'Login')">Login</button>
        <button class="btn btn--primary" @click="modalStore.push('RegisterUser', 'Register')">Become An OutScriber</button>
      </template>
    </PageStatusMessage>
  </template>
  
  <template v-else>
    <div class="form-container">
      <FormProgress :progress="progressState" />

      <!-- 🎯 Teleport Submit Button to Header Submit Slot -->
      <Teleport 
        v-if="isMounted && modalStore.activeModal?.id" 
        :to="`#modal-header-submit-${modalStore.activeModal.id}`"
      >
        <button 
          type="button" 
          class="btn-header-submit"  
          @click="handleFormSubmission"
          :disabled="progressState.type === 'Loading'"
          title="Submit Comment"
        >
          <SvgIcons name="edit" />
          <span>{{ progressState.type === 'Loading' ? 'Submitting...' : 'Comment' }}</span>
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
              'is-warning': detailLength > 4000 && detailLength <= 4096,
              'is-over-limit': detailLength < 48 || detailLength > 4096 
            }"
          >
            {{ detailLength }}/4096
          </span>
        </div>
      </form>
    </div>
  </template>
</template>

<style lang="less" scoped>
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