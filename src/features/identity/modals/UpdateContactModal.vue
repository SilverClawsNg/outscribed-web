<script setup lang="ts">
import { ref, onMounted, watch, onBeforeMount, computed } from 'vue'

import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { useProfileStore } from '../stores/ProfileStore' // 🚀 Import Profile Store

const authStore = useAuthStore()
const modalStore = useModalStore()
const profileStore = useProfileStore() // 💡 Instantiate Store

// 📋 Sandbox Form State
const formTitle = ref('')

// 🔄 Sync up the sandbox directly from the profile store's active context target
watch(() => profileStore.activeContactDto, (dto) => {
  formTitle.value = dto?.title ?? ''
}, { immediate: true })


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

 <fieldset :disabled="true">
          <input 
           :value="profileStore.activeContactType"
            type="text" 
            id="Title" 
            class="form-field" 
            placeholder="Title" 
          />
        </fieldset>

                <fieldset v-if="profileStore.activeContactType === 'Facebook'" class="social">
                      <span>https://www.facebook.com/</span>
                       <input 
                          v-model="formTitle" 
                          type="text" 
                          id="Title" 
                          class="form-field" 
                          placeholder="Handle" 
                        />

                  </fieldset>
                    <fieldset v-else-if="profileStore.activeContactType === 'LinkedIn'" class="social">
                       <span>https://www.linkedin.com/in/</span>
                       <input 
                          v-model="formTitle" 
                          type="text" 
                          id="Title" 
                          class="form-field" 
                          placeholder="Handle" 
                        />

                  </fieldset>
                     <fieldset v-else-if="profileStore.activeContactType === 'Twitter'" class="social">
                       <span>https://www.x.com/</span>
                       <input 
                          v-model="formTitle" 
                          type="text" 
                          id="Title" 
                          class="form-field" 
                          placeholder="Handle" 
                        />

                  </fieldset>
                     <fieldset v-else class="social">
                       <input 
                          v-model="formTitle" 
                          type="text" 
                          id="Title" 
                          class="form-field" 
                          placeholder="Title" 
                        />

                  </fieldset>

                     <span v-if="formSubmitted && validationErrors.title" class="validation-message">
        {{ validationErrors.title }}
      </span>

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