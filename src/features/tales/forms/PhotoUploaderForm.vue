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
const isDragging = ref(false) // 🔑 Tracks drag state for drop zone UI

const captionRef = ref<HTMLTextAreaElement | null>(null)

// Function to clone active tale into isolated local form state
function populateFormFromStore() {
 if (!taleStore.activeTale) return

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
    lockSubmission.value = true
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current tale details. Refresh page and try again",
      status: 204
    })
    return 
  }

  populateFormFromStore()
  resetProgress()
})

const formSubmitted = ref(false)
const captionLength = computed(() => formData.value.caption?.length || 0)

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

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, setSuccess, resetProgress } = useFormProgress()
const lockSubmission = ref(false)

// --- CLIENT-SIDE IMAGE PROCESSING & RESIZING PIPELINE ---
const photoUrl = ref<string | null>(null)

function reset() {
  photoUrl.value = null
}

// Centralized file processor used by both input change and drag drop
function processSelectedFile(file: File) {
  if (!file.type.startsWith('image/')) {
    setWarning('Please select a valid image file.')
    return
  }

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    rawImageSource.value = reader.result as string
    showCropper.value = true
  }
}

/**
 * 📸 FILE INPUT CHANGE HANDLER
 */
function handleFileSelection(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  target.value = '' // Clear input so same file can be re-selected if needed
  if (file) processSelectedFile(file)
}

/**
 * 📥 DRAG AND DROP HANDLERS
 */
// --- REFS FOR FILE INPUT ---
const fileInputRef = ref<HTMLInputElement | null>(null)

// Programmatically open the file dialog when the custom drop zone is clicked
function triggerFileInput() {
  if (progressState.value.type === 'Loading' || lockSubmission.value) return
  fileInputRef.value?.click()
}

// --- DRAG AND DROP HANDLERS ---
function handleDragOver(event: DragEvent) {
  if (progressState.value.type === 'Loading' || lockSubmission.value) return
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  // Ensure we are leaving the actual drop zone container, not just hovering over child elements
  if (event.currentTarget === event.target) {
    isDragging.value = false
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false

  if (progressState.value.type === 'Loading' || lockSubmission.value) return

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
   if(files[0]) processSelectedFile(files[0])
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
  <h1 class="editorial-canvas__badge">Cover Photo</h1>

  <!-- Right Side: Edge-to-Edge Action Button matching header height (56px) -->
  <button 
    type="submit" 
    form="basic-info-form" 
    class="btn btn--secondary"  
    :disabled="progressState.type === 'Loading' || lockSubmission"
  >
    {{ progressState.type === 'Loading' ? 'Saving...' : 'Save' }}
  </button>
        </header>

      <div class="editorial-canvas__body">
  <!-- Centered Editorial Content Container -->
  <div class="editorial-form">
    <div class="editorial-form__contents">
      <FormProgress :progress="progressState" :is-editor="true" />

      <form id="cover-photo-form" @submit.prevent="handleFormSubmission">

        <!-- 1. Photo Upload Field Group -->
      
        <!-- 1. Photo Upload Field Group -->
<div class="editorial-form__group">
  <label class="editorial-form__label">Cover Photo</label>
  
  <div class="photo-preview">
    <div 
      class="photo-preview__upload-zone"
      :class="{ 'is-dragging': isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- Hidden file input triggered programmatically -->
      <input 
        ref="fileInputRef"
        type="file" 
        accept="image/*" 
        @change="handleFileSelection" 
        style="display: none;" 
        :disabled="progressState.type === 'Loading' || lockSubmission"
      />

      <img v-if="photoUrl" :src="photoUrl" alt="Staged Preview" class="photo-preview__image" />
      <img v-else-if="photo" :src="mediaHelper.getUrl(photo, 'tales', 'full') || undefined" alt="Photo" class="photo-preview__image" />
      <div v-else class="photo-preview__placeholder">
        <SvgIcons name="placeholder" :size="80" />
        <span class="photo-preview__placeholder-text">
          {{ isDragging ? 'Drop image here...' : 'Click or drag image to upload cover photo' }}
        </span>
      </div>
    </div>
  </div>

  <div class="editorial-form__field-footer">
    <span v-if="formSubmitted && validationErrors.photo" class="editorial-form__validation-message">
      {{ validationErrors.photo }}
    </span>
  </div>
</div>

        <div class="divider-multi"><span></span></div>

        <!-- 2. Photo Caption Group -->
        <div class="editorial-form__group">
          <label class="editorial-form__label" for="photo-caption">Photo Caption & Attributions</label>
          <div class="editorial-form__row">
            <textarea
              id="photo-caption"
              ref="captionRef"
              v-model="formData.caption" 
              placeholder="Write a short caption or credit for the cover photo..."
              rows="2"
              class="editorial-form__summary"
              @input="handleInput"
              :disabled="progressState.type === 'Loading' || lockSubmission"
              required
            ></textarea>
          </div>
          <div class="editorial-form__field-footer">
            <span v-if="formSubmitted && validationErrors.caption" class="editorial-form__validation-message">
              {{ validationErrors.caption }}
            </span>
            <span 
              class="editorial-form__character-counter" 
              :class="{ 
                'is-warning': captionLength > 120 && captionLength <= 128,
                'is-over-limit': captionLength < 3 || captionLength > 128 
              }"
            >
              {{ captionLength.toLocaleString() }} / 128
            </span>
          </div>
        </div>

      </form>
    </div>
  </div>
</div>
     
    </div>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/editor-form.less";
.photo-preview {
  width: 100%;
  position: relative;

  &__upload-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 240px;
    background-color: var(--background-color);
    border: 2px dashed var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.2s ease-in-out;

    &:hover {
      border-color: @link-color;
      background-color: var(--light-background-color);
    }

    &.is-dragging {
      border-color: @link-color;
      background-color: rgba(var(--link-color-rgb, 0, 119, 255), 0.08);
      border-style: solid;
      transform: scale(1.005);
    }
  }

  &__image {
    width: 100%;
    max-height: 380px;
    object-fit: cover;
    border-radius: 6px;
    pointer-events: none;
  }

  &__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem;
    color: var(--muted-text-color);
    text-align: center;
    pointer-events: none; // 🔑 Crucial so drag events register cleanly on the parent div
  }

  &__placeholder-text {
    font-size: 0.95rem;
    font-weight: 500;
  }
}
</style>