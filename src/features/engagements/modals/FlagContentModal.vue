<script setup lang="ts">

// --- IMPORTS ---
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { Engageable, FlagRequest } from '../types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import { getValidFlagType } from '@/utils/validators'; 

import { useModalStore } from '@/stores/modalStore'

// --- INITIALIZE STORES ---
const engage = useEngagement()
const modalStore = useModalStore();

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const engageable = computed(() => props.payload as Engageable)

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<FlagRequest>({
   contentId: null,
   content: null,
   notes: '',
   type: null
})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

onBeforeMount(() => {

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.contentId = engageable.value.contentId
  formData.value.content = engageable.value.contentType

  resetProgress()

})

// --- RUN VALIDATION ---

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

  const notesText = formData.value.notes || '';
  const parsedType = getValidFlagType(formData.value.type);

  return {
    type: !parsedType
      ? 'You must tick a flag type' 
      : '',
      
    notes: notesText != '' && notesText.length > 512
      ? 'Notes cannot be more than 512 characters'
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

 const { success, error } = await engage.flag(engageable.value, formData.value!)

  if(!success){

    formSubmitted.value = false

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

</script>

<template>

     <div class="form-container">

    <h2>Why are we taking this {{ engageable.contentType.toLowerCase() }} down?</h2>

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleFormSubmission" autocomplete="off">

        <fieldset :disabled="progressState.type === 'Loading'">
          <div class="ticks">
             <p>
              <input 
                type="radio" 
                id="Misinformation" 
                value="Misinformation" 
                name="type"
                v-model="formData.type"
              />
              <label for="Misinformation">Deliberate Misinformation</label>
            </p>
            <p>
              <input 
                type="radio" 
                id="GraphicContent" 
                value="GraphicContent" 
                name="type"
                v-model="formData.type"
              />
              <label for="GraphicContent">Contains Graphic Content</label>
            </p>

            <p>
              <input 
                type="radio" 
                id="AdvocatesViolence" 
                value="AdvocatesViolence" 
                name="type"
                v-model="formData.type"
              />
              <label for="AdvocatesViolence">Advocates or Incites Violence</label>
            </p>

            <p>
              <input 
                type="radio" 
                id="HateSpeech" 
                value="HateSpeech" 
                name="type"
                v-model="formData.type"
              />
              <label for="HateSpeech">Promotes Racism, Sexism, etc.</label>
            </p>
            
            <p>
              <input 
                type="radio" 
                id="SexualExploitation" 
                value="SexualExploitation" 
                name="type"
                v-model="formData.type"
              />
              <label for="SexualExploitation">Promotes Sexual Exploitation</label>
            </p>

            <p>
              <input 
                type="radio" 
                id="ChildAbuse" 
                value="ChildAbuse" 
                name="type"
                v-model="formData.type"
              />
              <label for="ChildAbuse">Promotes Abuse of Children</label>
            </p>
            
            <p>
              <input 
                type="radio" 
                id="Other" 
                value="Other" 
                name="type"
                v-model="formData.type"
              />
              <label for="Other">Other Reasons --- see notes</label>
            </p>
          </div>
        </fieldset>
     
   <span v-if="formSubmitted  && validationErrors.type" class="validation-message">
    {{ validationErrors.type }}
  </span>

   <fieldset :disabled="progressState.type === 'Loading'">
          <textarea 
            v-model="formData.notes" 
            id="Notes" 
            class="form-field" 
            placeholder="Optional Notes" 
          ></textarea>
        </fieldset>

          <span v-if="formSubmitted  && validationErrors.notes" class="validation-message">
    {{ validationErrors.notes }}
  </span>

   <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
              :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Report' }}
          </button>
        </div>
    </form>
  </div>

</template>

<style scoped>
/* 🌟 Import Quill's native core and bubble theme styles directly from node_modules */
@import "@/assets/css/form-input.less";

</style>