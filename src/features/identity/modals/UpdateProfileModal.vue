<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeMount } from 'vue'

import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { useProfileStore } from '../stores/ProfileStore' // 🚀 Import Profile Store
import { APIError } from '@/api/apiTypes'
import type { UpdateProfileRequest } from '../types/IdentityTypes'
import { CountrySelectItems } from '@/utils/selectItemHelper'
import { type Country } from '@/utils/enumHelper'
import { getValidCountry } from '@/utils/validators'


const authStore = useAuthStore()
const modalStore = useModalStore()
const profileStore = useProfileStore() // 💡 Instantiate Store
const profile = computed(() => profileStore.profile!)

// 🎯 1. INITIALIZE LOCAL FORM DATA CONTAINER
// Give it a strict type so your v-models benefit from IDE autocomplete
const formData = ref<UpdateProfileRequest>({
 title: '',
      bio: '',
      country: '-1'
})

const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

const lockSubmission = ref(false)

onBeforeMount(() => {

   // --- ENSURE STORE HAS A CONTENT TO UPDATE ---
  if (!profileStore.profile) {

    // 1. Lock down the form immediately to block accidental click updates
    lockSubmission.value = true
    
    // 2. Pass a friendly, descriptive error straight down to your message layout
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current admin details. Refresh page and try again",
      status: 204 // Standard missing resource code
    })
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.title = profileStore.profile.title ?? ''
  formData.value.bio = profileStore.profile.bio ?? ''
  formData.value.country = (profileStore.profile.country as Country) || '-1'

    resetProgress()

})

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const titleText = formData.value.title || '';
const bioText = formData.value.bio || '';
  const parsedCountry = getValidCountry(formData.value.country);

  return {
  
    title: titleText === '' || titleText.length < 8 || titleText.length > 128
      ? 'Title must be between 8 and 128 characters'
      : '',

    bio: bioText === '' || bioText.length < 10 || bioText.length > 512
      ? 'Bio must be between 10 and 512 characters'
      : '',

     country: !parsedCountry
      ? 'Please select a country.' 
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

async function handleFormSubmission() {

  // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

  const { success, error } = await profileStore.UpdateProfileState(formData.value)

  if(!success){

    if(error){
    setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    // Close down the active overlay panel instance securely
    modalStore.pop()
  
  }
  

}


onMounted(() => {
  resetProgress()
})

</script>

<template>
  
     <div class="form-container">

   <FormProgress :progress="progressState" />

     <fieldset :disabled="progressState.type === 'Loading'">
          <input 
            v-model="formData.title" 
            type="text" 
            id="Title" 
            class="form-field" 
            placeholder="Title" 
          />
        </fieldset>

         <span v-if="formSubmitted && validationErrors.title" class="validation-message">
        {{ validationErrors.title }}
      </span>

          <fieldset :disabled="progressState.type === 'Loading'">
         <select v-model="formData.country" class="form-field">
            <option value="-1">-- select country --</option>
            
            <option v-for="item in CountrySelectItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
      </fieldset>

 <span v-if="formSubmitted && validationErrors.country" class="validation-message">
        {{ validationErrors.country }}
      </span>

      <fieldset :disabled="progressState.type === 'Loading'">
          <textarea 
            v-model="formData.bio" 
            type="text" 
            id="Title" 
            class="form-field" 
            placeholder="Short Bio" 
          ></textarea>
        </fieldset>

         <span v-if="formSubmitted && validationErrors.country" class="validation-message">
        {{ validationErrors.country }}
      </span>

    <form @submit.prevent="handleFormSubmission">

        <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
            :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Update' }}
          </button>
        </div>
    </form>
  </div>
      
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>