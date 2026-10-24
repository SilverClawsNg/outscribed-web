<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateAddendumRequest } from '../types/TalesTypes'
import { useRouter } from 'vue-router'

const taleStore = useTaleDraftStore()
const router = useRouter()

const newEntryText = ref('')

// Local validation state using PageStatusMessage
const validationWarning = ref<{ title: string; message: string } | null>(null)

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdateAddendumRequest>({
   taleId: '',
  addendum: ''
})


// Moderated / Hidden statuses
const notEngaged = computed(() => {
  return !taleStore.activeTale?.hasEngagement
})



// Function to clone active tale into isolated local form state
function populateFormFromStore() {
  if (!taleStore.activeTale) return

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.taleId = taleStore.activeTale.taleId
  formData.value.addendum = taleStore.activeTale.addendum ?? ''
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


// Convert database string into in-memory array of lines
function parseAddendumString(input?: string | null): string[] {
  if (!input) return []
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

// In-memory list of addendum entries
const addendumEntries = ref<string[]>(
  parseAddendumString(taleStore.activeTale?.addendum)
)

const serializedPayload = computed(() =>
  addendumEntries.value
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join('\n')
)

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---
const lockSubmission = ref(false)

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// Clean character length derived directly from reactive state
const addendumLength = computed(() => serializedPayload.value.length || 0)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

  return {
  
    addendum: addendumLength.value < 10 || addendumLength.value > 1024
      ? 'Addendum must be between 10 and 1024 characters'
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




// --- ENTRY ACTIONS ---


// --- SECTION 2: ADD NEW ENTRY ---
function handleAddNewSection() {
  const cleaned = newEntryText.value.trim()
  if (!cleaned) return

  // Push new section into in-memory list
  addendumEntries.value.push(cleaned)
  newEntryText.value = ''
  validationWarning.value = null
}

// --- SECTION 3: REMOVE EXISTING ENTRY ---
function handleRemoveSection(index: number) {
  addendumEntries.value.splice(index, 1)
  validationWarning.value = null
}

// --- SECTION 1: COMMIT / SAVE ---

async function handleCommitAddendum() {

 // 1. Basic Client Side Pre-validation Guard
  formSubmitted.value = true

  if (!isFormValid.value) {
    setWarning('Ensure all fields are filled out correctly before submission.')
    return
  }

  formData.value.addendum = serializedPayload.value

  startLoading()

 const { success, error } = await taleStore.updateTaleAddendum(formData.value!)

  if(!success){

    if(error){
      setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
     resetProgress()
   formSubmitted.value = false
   taleStore.openPostUpdateModal('addendum')
  
  }
  
}


</script>

<template>


      <!-- 1. PRE-ACTION INVALID STATE NOTICE -->
      <template v-if="notEngaged">
        <PageStatusMessage
          title="Action Not Available"
          message="Your story has not been engaged by community so you can still directly update basic information and story details."
          type="warning"
          icon="warning"
          :is-standalone="true"
        >
          <template #actions>
            <button
              class="btn btn--primary"
              @click="taleStore.setCurrentMainView('basic')"
            >
              Basic
            </button>
              <button
              class="btn btn--secondary"
              @click="taleStore.setCurrentMainView('basic')"
            >
              Details
            </button>
          </template>
          
        </PageStatusMessage>
      </template>

  <template v-else>

    <div class="addendum-manager">

        <div class="addendum-manager__wrapper">
    
        <header class="addendum-manager__header">
            <h2 class="addendum-manager__title">Addendum Manager</h2>
            <p class="addendum-manager__description">
            Append clarifications, cancelaltions, or post-publication corrections. Each entry appears as a numbered point on your published story.
            </p>
        </header>

        <div class="addendum-card">

            <FormProgress :progress="progressState" :is-editor="true" />

            <form id="add-addendum-form" class="addendum-card__form" @submit.prevent="handleCommitAddendum">

                <div class="addendum-card__form-row">
                   
                  <p  class="addendum-card__form-title">
                     <label class="addendum-card__form-label">
                  Add or remove existing sections before commit all changes to your story
                  </label>
                  <span
                      class="addendum-card__character-counter"
                      :class="{ 
                      'is-warning': addendumLength > 1000  && addendumLength <= 1024,
                      'is-over-limit': addendumLength < 10  || addendumLength > 1024 
                      }"
                      >
                      {{ addendumLength.toLocaleString() }} / 1024 chars.
                      </span>
                  </p>
           

            <button 
                    type="submit" 
                    form="add-addendum-form" 
                    class="btn btn--secondary"  
                    :disabled="progressState.type === 'Loading' || lockSubmission || addendumEntries.length === 0"
                    @click="handleCommitAddendum"
                >
            Commit
                </button>

                </div>
                <span v-if="formSubmitted && validationErrors.addendum" class="addendum-card__validation-message">
                    {{ validationErrors.addendum }}
                </span>

            </form>

            <div class="divider-multi divider-multi--thick"><span></span></div>

            <div class="addendum-card__row">
            
                <textarea
                id="addendum-input"
                v-model="newEntryText"
                class="form-control"
                rows="2"
                placeholder="Type in addendum..."
                @keydown.ctrl.enter.prevent="handleAddNewSection"
                ></textarea>
                <button
                type="button"
                class="btn btn--primary"
                :disabled="!newEntryText.trim()"
                @click="handleAddNewSection"
                >
                Add
                </button>
            </div>

            <div class="divider-multi divider-multi--thick"><span></span></div>

            <ol class="addendum-list">
                <li
                v-for="(_, index) in addendumEntries"
                :key="index"
                class="addendum-item"
                >
                <!-- EDIT MODE FOR ENTRY -->
                <div class="addendum-card__row">
                    <textarea
                    v-model="addendumEntries[index]"
                    class="form-control"
                    rows="2"
                    @keydown.enter.prevent="handleRemoveSection(index)"
                    ></textarea>
                    <button
                        type="button"
                        class="btn btn--primary"
                        @click="handleRemoveSection(index)"
                    >
                        Remove
                    </button>
                </div>

                </li>
            </ol>

        </div>

        </div>
        
    </div>
    
  </template>


</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

.addendum-manager {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 3rem 1.5rem;

  &__wrapper {
    width: 100%;
    max-width: @mid-width; /* Aligns with Studio 750px measure */
  }

  &__header {
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 1.3rem; // ~32px
    font-weight: 400;
    line-height: 1.2;
    margin-bottom: 0.75rem;
  }

  &__description {
    color: var(--muted-text-color);
  }
}

.addendum-card{
  background-color: var(--light-background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  @media @phone{
      padding-left: 0.5rem;
      padding-right: 0.5rem;
  }

  &:focus-within {
    border-color: @link-color;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  
&__form-row{
    display: flex;
    justify-content:space-between;
    column-gap: 0.5rem;

    
}

&__row{

    display: flex;
    width: 100%;
    gap: 0.75rem;
    align-items: flex-start;
   margin-bottom: 0.75rem;

    .form-control {
        flex: 1;
        background-color: var(--background-color);
        border: 1px solid var(--border-color);
        padding: 0.5rem;
        border-radius: 4px;
        resize: none;
        overflow: hidden;
    }

}

  

   &__validation-message {
    font-size: 0.85rem;
    line-height:1.1rem;
    background-color: var(--text-color);
    color: var(--background-color);
    border-radius: 50px;
    padding: 1rem 0.6rem;
    max-width: 350px;
    text-align:center;
  }

   &__form-title{
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
  }

  &__form-label{
    color: var(--muted-text-color);
  }
  
    &__character-counter {
     
      text-align: right;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--muted-text-color);
      pointer-events: none; // Allows clicks to pass through to the input
      font-variant-numeric: tabular-nums; // Prevents counter width jitter when numbers change

      &.is-warning {
        color: @warning-color; // Amber when getting close
      }

      &.is-over-limit {
        color: @fatal-color; // Red when exceeded
        font-weight: 700;
      }
    }


}

</style>