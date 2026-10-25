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
import ImageCropper from '@/components/ImageCropper.vue'
import { useRouter, useRoute } from 'vue-router'
import PageStatusMessage from '@/components/PageStatusMessage.vue'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore()
const modalStore = useModalStore()

const router = useRouter()
const route = useRoute()

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

const captionRef = ref<HTMLTextAreaElement | null>(null)

// Function to clone active tale into isolated local form state
function populateFormFromStore() {
  if (!taleStore.activeTale) return

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.taleId = taleStore.activeTale.taleId
  formData.value.caption = taleStore.activeTale.photoCaption ?? ''
  photo.value = taleStore.activeTale.photo ?? null
}

// 2. Watch for draft switches in the aside list and sync local form state
watch(
  () => taleStore.activeTale?.taleId,
  (newId, oldId) => {
    if (newId !== oldId) {
      populateFormFromStore()
    }
  },
  { immediate: true }
)

// Auto-adjust textarea height to fit content without scrollbars
function adjustHeight(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function handleInput() {
  adjustHeight(captionRef.value)
}


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
 populateFormFromStore()
  resetProgress()
})


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// Clean character length derived directly from reactive state
const captionLength = computed(() => formData.value.caption?.length || 0)

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
       resetProgress()
   formSubmitted.value = false
   taleStore.openPostUpdateModal('photo')
  }

}

</script>

<template>

   <template v-if="taleStore.activeTale?.hasEngagement">

    <PageStatusMessage 
      title="Action is Disabled!" 
      message="This tale has been engaged by the community through such means as votes, shares, comments, saves, or flags and in order to protect the integrity of such engagement, you may no longer be able to update cover photo."
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

  <!-- Teleport extracts the cropper out of the side modal and mounts it directly under <body> -->
    <Teleport to="body">
      <ImageCropper
        v-if="showCropper"
        :image-source="rawImageSource"
        :target-width="750"
        :target-height="562"
        aspect-ratio-label="Tale Cover Photo (750 × 562)"
        @crop-complete="handleCropComplete"
        @cancel="showCropper = false"
      />
    </Teleport>
    
     <div class="editorial-canvas">

        <header class="editorial-canvas__header">
  <!-- Left Side: Title & Section Completion Status Indicators -->
  <div class="editorial-canvas__header-info">
    <span class="editorial-canvas__badge">Cover Photo</span>
    
    <div class="editorial-canvas__indicators">
      <span class="editorial-canvas__indicator" :class="{ 'is-complete': taleStore.hasBasicInfo() }">
        Basic {{ taleStore.hasBasicInfo() ? '✓' : '✗' }}
      </span>
      <span class="editorial-canvas__indicator" :class="{ 'is-complete': taleStore.hasDetails() }">
        Story {{ taleStore.hasDetails() ? '✓' : '✗' }}
      </span>
      <span class="editorial-canvas__indicator" :class="{ 'is-complete': taleStore.hasRealityCheck() }">
        Reality Check {{ taleStore.hasRealityCheck() ? '✓' : '✗' }}
      </span>
    </div>
  </div>

  <!-- Right Side: Edge-to-Edge Action Button matching header height (56px) -->
  <button 
    type="submit" 
    form="basic-info-form" 
    class="btn btn--secondary"  
    :disabled="progressState.type === 'Loading' || lockSubmission"
  >
    {{ progressState.type === 'Loading' ? 'Updating...' : 'Update' }}
  </button>
        </header>
     
        <!-- Centered Editorial Content Container (750px Width) -->
        <div class="editorial-form">
            
         <FormProgress :progress="progressState" :is-editor="true" />

    <div class="photo-preview">

     <label>

    <input type="file" accept="image/*" @change="handleFileSelection" style="display: none;" />

             <img v-if="photoUrl" :src="photoUrl" alt="Staged Preview" />
            <img v-else-if="photo" :src="mediaHelper.getUrl(photo, 'tales','full') || undefined" alt="Photo" />
            <span v-else class="placeholder">
              <SvgIcons name="placeholder" :size="100" />
              <span class="placeholder-text">Click to upload photo!</span>
            </span>

     </label>
      
                   <span v-if="formSubmitted && validationErrors.photo" class="editorial-form__validation-message">
                {{ validationErrors.photo }}
            </span>
 </div>

  <form id="cover-photo-form" 
           @submit.prevent="handleFormSubmission" 
           class="editorial-form">
    
         <div class="divider-multi"><span></span></div>

          <!-- 3. Summary Block (Framed as Lead Teaser / Deck) -->
        <div class="editorial-form__row editorial-form__row--offset">
          <textarea
            ref="captionRef"
             v-model="formData.caption" 
            placeholder="Write a short caption for the cover photo..."
            rows="2"
            class="editorial-form__caption"
            @input="handleInput"
            required
          ></textarea>
          
       <div class="editorial-form__field-footer">

             <span v-if="formSubmitted && validationErrors.caption" class="editorial-form__validation-message">
        {{ validationErrors.caption }}
      </span>

                 <span 
            class="editorial-form__character-counter" 
            :class="{ 
              'is-warning': captionLength > 120  && captionLength <= 128,
              'is-over-limit': captionLength < 3  || captionLength > 128 
            }"
          >
            {{ captionLength.toLocaleString() }} / 128
          </span>
           </div>

        </div>

      </form>

        </div>

    </div>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/editor-form.less";


.photo-preview {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    position: relative;

    & label {
        cursor: pointer;
        display: block;
         border-radius: 8px;
            max-width: 100%;
            width: 750px;
            aspect-ratio: 5 / 3;
            height: auto;
            border-radius: 8px;
            background-color: var(--light-background-color);

        input[type="file"] {
            display: none;
        }

        & img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            z-index: 2;
        }

        & .placeholder {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
             color: var(--muted-link-color);

            &:hover {
                 color: @link-color;

                & .placeholder-text {
                    color: @link-color;
                }

            }

            & .placeholder-text {
                color: var(--muted-link-color);
                margin-top: 20px;
            }

        }
    }

}


</style>