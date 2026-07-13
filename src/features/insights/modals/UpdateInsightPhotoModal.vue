<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useInsightDraftStore } from '../stores/InsightDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdatePhotoRequest } from '../types/InsightsTypes'
import { useModalStore } from '@/stores/modalStore'
import { mediaHelper } from '@/utils/mediaHelper'
import SvgIcons from '@/components/SvgIcons.vue'

// --- INITIALIZE STORES ---
const insightStore = useInsightDraftStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdatePhotoRequest>({
   insightId: '',
   base64String: '',
   contentType: '',
   caption: ''
})

// --- ⚙️ COMPONENT STATE ---
const photo = ref<string | null>(null)

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!insightStore.activeInsight) {
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
  formData.value.insightId = insightStore.activeInsight.insightId
  formData.value.caption = insightStore.activeInsight.photoCaption ?? ''
  photo.value = insightStore.activeInsight.photo ?? null
  resetProgress()

})


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const photoText = formData.value.base64String || '';
const captionText = formData.value.caption || '';

  return {
    photo: photoText === null
      ? 'Please select an image to upload before submitting'
      : '',

    caption: captionText === '' || captionText.length < 3 || captionText.length > 128
      ? 'Caption must be between 3 and 128 characters'
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
      resetProgress()
    }
  }, 
  { immediate: true }
)

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, setSuccess, resetProgress } = useFormProgress()
const lockSubmission = ref(false)

// --- CLIENT-SIDE IMAGE PROCESSING & RESIZING PIPELINE ---
const photoUrl = ref<string | null>(null)

// Clear the staging upload pipeline state
function reset() {
  photoUrl.value = null
}

/**
 * 📸 CLEAN CLIENT-SIDE IMAGE READING PIPELINE (No Canvas Resizing)
 */
async function displayPhotoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  startLoading()

  const file = target.files[0]
  if (file == null) {
    setWarning('No file has been uploaded')
    return
  }

  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  const contentType = file.type.toLowerCase()
  const fileSizeInMB = file.size / (1024 * 1024)

  // 1. VALIDATION CHECKS (Keep your rules, but allow modern formats if you want later)
   const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

  if (!validExtensions.includes(fileExtension) || !validTypes.includes(contentType)) {
    setWarning('Only JPG, PNG, WebP, or Avif files are allowed')
    return
  }

  // Increased max size boundary since we want high-res master assets in R2
  if (fileSizeInMB > 5) {
    setWarning('Master file cannot exceed 5mb')
    return
  }

  try {
    // 2. READ RAW IMAGE TO BASE64
    const base64Result = await convertToBase64(file)

    // For local UI preview pane display
    photoUrl.value = base64Result

    // Strip metadata prefix for the backend string requirements
    formData.value.base64String = base64Result.split(',')[1] ?? ''
    
    // Pass the actual content type so .NET can compute the extension dynamically
    formData.value.contentType = contentType 
    
    setSuccess('File successfully attached.')

  } catch (err) {
    setWarning('An error occurred during file reading.')
  } finally {
    target.value = ''
  }
}

/**
 * 🎛️ HELPER: Simple FileReader Promise
 */
function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * 🚀 DISPATCH UNALTERED PAYLOAD TO MUTATION MONOLITH
 */
async function handleFormSubmission() {
  formSubmitted.value = true

  if (!isFormValid.value) return

  startLoading()

  const { success, error } = await insightStore.updateInsightPhoto(formData.value!)

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

    <h2>What image best captures this insight?</h2>

   <FormProgress :progress="progressState" />

 <div class="photo-preview">

     <label class="large">

            <input type="file" accept="image/jpeg,image/png" @change="displayPhotoUpload" style="display: none;" />

             <img v-if="photoUrl" :src="photoUrl" alt="Staged Preview" />
            <img v-else-if="photo" :src="mediaHelper.getUrl(photo, 'insights', 'full') || undefined" alt="Photo" />
            <span v-else class="placeholder">
              <SvgIcons name="placeholder"  />
              <span class="placeholder-text">No Photo!</span>
            </span>

     </label>

 </div>
                <span v-if="formSubmitted && validationErrors.photo" class="validation-message">
        {{ validationErrors.photo }}
      </span>

    <form @submit.prevent="handleFormSubmission" autocomplete="off">

         <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <textarea 
            v-model="formData.caption" 
            type="text" 
            id="Caption" 
            class="form-field" 
            placeholder="Photo caption" 
          ></textarea>
        </fieldset>
               <span v-if="formSubmitted && validationErrors.caption" class="validation-message">
        {{ validationErrors.caption }}
      </span>

   <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
              :disabled="progressState.type === 'Loading' || lockSubmission"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Update' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style lang="less" scoped>
@import "@/assets/css/photo-preview.less";
@import "@/assets/css/form-input.less";
</style>