<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, watch, computed, nextTick, onMounted } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { UpdateRequest } from '../types/TalesTypes'
import { useModalStore } from '@/stores/modalStore'
import { getValidCategory, getValidCountry } from '@/utils/validators'
import { CategorySelectItems, CountrySelectItems } from '@/utils/selectItemHelper'
import { useRouter, useRoute } from 'vue-router'
import PageStatusMessage from '@/components/PageStatusMessage.vue'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore()
const modalStore = useModalStore()

const router = useRouter()
const route = useRoute()

// --- DEFINE PAGE FUNCTIONS ---
const currentPath = encodeURIComponent(route.fullPath)

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<UpdateRequest>({
   taleId: '',
   title: '',
   category: '-1',
   summary: '',
   country: '-1'
})

// Function to clone active tale into isolated local form state
function populateFormFromStore() {
  if (!taleStore.activeTale) return

 // --- INITIALIZE FORM DATA FROM STORE ---
  formData.value.taleId = taleStore.activeTale.taleId
  formData.value.title = taleStore.activeTale.title
  formData.value.summary = taleStore.activeTale.summary ?? ''
  formData.value.country = taleStore.activeTale.country
  formData.value.category = taleStore.activeTale.category
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

  populateFormFromStore()
  resetProgress()
})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---
const lockSubmission = ref(false)

// References for auto-expanding textareas
const titleRef = ref<HTMLTextAreaElement | null>(null)
const summaryRef = ref<HTMLTextAreaElement | null>(null)

// Auto-adjust textarea height to fit content without scrollbars
function adjustHeight(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function handleInput() {
  adjustHeight(titleRef.value)
  adjustHeight(summaryRef.value)
}

// Watch store's initialization & active tale state changes
watch(
  [() => taleStore.isInitializing, () => taleStore.activeTale],
  async ([isInitializing, activeTale]) => {
    // 1. Still fetching initial load — wait silently
    if (isInitializing) return

    // 2. Fetch completed, but no active tale exists (Empty bucket or load error)
    if (!activeTale) {
      lockSubmission.value = true
      return
    }

    // 3. Draft available — initialize inputs and Quill
    resetProgress()
    lockSubmission.value = false
     nextTick(() => {
      adjustHeight(titleRef.value)
      adjustHeight(summaryRef.value)
    })
  },
  { immediate: true }
)

onMounted(() => {
  adjustHeight(titleRef.value)
  adjustHeight(summaryRef.value)
})


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// Clean character length derived directly from reactive state
const titleLength = computed(() => formData.value.title?.length || 0)

// Clean character length derived directly from reactive state
const summaryLength = computed(() => formData.value.summary?.length || 0)


// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const titleText = formData.value.title || '';
const parsedCategory = getValidCategory(formData.value.category);
const parsedCountry = getValidCountry(formData.value.country);
const summaryText = formData.value.summary || '';

  return {
  
    title: titleText === '' || titleText.length < 8 || titleText.length > 128
      ? 'Title must be between 8 and 128 characters'
      : '',

    category: !parsedCategory
      ? 'Please select a category.' 
      : '',

        country: !parsedCountry
      ? 'Please select a country.' 
      : '',

      summary: summaryText === '' || summaryText.length < 8 || summaryText.length > 512
      ? 'Summary must be between 8 and 512 characters'
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

 const { success, error } = await taleStore.updateTaleBasic(formData.value)

  if(!success){

    if(error){
      setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
      resetProgress()
   formSubmitted.value = false
   taleStore.openPostUpdateModal('basic')
  
  }
  
}
</script>

<template>

  <!-- POST-SUBMISSION GUIDANCE VIEW -->

   <template v-if="taleStore.activeTale?.hasEngagement">

    <PageStatusMessage 
      title="Action is Disabled!" 
      message="This tale has been engaged by the community through such means as votes, shares, comments, saves, or flags and in order to protect the integrity of such engagement, you may no longer be able to update basic information."
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

  <div class="editorial-canvas">

        <header class="editorial-canvas__header">
  <!-- Left Side: Title & Section Completion Status Indicators -->
  <h1 class="editorial-canvas__badge">Basic Information</h1>

  <div class="editorial-canvas__btn-holder">
 <!-- Right Side: Edge-to-Edge Action Button matching header height (56px) -->
  <button 
    type="submit" 
    form="basic-info-form" 
    class="btn btn--secondary"  
    :disabled="progressState.type === 'Loading' || lockSubmission"
  >
    {{ progressState.type === 'Loading' ? 'Saving...' : 'Save' }}
  </button>
  </div>
 
        </header>
<div class="editorial-canvas__body">
  <!-- Centered Editorial Content Container -->
  <div class="editorial-form">
    <div class="editorial-form__contents">
      <FormProgress :progress="progressState" :is-editor="true" />

      <form id="basic-info-form" @submit.prevent="handleFormSubmission">

        <!-- 1. Title Field Group -->
        <div class="editorial-form__group">
          <label class="editorial-form__label" for="tale-title">Story Title</label>
          <div class="editorial-form__row">
            <textarea
              id="tale-title"
              ref="titleRef"
              v-model="formData.title" 
              placeholder="Enter a compelling title..."
              rows="1"
              class="editorial-form__title"
              @input="handleInput"
              :disabled="progressState.type === 'Loading' || lockSubmission"
              required
            ></textarea>
          </div>
          <div class="editorial-form__field-footer">
            <span v-if="formSubmitted && validationErrors.title" class="editorial-form__validation-message">
              {{ validationErrors.title }}
            </span>
            <span 
              class="editorial-form__character-counter" 
              :class="{ 
                'is-warning': titleLength > 100 && titleLength <= 128,
                'is-over-limit': titleLength > 128 
              }"
            >
              {{ titleLength.toLocaleString() }} / 128
            </span>
          </div>
        </div>

        <!-- 2. Summary Field Group -->
        <div class="editorial-form__group">
          <label class="editorial-form__label" for="tale-summary">Story Summary / Deck</label>
          <div class="editorial-form__row">
            <textarea
              id="tale-summary"
              ref="summaryRef"
              v-model="formData.summary" 
              placeholder="Write a short summary or story deck to introduce your piece..."
              rows="3"
              class="editorial-form__summary"
              @input="handleInput"
              required
            ></textarea>
          </div>
          <div class="editorial-form__field-footer">
            <span v-if="formSubmitted && validationErrors.summary" class="editorial-form__validation-message">
              {{ validationErrors.summary }}
            </span>
            <span 
              class="editorial-form__character-counter" 
              :class="{ 
                'is-warning': summaryLength > 500 && summaryLength <= 512,
                'is-over-limit': summaryLength < 8 || summaryLength > 512 
              }"
            >
              {{ summaryLength.toLocaleString() }} / 512
            </span>
          </div>
        </div>

         <div class="divider-multi divider-multi--thick"><span></span></div>

        <!-- 3. Side-by-Side Metadata Row (Category & Country) -->
        <div class="editorial-form__meta-row">
          
          <!-- Category Field -->
          <div class="editorial-form__group editorial-form__meta-group">
            <label class="editorial-form__label" for="tale-category">Category</label>
            <div class="editorial-form__row">
              <select 
                id="tale-category" 
                v-model="formData.category" 
                class="form-field"
                :disabled="progressState.type === 'Loading' || lockSubmission"
              >
                <option value="-1">-- select category --</option>
                <option v-for="item in CategorySelectItems" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
            <div class="editorial-form__field-footer">
              <span v-if="formSubmitted && validationErrors.category" class="editorial-form__validation-message">
                {{ validationErrors.category }}
              </span>
            </div>
          </div>

          <!-- Country Field -->
          <div class="editorial-form__group editorial-form__meta-group">
            <label class="editorial-form__label" for="tale-country">Country Context</label>
            <div class="editorial-form__row">
              <select 
                id="tale-country" 
                v-model="formData.country" 
                class="form-field"
                :disabled="progressState.type === 'Loading' || lockSubmission"
              >
                <option value="-1">-- select country --</option>
                <option v-for="item in CountrySelectItems" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
            <div class="editorial-form__field-footer">
              <span v-if="formSubmitted && validationErrors.country" class="editorial-form__validation-message">
                {{ validationErrors.country }}
              </span>
            </div>
          </div>

        </div>

      </form>
    </div>
  </div>
</div>
    </div>

  </template>

</template>

<style scoped>
@import "@/assets/css/editor-form.less";
</style>