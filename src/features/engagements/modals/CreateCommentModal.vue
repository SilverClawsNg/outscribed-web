<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeMount, nextTick } from 'vue'
import { useDraftCommentsStore } from '../stores/DraftCommentsStore'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import PageStatusMessage from '@/components/PageStatusMessage.vue' 
import FormProgress from '@/components/FormProgress.vue'
import { useLoginHint } from '@/utils/authHelper'
import RichTextEditorComponent from '../components/RichTextEditorComponent.vue'

// --- DEFINE PROPS & STORES ---
const props = defineProps<{
  payload?: any
}>()

onMounted(async () => {
  await nextTick()
  isMounted.value = true
})


const commentsStore = useDraftCommentsStore()
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
  return (doc.body.textContent || '').replace(/\u00a0/g, ' ')
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