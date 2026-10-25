<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed, nextTick, onMounted } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateRealityCheckRequest } from '../types/TalesTypes'
import { useModalStore } from '@/stores/modalStore'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore()
const modalStore = useModalStore()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdateRealityCheckRequest>({
   taleId: '',
   title: '',
   summary: '',
   sourceUrl: '',
   source: ''
})


// Function to clone active tale into isolated local form state
function populateFormFromStore() {
  if (!taleStore.activeTale) return

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.taleId = taleStore.activeTale.taleId
  formData.value.title = taleStore.activeTale.realityCheckTitle ?? ''
  formData.value.summary = taleStore.activeTale.realityCheckSummary ?? ''
  formData.value.source = taleStore.activeTale.realityCheckSource ?? ''
  formData.value.sourceUrl = taleStore.activeTale.realityCheckUrl ?? ''
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


const showSuccessModal = ref(false)

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

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---
const lockSubmission = ref(false)

// Auto-expanding refs
const titleRef = ref<HTMLTextAreaElement | null>(null)
const summaryRef = ref<HTMLTextAreaElement | null>(null)

function adjustHeight(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function handleInput() {
  adjustHeight(titleRef.value)
  adjustHeight(summaryRef.value)
}

watch(
  () => taleStore.activeTale,
  () => {
    nextTick(() => {
      adjustHeight(titleRef.value)
      adjustHeight(summaryRef.value)
    })
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  adjustHeight(titleRef.value)
  adjustHeight(summaryRef.value)
})


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// Clean character length derived directly from reactive state
const titleLength = computed(() => formData.value.title?.length || 0)
const summaryLength = computed(() => formData.value.summary?.length || 0)
const sourceLength = computed(() => formData.value.source?.length || 0)
const urlLength = computed(() => formData.value.sourceUrl?.length || 0)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const titleText = formData.value.title || '';
const summaryText = formData.value.summary || '';
const sourceText = formData.value.source || '';
const urlText = formData.value.sourceUrl || '';

  return {
  
    title: titleText === '' || titleText.length < 8 || titleText.length > 128
      ? 'Title must be between 8 and 128 characters'
      : '',

       summary: summaryText === '' || summaryText.length < 8 || summaryText.length > 512
      ? 'Summary must be between 8 and 512 characters'
      : '',

       source: sourceText !== '' && (sourceText.length < 2 || sourceText.length > 36)
      ? 'Source must be between 2 and 36 characters'
      : '',

       url: urlText !== '' && (urlText.length < 8 || urlText.length > 256)
      ? 'Source Url must be between 3 and 256 characters'
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

// --- SUBMIT FORM TO STORE ---
async function handleFormSubmission() {

 // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

 const { success, error } = await taleStore.updateTaleRealityCheck(formData.value!)

  if(!success){

    if(error){
      setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    // Close down the active overlay panel instance securely
    resetProgress()
   formSubmitted.value = false
   taleStore.openPostUpdateModal('reality')
  
  }
  
}

</script>

<template>

      <div class="editorial-canvas">
        
        <header class="editorial-canvas__header">
  <!-- Left Side: Title & Section Completion Status Indicators -->
  <div class="editorial-canvas__header-info">
    <span class="editorial-canvas__badge">Reality Check</span>
    
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

              <form id="reality-check-form" 
                @submit.prevent="handleFormSubmission">

                
           <div class="editorial-form__row">

               <!-- 1. Large Title Field (Auto-expanding Textarea) -->
            <textarea
            ref="titleRef"
            v-model="formData.title" 
            placeholder="Title..."
            rows="1"
            class="editorial-form__title"
            @input="handleInput"
            :disabled="progressState.type === 'Loading'  || lockSubmission"
            required
            >
            </textarea>
            <div class="editorial-form__field-footer">

                   <span v-if="formSubmitted && validationErrors.title" class="editorial-form__validation-message">
                {{ validationErrors.title }}
            </span>
                   <span 
                class="editorial-form__character-counter" 
                :class="{ 
                'is-warning': titleLength > 100 && titleLength <= 128,
                'is-over-limit': titleLength < 8  || titleLength > 128 
                }"
            >
                {{ titleLength.toLocaleString() }} / 128
            </span>

           </div>

           </div>

           
          <!-- 3. Summary Block (Framed as Lead Teaser / Deck) -->
        <div class="editorial-form__row">
          <textarea
            ref="summaryRef"
             v-model="formData.summary" 
            placeholder="Provide the real-world facts or legal context to give readers full clarity..."
            rows="2"
            class="editorial-form__summary"
            @input="handleInput"
            required
          ></textarea>
          
       <div class="editorial-form__field-footer">

             <span v-if="formSubmitted && validationErrors.summary" class="editorial-form__validation-message">
        {{ validationErrors.summary }}
      </span>

                 <span 
            class="editorial-form__character-counter" 
            :class="{ 
              'is-warning': summaryLength > 500  && summaryLength <= 512,
              'is-over-limit': summaryLength < 8  || summaryLength > 512 
            }"
          >
            {{ summaryLength.toLocaleString() }} / 512
          </span>
           </div>
        </div>

            <div class="divider-multi"><span></span></div>

            <!-- 2. Source & Source URL Row -->
        <div class="editorial-form__row  editorial-form__row--offset">

            <input 
              v-model="formData.source" 
              type="text"
              placeholder="Source Name (e.g. Electoral Act 2022, Reuters)"
              class="source-field__input"
            />

       <div class="editorial-form__field-footer">

             <span v-if="formSubmitted && validationErrors.source" class="editorial-form__validation-message">
                    {{ validationErrors.source }}
                </span>
            <span 
           class="editorial-form__character-counter" 
            :class="{ 
              'is-warning': sourceLength > 30  && sourceLength <= 36,
              'is-over-limit': sourceLength < 2  || sourceLength > 36 
            }"
          >
            {{ sourceLength.toLocaleString() }}/36
          </span>
           </div>
        </div>

           <div class="editorial-form__row">
            
           <input 
               v-model="formData.sourceUrl" 
              type="url"
              placeholder="https://source-link.com/document"
              class="source-field__input source-field__input--url"
            />
              
       <div class="editorial-form__field-footer">

             <span v-if="formSubmitted && validationErrors.url" class="editorial-form__validation-message">
        {{ validationErrors.url }}
      </span>

                <span 
           class="editorial-form__character-counter" 
            :class="{ 
              'is-warning': urlLength > 240  && urlLength <= 256,
              'is-over-limit': urlLength < 3  || urlLength > 256 
            }"
          >
            {{ urlLength.toLocaleString() }}/256
          </span>
           </div>
        </div>

            </form>

        </div>

    </div>

</template>

<style scoped>
@import "@/assets/css/editor-form.less";

</style>