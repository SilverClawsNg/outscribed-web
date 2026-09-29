<script setup lang="ts">
import { ref, Teleport } from 'vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { computed } from 'vue'
import { useProfileStore } from '../stores/ProfileStore' // 🚀 Import Profile Store
import { mediaHelper } from '@/utils/mediaHelper'
import type { UpdatePhotoRequest } from '../types/IdentityTypes'
import ImageCropper from '@/components/ImageCropper.vue'

const profileStore = useProfileStore() // 💡 Instantiate Store
const profile = computed(() => profileStore.profile!)

// --- ⚙️ COMPONENT STATE ---
const photoUrl = ref<string | null>(null)
const rawImageSource = ref<string | null>(null)
const showCropper = ref(false)
  
// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdatePhotoRequest>({
   base64String: '',
   contentType: ''
})

// Clear the staging upload pipeline state
function reset() {
  formData.value.base64String = ''
  photoUrl.value = null
  rawImageSource.value = null
  showCropper.value = false
  profileStore.uploadStatus = null
  profileStore.uploadError = null
}

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
  profileStore.uploadStatus = 'Uploaded'
}

async function upload() {
  if (!formData.value.base64String) {
    profileStore.uploadStatus = 'Error'
    profileStore.uploadError = 'Upload an image before submitting'
    return
  }
  profileStore.uploadProfilePhoto(formData.value)
}


</script>

<template>

 <!-- Teleport extracts the cropper out of the side modal and mounts it directly under <body> -->
    <Teleport to="body">
      <ImageCropper
        v-if="showCropper"
        :image-source="rawImageSource"
        :target-width="250"
        :target-height="250"
        aspect-ratio-label="Profile Photo (250 × 250)"
        @crop-complete="handleCropComplete"
        @cancel="showCropper = false"
      />
    </Teleport>

  <div class="photo-preview">
    
    <div v-if="profileStore.uploadStatus === 'Loading'" class="loader small" aria-label="Loading profile">
      <p class="loader__dot"></p>
    </div>

    <div v-else-if="profileStore.uploadStatus === 'Uploaded'" class="wrapper">
      <div class="small-button-holder">
        <button type="submit" @click.prevent="upload">
          ✓
        </button>
        <button type="button" @click="reset">X</button>
      </div>
    </div>

    <template v-else-if="profileStore.uploadStatus === 'Error'" class="wrapper">
      <div class="small-button-holder">
        <button type="button" @click="reset">X</button>
      </div>
    </template>

    <label class="small">
      
    <input type="file" accept="image/*" @change="handleFileSelection" style="display: none;" />

      <img v-if="photoUrl" :src="photoUrl" alt="Staged Preview" />
      <img v-else-if="profile.photo" :src="mediaHelper.getUrl(profile.photo, 'profiles') || undefined" alt="Profile Photo" />
      <span v-else class="placeholder">
         <SvgIcons name="placeholder"  />
        <span class="placeholder-text">No Photo!</span>
      </span>

      <span class="edit-badge">
        <SvgIcons name="edit" />
      </span>
    </label>

  </div>

  <p v-if="profileStore.uploadError" class="photo-preview-error">
    {{profileStore.uploadError}}
  </p>
</template>


<style lang="less" scoped>
@import "@/assets/css/photo-preview.less";
</style>