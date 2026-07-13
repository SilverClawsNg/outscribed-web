<script setup lang="ts">
import { ref } from 'vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { computed } from 'vue'
import { useProfileStore } from '../stores/ProfileStore' // 🚀 Import Profile Store
import { mediaHelper } from '@/utils/mediaHelper'
import type { UpdatePhotoRequest } from '../types/IdentityTypes'

const profileStore = useProfileStore() // 💡 Instantiate Store
const profile = computed(() => profileStore.profile!)

// --- ⚙️ COMPONENT STATE ---
const photoUrl = ref<string | null>(null)
  
// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdatePhotoRequest>({
   base64String: '',
   contentType: ''
})

// Clear the staging upload pipeline state
function reset() {
  formData.value.base64String = ''
  photoUrl.value = null
  profileStore.uploadStatus = null
  profileStore.uploadError = null
}

/**
 * 📸 CLIENT-SIDE IMAGE PROCESSING & RESIZING PIPELINE
 */
async function displayPhotoUpload(event: Event) {

  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  profileStore.uploadStatus = 'Loading'
  profileStore.uploadError = null

  const file = target.files[0]

if (file == null) {
    profileStore.uploadError = 'File cannot exceed 3mb'
    profileStore.uploadStatus = 'Error'
    return
  }

  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  const contentType = file.type.toLowerCase()
  const fileSizeInMB = file.size / (1024 * 1024)

  // 1. VALIDATION CHECKS
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

  if (!validExtensions.includes(fileExtension) || !validTypes.includes(contentType)) {
    profileStore.uploadError = 'Only JPG, PNG, WebP, or Avif files are allowed'
    profileStore.uploadStatus = 'Error'
    return
  }

  if (fileSizeInMB > 3) {
    profileStore.uploadError = 'File cannot exceed 3mb'
    profileStore.uploadStatus = 'Error'
    return
  }

  try {
   // 2. READ RAW IMAGE TO BASE64
    const base64Result = await convertToBase64(file)

     // For local UI preview pane display
    photoUrl.value = base64Result

    // Strip metadata prefix for the raw backend Base64 string transfer requirement
    formData.value.base64String = base64Result.split(',')[1] ?? ''

    // Pass the actual content type so .NET can compute the extension dynamically
    formData.value.contentType = contentType 

    profileStore.uploadStatus = 'Uploaded'
  } catch (err) {
    profileStore.uploadError = 'An error occurred during upload processing.'
    profileStore.uploadStatus = 'Error'
  } finally {
    // Clear input value so the change event triggers even if selecting the same file consecutively
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
 * 🚀 DISPATCH COMPRESSED PAYLOAD TO MUTATION MONOLITH
 */

async function upload() {
  if (!formData.value.base64String) {
    profileStore.uploadStatus = 'Error'
    profileStore.uploadError = 'Upload an image before submitting'
    return
  }

  profileStore.uploadProfilePhoto(formData.value)
}

/**
 * 🎛️ HELPER: Standard Canvas Downscaler
 */
function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Maintain exact aspect ratio bounds
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Export as optimized low-weight JPEG
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
</script>

<template>

  <div class="photo-preview">
    
    <div v-if="profileStore.uploadStatus === 'Loading'" class="wrapper">
      <p class="loader"></p>
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
      
      <input type="file" accept="image/jpeg,image/png" @change="displayPhotoUpload" style="display: none;" />

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
/* You can safely drop your layout timeline.less or unique home rules down here */
@import "@/assets/css/photo-preview.less";

</style>