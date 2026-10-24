<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useDraftCommentsStore } from '../stores/DraftCommentsStore'
import RichTextEditor from '@/components/RichTextEditor.vue'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateCommentRequest } from '../types/EngagementTypes'
import { useModalStore } from '@/stores/modalStore'
import HelpIcon from '@/components/HelpIcon.vue'
import RichTextEditorComponent from '../components/RichTextEditorComponent.vue'

// --- INITIALIZE STORES ---
const draftStore = useDraftCommentsStore()
const modalStore = useModalStore()

// --- DEFINE FORM DATA ---


const formData = ref({
  detail: ''
})

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!draftStore.activeComment) {
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

console.log(`comment is ${draftStore.activeComment.detail}`)

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.detail = draftStore.activeComment.detail ?? ''
  resetProgress()

})

// --- UI TRANSACTION STATES ---
const lockSubmission = ref(false)
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// Clean character length derived directly from reactive state
const detailLength = computed(() => formData.value.detail?.length || 0)

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

const { success, error } = await draftStore.updateCommentDetails(formData.value.detail)

  if(!success){

    if(error){
      if(error.title === 'Blank Response'){
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
    
 <div class="comment-modal-shell">

    <!-- 2. FORM PROGRESS (Loading Gif / Backend Error Message) -->
    <FormProgress :progress="progressState" />

    <!-- 3. MAIN FORM BODY -->
    <form class="comment-modal-form" @submit.prevent="handleFormSubmission">
      <!-- RICH TEXT EDITOR (Embedded Toolbar + Save) -->
      <RichTextEditorComponent
        v-model="formData.detail"
        :is-submitting="progressState.type === 'Loading'"
        @save="handleFormSubmission"
      />

      <!-- 4. BOTTOM CHARACTER COUNTER & VALIDATION MESSAGE -->
      <div class="form-counter-bar">
        <span v-if="formSubmitted && validationErrors" class="validation-message">
          {{ validationErrors.detail }}
        </span>
        <span v-else class="spacer"></span>

        <span
          class="character-counter"
            :class="{ 
              'is-warning': detailLength > 4000 && detailLength <= 4096,
              'is-over-limit': detailLength < 48 || detailLength > 4096 
            }"
        >
          {{ detailLength.toLocaleString() }}/4096
        </span>
      </div>
    </form>
  </div>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.comment-modal-shell {
  width: 100%;
  overflow: hidden;

  .comment-modal-form {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .form-counter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.25rem;
      border-top: 1px solid var(--border-color);
      padding-top: 0.5rem;
      margin-top: 0.5rem;
      position: relative;

       .validation-message {
          font-size: 0.85rem;
          line-height:1.1rem;
          color: @fatal-color;
        }
        
    .character-counter {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--muted-text-color);
      pointer-events: none; // Allows clicks to pass through to the input
      font-variant-numeric: tabular-nums; // Prevents counter width jitter when numbers change

      &.is-warning {
        color: @warning-color; // Amber when getting close
      }

      &.is-over-limit {
        color: @fatal-color; // Red when exceeded
        font-weight: 700;
      }
    }


      .spacer {
        flex: 1;
      }

    }
  }
}
</style>