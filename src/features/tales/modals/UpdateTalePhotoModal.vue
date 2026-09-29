<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdatePhotoRequest } from '../types/TalesTypes'
import { useModalStore } from '@/stores/modalStore'
import { mediaHelper } from '@/utils/mediaHelper'
import SvgIcons from '@/components/SvgIcons.vue'
import HelpIcon from '@/components/HelpIcon.vue'
import ImageCropper from '@/components/ImageCropper.vue'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdatePhotoRequest>({
   taleId: '',
   base64String: '',
   contentType: '',
   caption: ''
})

// --- ⚙️ COMPONENT STATE ---
const photo = ref<string | null>(null)
const rawImageSource = ref<string | null>(null)
const showCropper = ref(false)

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
  formData.value.caption = taleStore.activeTale.photoCaption ?? ''
  photo.value = taleStore.activeTale.photo ?? null
  resetProgress()
})


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const photoText = formData.value.base64String || '';
const captionText = formData.value.caption || '';

  return {
    photo: photoText === ''
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
      // 🎯 Only reset if we are clearing a warning!
      if (progressState.value.type === 'Warning') {
        resetProgress()
      }
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
function handleFileSelection(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  
  // 🛡️ Early return if file is undefined
  if (!file) return

  target.value = ''

  const reader = new FileReader()
  reader.readAsDataURL(file) // TypeScript now knows 'file' is strictly type 'File'
  reader.onload = () => {
    rawImageSource.value = reader.result as string
    showCropper.value = true
  }
}

function handleCropComplete(cropResult: { base64String: string; contentType: string; dataUrl: string }) {
  showCropper.value = false
  photoUrl.value = cropResult.dataUrl
  formData.value.base64String = cropResult.base64String
  formData.value.contentType = cropResult.contentType
  setSuccess('File cropped and ready for submission.')
}

/**
 * 🚀 DISPATCH UNALTERED PAYLOAD TO MUTATION MONOLITH
 */
async function handleFormSubmission() {

  formSubmitted.value = true
  
  if (!isFormValid.value) return

  startLoading()

  const { success, error } = await taleStore.updateTalePhoto(formData.value!)

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

  <!-- Teleport extracts the cropper out of the side modal and mounts it directly under <body> -->
    <Teleport to="body">
      <ImageCropper
        v-if="showCropper"
        :image-source="rawImageSource"
        :target-width="750"
        :target-height="562"
        aspect-ratio-label="Insight Cover Photo (750 × 562)"
        @crop-complete="handleCropComplete"
        @cancel="showCropper = false"
      />
    </Teleport>

     <div class="form-container">

      <div class="form-header">
    
          <h2>What image best captures this tale?</h2>
        <HelpIcon topic="CreateTale" />
    </div>
    

    <FormProgress :progress="progressState" />

    <div class="photo-preview">

     <label class="large">

    <input type="file" accept="image/*" @change="handleFileSelection" style="display: none;" />

             <img v-if="photoUrl" :src="photoUrl" alt="Staged Preview" />
            <img v-else-if="photo" :src="mediaHelper.getUrl(photo, 'tales','full') || undefined" alt="Photo" />
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
          <input 
            v-model="formData.caption" 
            id="Caption" 
            type="text"
            class="form-field" 
            placeholder="Photo caption" 
          >
        </fieldset>
                <span v-if="formSubmitted && validationErrors.caption" class="validation-message">
        {{ validationErrors.caption }}
      </span>
   <div class="button-holder">
          <button 
            type="submit" 
            class="btn btn--secondary"  
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