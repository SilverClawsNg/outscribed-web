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

onBeforeMount(() => {

  resetProgress()

})

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const detailText = formData.value.detail || '';

  return {
  
    detail: detailText === '' || detailText.length < 10 || detailText.length > 4096  || detailText === '<p></p>'
      ? 'Detail must be between 10 and 4096 characters'
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
      message="It appears you are not logged in or have been logged out. Login/register to continue.">
      <template #actions>
        <button class="btn btn--primary"  @click="modalStore.push('LoginUser', 'Login')">Login</button>
         <button class="btn btn--primary"  @click="modalStore.push('RegisterUser', 'Register')">Register</button>
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

           <span v-if="formSubmitted && validationErrors.detail" class="validation-message">
        {{ validationErrors.detail }}
      </span>

        <div class="button-holder">
          <button 
            type="button" 
            class="btn btn--primary"  
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