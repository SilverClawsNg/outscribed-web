<script setup lang="ts">
import { ref, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import { createQuill, destroyQuill, getQuillHTML, setHtml } from '@/utils/quillHelper'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateDetailRequest } from '../types/TalesTypes'
import { useRouter, useRoute } from 'vue-router'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'

const taleStore = useTaleDraftStore()
const modalStore = useModalStore()

// Local Form State
const formData = ref<UpdateDetailRequest>({
  taleId: '',
  detail: ''
})

const router = useRouter()
const route = useRoute()
const showSuccessModal = ref(false)

const currentPath = encodeURIComponent(route.fullPath)

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

const formSubmitted = ref(false)
const lockSubmission = ref(false)
const isQuillInitialized = ref(false)

// DOM References
const editorRef = ref<HTMLDivElement | null>(null)
const toolbarRef = ref<HTMLDivElement | null>(null)

let isInternalChange = false

// Form Progress & Alerts Composable
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

function scrollToStudioTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// --- Helper & Plaintext Calculation ---
function getPlainText(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const plainTextDetail = computed(() => getPlainText(formData.value.detail))
const detailLength = computed(() => plainTextDetail.value.trim().length)

// --- Validation Rules ---
const validationErrors = computed(() => {
  const len = detailLength.value
  return {
    detail: len < 512 || len > 65535
      ? 'Story content must be between 512 and 65,535 characters.'
      : ''
  }
})

const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

// Helper to push HTML safely into Quill editor instance
function updateQuillContent(html: string) {
  if (editorRef.value && (editorRef.value as any).__quill) {
    // Only set HTML if content actually differs to avoid resetting Quill cursor/selection
    const currentHtml = getQuillHTML(editorRef.value)
    if (currentHtml !== html) {
      setHtml(editorRef.value, html)
    }
  }
}

// --- Initialize Quill Instance ONCE ---
async function setupQuill() {
  await nextTick()

  if (!editorRef.value || !toolbarRef.value || isQuillInitialized.value) return

  createQuill(
    editorRef.value,
    toolbarRef.value,
    false,
    "Start writing story here...",
    "snow"
  )

  const quillInstance = (editorRef.value as any).__quill
  if (quillInstance) {
    quillInstance.on('text-change', () => {
      isInternalChange = true
      const htmlContent = getQuillHTML(editorRef.value!)
      formData.value.detail = htmlContent
      
      // Keep store updated if needed, but set flag so watcher ignores this change
      if (taleStore.activeTale) {
        taleStore.activeTale.detail = htmlContent
      }

      nextTick(() => {
        isInternalChange = false
      })
    })

    isQuillInitialized.value = true

    // Inject initial content immediately after creation
    updateQuillContent(formData.value.detail)
  }
}

// Watch active tale changes & draft switching
watch(
  [() => taleStore.isInitializing, () => taleStore.activeTale?.taleId],
  async ([isInitializing, taleId], [_, oldTaleId]) => {
    if (isInitializing) return

    if (!taleId || !taleStore.activeTale) {
      lockSubmission.value = true
      return
    }

    resetProgress()
    lockSubmission.value = false

    // Update local form state
    formData.value.taleId = taleStore.activeTale.taleId
    formData.value.detail = taleStore.activeTale.detail ?? ''

    // 1. Ensure Quill instance is instantiated
    if (!isQuillInitialized.value) {
      await setupQuill()
    } else if (taleId !== oldTaleId && !isInternalChange) {
      // 2. Only re-inject HTML if switching to a DIFFERENT tale ID
      updateQuillContent(formData.value.detail)
    }
  },
  { immediate: true }
)

// Watch for external detail updates (e.g., store updates or resets)
watch(
  () => taleStore.activeTale?.detail,
  (newDetail) => {
    // Skip if change originated from user typing directly in Quill
    if (isInternalChange) {
      isInternalChange = false
      return
    }

    const incoming = newDetail ?? ''
    if (incoming !== formData.value.detail) {
      formData.value.detail = incoming
      updateQuillContent(incoming)
    }
  }
)

// Watch validation errors on submit
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

// --- Submission ---
async function handleFormSubmission() {
  //scrollToStudioTop()
  formSubmitted.value = true
  if (!isFormValid.value) return

  startLoading()

  const { success, error } = await taleStore.updateTaleDetails(formData.value)

  if (!success) {
    if (error) {
      if (error.title === 'Blank Response') {
        lockSubmission.value = true
      }
      setError(error)
    } else {
      setWarning('An unknown error occurred. Refresh page and try again')
    }
    scrollToStudioTop()
  } else {
   resetProgress()
   formSubmitted.value = false
   taleStore.openPostUpdateModal('details')
  }
}

onBeforeUnmount(() => {
  if (editorRef.value) {
    destroyQuill(editorRef.value)
    isQuillInitialized.value = false
  }
})

</script>

<template>
 
   <template v-if="taleStore.activeTale?.hasEngagement">

    <PageStatusMessage 
      title="Action is Disabled!" 
      message="This tale has been engaged by the community through such means as votes, shares, comments, saves, or flags and in order to protect the integrity of such engagement, you may no longer be able to update story details."
      icon="warning"
      :is-standalone="true">

      <template #desc>
       <p>
        You may however use the addendum feature to provide corrections, cancellations, or clarifications.
       </p>
      </template>
      <template #actions>
        <button
            class="btn btn--primary"
            @click="taleStore.setCurrentMainView('addendum')"
          >
            Add Addendum
          </button>
          <button
            class="btn btn--secondary"
            @click="router.push(`/tale/${taleStore.activeTale?.slug}`)"
          >
            View Live Story
          </button>
      </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <div class="editorial-canvas">


        <header class="editorial-canvas__header">
  <!-- Left Side: Title & Section Completion Status Indicators -->
  <h1 class="editorial-canvas__badge">Story Details</h1>

  <div class="editorial-canvas__btn-holder">
 <!-- Right Side: Edge-to-Edge Action Button matching header height (56px) -->
  <button 
    type="submit" 
    form="story-details-form" 
    class="btn btn--secondary"  
    :disabled="progressState.type === 'Loading' || lockSubmission"
  >
    {{ progressState.type === 'Loading' ? 'Saving...' : 'Save' }}
  </button>
  </div>
        </header>
     
       <!-- Sticky Quill Toolbar Container -->
        <div class="toolbar-wrapper">
          <div ref="toolbarRef" class="ql-toolbar ql-snow toolbar">
            <span class="ql-formats">
              <button class="ql-header" value="1" title="Heading 1"></button>
              <button class="ql-header" value="2" title="Heading 2"></button>
              <button class="ql-bold" title="Bold"></button>
              <button class="ql-italic" title="Italic"></button>
              <button class="ql-underline" title="Underline"></button>
              <button class="ql-strike" title="Strikethrough"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-blockquote" title="Blockquote"></button>
              <button class="ql-list" value="ordered" title="Numbered List"></button>
              <button class="ql-list" value="bullet" title="Bullet List"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-link" title="Insert Link"></button>
              <button class="ql-clean" title="Clear Formatting"></button>
            </span>
          </div>
        </div>

        <!-- Centered Article Canvas -->
        <div class="editorial-canvas__body">

          <div v-if="progressState.type !== 'Idle'" class="floating-progress-bar">
            <FormProgress :progress="progressState" :is-editor="true" />
          </div>

          <!-- Quill Editor Mount Container -->
          <div class="editor-wrapper">
            <div ref="editorRef" class="ql-editor-container"></div>
          </div>
          
          <div class="editorial-canvas__field-footer">

            <p v-if="formSubmitted && validationErrors.detail" class="editorial-canvas__validation-message">
              {{ validationErrors.detail }}
            </p>

            <span 
              class="editorial-canvas__character-counter" 
              :class="{ 
                'is-warning': detailLength > 64000 && detailLength <= 65535,
                'is-over-limit': detailLength < 512 || detailLength > 65535 
              }"
            >
              {{ detailLength.toLocaleString() }} / 65,535 chars
            </span>
          </div>

        </div>
    </div>

  </template>


</template>

<style scoped lang="less">
@import 'quill/dist/quill.core.css';
@import 'quill/dist/quill.snow.css';
@import "@/assets/css/editor-form.less";

.floating-progress-bar {
  position: sticky;
  top: 1rem;
  z-index: 100;
  overflow: hidden;
  animation: slideDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.toolbar-wrapper {
  position: sticky;
  top: 56px;
  z-index: 9;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.75rem 0 0.25rem 0;
  background-color: var(--background-color);
  border-bottom: 1px solid var(--border-color);

}

.toolbar.ql-toolbar.ql-snow {
  border: none !important;
  //border-radius: 8px;
  //background-color: var(--light-background-color);
  padding: 0.375rem 0.625rem;
  //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  .ql-formats {
    margin-right: 0.75rem;
    

    @media @phone{
      margin-bottom: 0.75rem;
    }
  }


}

:deep(.ql-container.ql-snow) {
  border: none !important;
  font-family: @font-family;
  font-size: 1.1rem;
  line-height: 1.5;
  color: var(--muted-text-color);

}

:deep(.ql-snow .ql-fill){
    fill: var(--muted-link-color);
}

:deep(.ql-snow .ql-stroke){
     stroke: var(--muted-link-color);
}

/* Ensure the editor container acts as the positioning boundary */
.editor-wrapper,
.ql-container {
  position: relative;
  overflow: visible; /* Allows tooltip to float above without clipping */
}

/* Override Quill's off-screen negative left placement */
:deep(.ql-tooltip) {
  /* Clamp left position so it never drops below 0px (or padding offset) */
  left: max(16px, var(--quill-left, 16px)) !important;
  max-width: calc(100vw - 32px) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  background-color: var(--background-color);
  z-index: 20;
}

:deep(.ql-editor) {
  padding: 0;
  min-height: 450px;

  &.ql-blank::before {
    left: 0;
    right: 0;
    color: var(--muted-link-color);
    font-weight: normal;
    font-style: italic;
  }
}

</style>