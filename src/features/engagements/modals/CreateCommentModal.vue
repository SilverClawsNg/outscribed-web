<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeMount } from 'vue';
import { useDraftCommentsStore } from '../stores/DraftCommentsStore';
import { useContentCommentsStore } from '../stores/ContentCommentsStore';

import { useModalStore } from '@/stores/modalStore';
import type { ActiveContentContext } from '../types/EngagementTypes';
import { useFormProgress } from '@/composables/useFormProgress'
import PageStatusMessage from '@/components/PageStatusMessage.vue' 
import RichTextEditor from '@/components/RichTextEditor.vue'
import FormProgress from '@/components/FormProgress.vue'
import { useLoginHint } from '@/utils/authHelper'
import HelpIcon from '@/components/HelpIcon.vue'

// --- DEFINE FORM DATA ---
const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const content = computed(() => props.payload as ActiveContentContext)

const formData = ref({
   detail: ''
})

const commentsStore = useDraftCommentsStore();
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

  const { success, error} = await commentsStore.createComment(
    formData.value.detail!
  );

  if (!success) {
    if (error) {
      setError(error);
    } else {
      setWarning('An unknown error occurred. Refresh page and try again');
    }
    return;
  }

  if (modalStore.isPreviousModal('ContentComments')) {
      // Flow A: Opened from comments list -> Pop back to existing list
      modalStore.pop();
    } else {
      // Flow B: Opened from Content/Stats page -> Replace self with ContentComments view
      modalStore.replace('ContentComments', 'Comments');
    }

}

</script>

<template>

  <template v-if="!isLoggedIn">

    <PageStatusMessage 
      title="Login Required!" 
      message="Not yet an OutScriber? Its easy and free. If your session expired, sign back in to submit your comment."
      icon="warning"
      :is-standalone="true">
      <template #actions>
        <button class="btn btn--primary"  @click="modalStore.push('LoginUser', 'Login')">Login</button>
         <button class="btn btn--primary"  @click="modalStore.push('RegisterUser', 'Register')">Become An OutScriber</button>
      </template>
    </PageStatusMessage>

  </template>
  
  <template v-else>

     <div class="form-container">

   <FormProgress :progress="progressState" />

    <form>

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
        <div class="button-holder">
          <button 
            type="button" 
            class="btn btn--secondary"  
            @click="handleFormSubmission"
            :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Comment' }}
          </button>
        </div>
       
    </form>
    
  </div>

</template>

</template>

<style lang="less" scoped>
@import "@/assets/css/form-container-editor.less";
</style>