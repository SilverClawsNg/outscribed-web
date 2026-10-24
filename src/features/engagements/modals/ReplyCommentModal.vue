<script setup lang="ts">
import { ref, onBeforeMount, computed, watch } from 'vue';
import { useDraftCommentsStore } from '../stores/DraftCommentsStore';
import { useContentCommentsStore } from '../stores/ContentCommentsStore';

import { useModalStore } from '@/stores/modalStore';
import { useRoute } from 'vue-router'
import { useFormProgress } from '@/composables/useFormProgress'
import PageStatusMessage from '@/components/PageStatusMessage.vue' // 🎯 Integrated safely
import RichTextEditor from '@/components/RichTextEditor.vue'
import FormProgress from '@/components/FormProgress.vue'
import { useLoginHint } from '@/utils/authHelper'
import HelpIcon from '@/components/HelpIcon.vue'
import RichTextEditorComponent from '../components/RichTextEditorComponent.vue';

// 📥 Modal context payload passed on activation

const formData = ref({
   detail: ''
})

const commentDraftsStore = useDraftCommentsStore();
const contentStore = useContentCommentsStore();
const modalStore = useModalStore();

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()
const isLoggedIn = useLoginHint()

// Helper to extract visible text without rendering HTML elements
function getPlainText(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  // textContent extracts visible text and converts block tags to natural text
  return doc.body.textContent || ''
}

// 1. Visible plain text extracted reactively
const plainTextDetail = computed(() => getPlainText(formData.value.detail))

// 2. Character length based on what the user actually sees
const detailLength = computed(() => plainTextDetail.value.trim().length)


onBeforeMount(() => {

  resetProgress()

})

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const detailText = formData.value.detail || '';

  return {
  
    detail: detailText === '' || detailText.length < 48 || detailText.length > 4096
      ? 'Detail must be between 48 and 4096 characters'
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

  formSubmitted.value = true;
  if (!isFormValid.value) return;

  startLoading();

  const { success, error} = await commentDraftsStore.replyComment(
    formData.value.detail
  );

  if (!success) {
    if (error) {
      setError(error);
    } else {
      setWarning('An unknown error occurred. Refresh page and try again.');
    }
    return;
  }

  modalStore.pop();
}

</script>

<template>

  <template v-if="!isLoggedIn">

    <PageStatusMessage 
      title="Login Required!" 
      message="Not yet an OutScriber? Its easy and free. If your session expired, sign back in to submit your response."
      icon="warning"
      :is-standalone="true">
      <template #actions>
        <button class="btn btn--primary"  @click="modalStore.push('LoginUser', 'Login')">Login</button>
         <button class="btn btn--primary"  @click="modalStore.push('RegisterUser', 'Register')">Become An OutScriber</button>
      </template>
    </PageStatusMessage>

  </template>
  
  <template v-else>

    
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

</template>

<style lang="less" scoped>
@import "@/assets/css/form-container-editor.less";


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