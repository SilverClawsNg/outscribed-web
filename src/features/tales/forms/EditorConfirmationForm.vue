<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue'
import { useTaleDraftStore, type MainCanvasView } from '../stores/TaleDraftStore'
import type { ConfirmRequest } from '../types/TalesTypes'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import type { APIError } from '@/api/apiTypes'
import { useRouter } from 'vue-router'
import type { TaleStatus } from '@/utils/enumHelper'
import PageStatusMessage from '@/components/PageStatusMessage.vue'

const props = defineProps<{
  mode: 'publish' | 'archive' | 'unarchive' | 'delete'
}>()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<ConfirmRequest>({
   taleId: '',
   confirm: false
})

const router = useRouter()

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---
const lockSubmission = ref(false)

const taleStore = useTaleDraftStore()
const isCompleted = ref(false) // Tracks local completed state

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
  resetProgress()
})

const activeTale = computed(() => taleStore.activeTale)

// ----------------------------------------------------------------------------
// 1. TALE STATUS CLASSIFICATION GUARDS
// ----------------------------------------------------------------------------
const currentStatus = computed<TaleStatus | undefined>(() => activeTale.value?.status)

// Live/Public statuses
const isLivePublic = computed(() => {
  if (!currentStatus.value) return false
  return ['LaunchedByCreator', 'CertifiedByAdmin'].includes(currentStatus.value)
})

// Archived statuses
const isArchived = computed(() => {
  if (!currentStatus.value) return false
  return [
    'ArchivedByAdmin', 
    'LaunchedToArchivedByCreator', 
    'CertifiedToArchivedByCreator'
  ].includes(currentStatus.value)
})

// Moderated / Hidden statuses
const isHidden = computed(() => {
  if (!currentStatus.value) return false
  return ['HiddenByModeration', 'HiddenByAdmin'].includes(currentStatus.value)
})

// Pure draft state
const isDraft = computed(() => currentStatus.value === 'Created')

// ----------------------------------------------------------------------------
// 2. PRE-ACTION VALIDATION & LEGAL OPERATION GUARDS
// ----------------------------------------------------------------------------

const nextAction = ref<MainCanvasView>('basic') // Tracks local completed state

const missingRequirements = computed(() => {
  if (props.mode !== 'publish' || !activeTale.value) return []

  const missing: string[] = []
  if (!taleStore.hasBasicInfo()) {
    missing.push('Basic Information (Title, Category, Country, Summary)')
    nextAction.value = 'basic'
  }
  if (!taleStore.hasRealityCheck()) {
    missing.push('Reality Check (Title, Summary, Source)')
    nextAction.value = 'reality'
  }
  if (!taleStore.hasDetails()) {
    missing.push('Story Details (Story Content)')
    nextAction.value = 'details'
  }

  return missing
})

const isPublishBlocked = computed(() => props.mode === 'publish' && missingRequirements.value.length > 0)

const isStateInvalid = computed(() => {
  if (!currentStatus.value) return false

  // ARCHIVE GUARDS
  if (props.mode === 'archive') {
    if (isDraft.value) {
      return 'Drafts that have never been published cannot be archived. You can delete this draft instead.'
    }
    if (isArchived.value) {
      return 'This story is already archived.'
    }
    if (isHidden.value) {
      return 'Stories restricted by moderation or administration cannot be archived directly.'
    }
  }

   // ARCHIVE GUARDS
  if (props.mode === 'unarchive') {
    if (isDraft.value) {
      return 'Drafts that have never been published cannot be archived. You can delete this draft instead.'
    }
    if (!isArchived.value) {
      return 'This story is not currently archived. This action applies only to archived stories.'
    }
   
  }

  // DELETE GUARDS
  if (props.mode === 'delete') {
    if (isLivePublic.value || isArchived.value) {
      return 'Published or archived stories cannot be deleted directly to preserve reader engagement and record integrity. You can archive live tales instead.'
    }
    if (isHidden.value) {
      return 'Stories flagged by moderation or administration cannot be deleted.'
    }
  }

  // RE-PUBLISH / LAUNCH GUARDS
  if (props.mode === 'publish' && isLivePublic.value) {
    return 'This tale is already published and live on OutScribed.'
  }

  return false
})

// ----------------------------------------------------------------------------
// 3. UNIFIED CONFIGURATION DICTIONARY
// ----------------------------------------------------------------------------
const config = computed(() => {
  switch (props.mode) {
    case 'publish':
      return {
        formTitle: 'Publishing',
        formDescription: 'Publishing makes your story visible to readers on OutScribed. Note that once readers engage with your tale (votes or saves), direct edits will be locked.',
        checkboxLabel: 'I confirm that this story is ready for publication and complies with community guidelines.',
        buttonText: 'Publish Story Now',
        buttonClass: 'btn--success',
        successTitle: 'Tale Published Successfully!',
        successDescription: 'Your tale is live on OutScribed. Reader engagement (votes and saves) will be tracked automatically.'
      }
    case 'archive':
      return {
        formTitle: 'Archiving',
        formDescription: 'Archiving removes this story from public feeds while retaining your draft in your studio archive. You can restore it at any time.',
        checkboxLabel: 'I understand this story will be hidden from public discovery.',
        buttonText: 'Archive Story',
        buttonClass: 'btn--warning',
        successTitle: 'Tale Archived',
        successDescription: 'Your tale has been moved to your studio archive.'
      }
    case 'unarchive':
      return {
        formTitle: 'Unarchiving',
        formDescription: 'Unarchiving releases this story from the archives back into the public feeds where it would become visible to all. You can re-archive it at any time.',
        checkboxLabel: 'I understand this story will once again become visible to public discovery.',
        buttonText: 'Unarchive Story',
        buttonClass: 'btn--success',
        successTitle: 'Tale Unarchived',
        successDescription: 'Your tale has been returned to teh public feeds.'
      }
    case 'delete':
      return {
        formTitle: 'Deleting',
        formDescription: 'Permanently remove this draft from your studio workspace. This action cannot be undone.',
        checkboxLabel: 'I confirm that I want to permanently delete this draft.',
        buttonText: 'Permanently Delete',
        buttonClass: 'btn--danger',
        successTitle: 'Draft Deleted',
        successDescription: 'We were sorry to see that draft go, but we assume you noticed an error and are now ready to polish it.'
      }
  }
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

  // 1. Destructure response directly from store action call
    let response: { success: boolean; error?: APIError }

    // Execute store action based on mode
    switch (props.mode) {
      case 'publish':
        response = await taleStore.launchTale(formData.value)
        break
      case 'archive':
        response = await taleStore.archiveTale(formData.value)
        break
      case 'unarchive':
        response = await taleStore.unArchiveTale(formData.value)
        break
      case 'delete':
        response = await taleStore.deleteTale(formData.value)
        break
      default:
        // Ensures response is always handled or function exits
        throw new Error(`Unsupported mode: ${props.mode}`)
    }

  if(!response.success){

    if(response.error){
      setError(response.error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    // Close down the active overlay panel instance securely
    isCompleted.value = true
  
  }
  
}

// Create New Draft Action
async function handleCreateNewDraft() {
  taleStore.setCurrentAsideView('create')
  taleStore.isAsideHidden = false // Ensures drawer opens cleanly on mobile viewports
}

// Return to Workspace Action
async function handleReturnToWorkspace() {
  taleStore.setCurrentMainView('details')
  taleStore.setCurrentAsideView('detail')
}

</script>

<template>

      <!-- 3. POST-ACTION SUCCESS CANVAS -->
      <template v-if="isCompleted">
        <PageStatusMessage
          :title="config.successTitle"
          :message="config.successDescription"
          type="success"
          icon="check"
          :is-standalone="true"
        >
          <template #actions>
            <template v-if="props.mode === 'delete'">
              <button
                class="btn btn--primary"
                @click="handleCreateNewDraft"
              >
                + Create New Draft
              </button>
              <button
                class="btn btn--secondary"
                @click="handleReturnToWorkspace"
              >
                Return to Workspace
              </button>
            </template>

            <template v-else-if="props.mode === 'publish'">
              <button
                class="btn btn--primary"
                @click="router.push(`/tale/${taleStore.activeTale?.slug}`)"
              >
                View Live Story
              </button>
              <button
                class="btn btn--secondary"
                @click="handleReturnToWorkspace"
              >
                Return to Workspace
              </button>
            </template>

            <template v-else-if="props.mode === 'archive'">
              <button
                class="btn btn--secondary"
                @click="handleReturnToWorkspace"
              >
                Return to Workspace
              </button>
            </template>
          </template>
        </PageStatusMessage>
      </template>

      <!-- 1. PRE-ACTION INVALID STATE NOTICE -->
      <template v-else-if="isStateInvalid">
        <PageStatusMessage
          title="Action Not Available"
          :message="(isStateInvalid as string)"
          type="warning"
          icon="warning"
          :is-standalone="true"
        >
          <template #actions>
            <button
              class="btn btn--primary"
              @click="taleStore.setCurrentMainView('details')"
            >
              Return to Story Editor
            </button>
          </template>
        </PageStatusMessage>
      </template>

      <!-- 2. INCOMPLETE PUBLISH REQUIREMENTS NOTICE -->
      <template v-else-if="isPublishBlocked">
        <PageStatusMessage
          title="Story Incomplete"
          message="Your tale is missing essential sections and cannot be published yet. Please complete the following steps:"
          type="error"
          icon="warning"
          :is-standalone="true"
        >
          <template #desc>
            <ul class="missing-requirements-list">
              <li v-for="(item, index) in missingRequirements" :key="index">
                {{ item }}
              </li>
            </ul>
          </template>

          <template #actions>
            <button
              class="btn btn--primary"
              @click="taleStore.setCurrentMainView(nextAction)"
            >
              Continue Updating
            </button>
            <button
              class="btn btn--secondary"
              @click="taleStore.setCurrentMainView('preview')"
            >
              Preview Story
            </button>
          </template>
        </PageStatusMessage>
      </template>

      <template v-else>
        
  <div class="confirmation-canvas">

    <div class="confirmation-canvas__wrapper">

      <!-- Action Header -->
      <header class="confirmation-canvas__header">
        <h1 class="confirmation-canvas__title">{{ config.formTitle }}</h1>
        <p class="confirmation-canvas__description">{{ config.formDescription }}</p>
      </header>

        <FormProgress :progress="progressState" :is-editor="true" />

      <!-- Confirmation Form Box -->
      <form class="confirmation-card" @submit.prevent="handleFormSubmission">
        <label class="confirmation-card__checkbox-label">
          <input
            v-model="formData.confirm"
            type="checkbox"
            class="confirmation-card__checkbox"
            @change="resetProgress()"
          />
          <span class="confirmation-card__checkmark"></span>
          <span class="confirmation-card__text">{{ config.checkboxLabel }}</span>
        </label>

      <div class="divider-multi divider-multi--thick"><span></span></div>

        <!-- Validation Error Bubble -->
         
         <span v-if="formSubmitted && validationErrors.confirm" class="validation-message">
        {{ validationErrors.confirm }}
      </span>
     
        <!-- Form Actions -->
        <div class="confirmation-card__actions">
          <button
            type="button"
            class="btn btn--primary"
            :disabled="progressState.type === 'Loading'"
            @click="taleStore.setCurrentMainView('details')"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn--secondary"
            :class="[{ 'is-loading': progressState.type === 'Loading' }]"
            :disabled="progressState.type === 'Loading' || lockSubmission || !formData.confirm"
          >
          {{ progressState.type === 'Loading' ? 'Submitting...' : config.buttonText }}
          </button>
        </div>
      </form>

    </div>

  </div>
  
      </template>

</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

.confirmation-canvas {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 3rem 1.5rem;

  &__wrapper {
    width: 100%;
    max-width: @mid-width; /* Aligns with Studio 750px measure */
  }

  &__header {
    margin-bottom: 2rem;
  }

  &__title {
   font-size: 1.3rem; // ~32px
    font-weight: 400;
    line-height: 1.2;
    color: var(--text-color);
    margin-bottom: 0.75rem;
  }

  &__description {
    color: var(--muted-text-color);
  }
}

/* Studio Confirmation Card */
.confirmation-card {
  background-color: var(--light-background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: @link-color;
    box-shadow: var(--box-shadow);
  }

  &__checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    cursor: pointer;
    user-select: none;
  }

  &__checkbox {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--border-color);
    border-radius: 4px;
    margin-top: 0.125rem;
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.15s ease;
    background-color: var(--background-color);

    &:checked {
      background-color: @link-color;
      border-color: @link-color;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
      background-size: 80%;
      background-position: center;
      background-repeat: no-repeat;
    }

    &:focus-visible {
      outline: 2px solid @link-color;
      outline-offset: 2px;
    }
  }

  &__text {
    color: var(--text-color);
    font-weight: 500;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
   
  }
}</style>