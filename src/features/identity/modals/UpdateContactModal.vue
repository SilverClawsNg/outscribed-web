<script setup lang="ts">
import { ref, onMounted, watch, onBeforeMount, computed } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { useProfileStore } from '../stores/ProfileStore' // 🚀 Import Profile Store
import { type AccountStatus, type ContactType } from '@/utils/enumHelper.ts'

const modalStore = useModalStore()
const profileStore = useProfileStore() // 💡 Instantiate Store

// 📋 Sandbox Form State
const formTitle = ref('')

// 🔄 Sync up the sandbox directly from the profile store's active context target
watch(() => profileStore.activeContactDto, (dto) => {
  formTitle.value = dto?.title ?? ''
}, { immediate: true })


interface ContactConfig {
  prefix?: string
  placeholder: string
  inputType: 'text' | 'url' | 'tel'
}

type ValidShareableContactType = Exclude<ContactType, 'CopyLink'>

// Explicitly mapping every non-null ContactType enum value
const CONTACT_CONFIGS: Record<ValidShareableContactType, ContactConfig> = {
  Facebook: {
    prefix: 'https://www.facebook.com/',
    placeholder: 'Handle',
    inputType: 'text'
  },
  LinkedIn: {
    prefix: 'https://www.linkedin.com/in/',
    placeholder: 'Handle',
    inputType: 'text'
  },
  Twitter: {
    prefix: 'https://www.x.com/',
    placeholder: 'Handle',
    inputType: 'text'
  },
  Instagram: {
    prefix: 'https://www.instagram.com/',
    placeholder: 'Handle',
    inputType: 'text'
  },
  TikTok: {
    prefix: 'https://www.tiktok.com/@',
    placeholder: 'Username',
    inputType: 'text'
  },
  WhatsApp: {
    prefix: 'https://wa.me/',
    placeholder: 'Phone number with country code',
    inputType: 'tel'
  },
  Telephone: {
    placeholder: 'Phone number (e.g. +1 555-0199)',
    inputType: 'tel'
  },
  Website: {
    placeholder: 'https://yourwebsite.com',
    inputType: 'url'
  },
  Email: {
    placeholder: 'Email address',
    inputType: 'text'
  }
}

const DEFAULT_CONFIG: ContactConfig = {
  placeholder: 'Select a contact type',
  inputType: 'text'
}
// 🎯 Safely handles null or 'CopyLink' by falling back to DEFAULT_CONFIG
const currentContactConfig = computed<ContactConfig>(() => {
  const activeType = profileStore.activeContactType

  // If activeType is null, 'CopyLink', or unmapped, return default config safely
  if (!activeType || activeType === 'CopyLink' || !(activeType in CONTACT_CONFIGS)) {
    return DEFAULT_CONFIG
  }

  return CONTACT_CONFIGS[activeType as ValidShareableContactType]
})

const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

onBeforeMount(() => {

  resetProgress()

})

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const titleText = formTitle.value || '';

  return {
  
    title: titleText === ''
      ? 'Enter a valid title'
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

   // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()
  const { success, error } = await profileStore.updateContactState(formTitle.value!)

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

   <form @submit.prevent="handleFormSubmission">
  <!-- Active Contact Type Title -->
  <fieldset :disabled="true">
    <input 
      :value="profileStore.activeContactType" 
      type="text" 
      id="ContactType" 
      class="form-field" 
      placeholder="Type" 
    />
  </fieldset>

  <!-- Dynamic Social/Contact Input Fieldset -->
  <fieldset class="social">
    <!-- Prefix URL / Country Code Label (if applicable) -->
    <span v-if="currentContactConfig.prefix">
      {{ currentContactConfig.prefix }}
    </span>

    <input 
      v-model="formTitle" 
      :type="currentContactConfig.inputType" 
      id="Title" 
      class="form-field" 
      :placeholder="currentContactConfig.placeholder" 
    />
  </fieldset>

  <span v-if="formSubmitted && validationErrors.title" class="validation-message">
    {{ validationErrors.title }}
  </span>

  <div class="button-holder">
    <button 
      type="submit" 
      class="btn btn--secondary"  
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