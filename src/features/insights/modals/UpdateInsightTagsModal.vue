<script setup lang="ts">

// --- IMPORTS ---
import { ref, onBeforeMount, onUnmounted, watch, computed } from 'vue'
import { useInsightDraftStore } from '../stores/InsightDraftStore'
import FormProgress from '@/components/FormProgress.vue'
import { useFormProgress } from '@/composables/useFormProgress'
import type { TagRequest, UntagRequest } from '../types/InsightsTypes'
import { useModalStore } from '@/stores/modalStore'

// --- INITIALIZE STORES ---
const insightStore = useInsightDraftStore()
const modalStore = useModalStore()

// --- FORM DATA ---
const tagFormData = ref<TagRequest>({
   insightId: '',
  name: ''
})

const untagFormData = ref<UntagRequest>({
   insightId: '',
  tagId: ''
})

const isAdd = ref(false)
const currentTag = ref<string>('') 

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!insightStore.activeInsight) {
    // 1. Lock down the form immediately to block accidental click updates
    lockSubmission.value = true
    
    // 2. Pass a friendly, descriptive error straight down to your message layout
    setError({
      title: "Content Unavailable",
      detail: "Unable to load current insight details. Refresh page and try again",
      status: 204 // Standard missing resource code
    })
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

 // --- INITIALIZE FORM DATA FROM STORE ---
  tagFormData.value.insightId = insightStore.activeInsight.insightId
  untagFormData.value.insightId = insightStore.activeInsight.insightId
  resetProgress()

})

// --- UI TRANSACTION STATES ---
const { progressState, startLoading, setWarning, setError, setSuccess, resetProgress } = useFormProgress()

// --- RUN VALIDATION ---
const lockSubmission = ref(false)

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const tagText = tagFormData.value.name || '';

  return {
    name: tagText === '' || tagText.length < 3 || tagText.length > 32
      ? 'Tag name must be between 3 and 32 characters'
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

// --- SUBMIT FORM TO STORE ---
async function handleTagSubmission() {

 // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

 const { success, error } = await insightStore.addInsightTag(tagFormData.value!)

  if(!success){

    if(error){
      setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    // Close down the active overlay panel instance securely
   //modalStore.pop()
      setSuccess(tagFormData.value.name + ' was successfully added')
tagFormData.value.name = ''
  }
  
}

// --- SUBMIT FORM TO STORE ---
async function handleUntagSubmission(tagId:string, name: string) {
  
startLoading()

isAdd.value = false
currentTag.value = tagId

 const { success, error } = await insightStore.removeInsightTag({
  insightId: untagFormData.value.insightId,
  tagId: tagId
})

  if(!success){

    if(error){
      setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    setSuccess(name + ' was successfully removed')

    // Close down the active overlay panel instance securely
    //modalStore.pop()
  
  }
  
}


</script>

<template>

     <div class="form-container">

    <h2>Add your insight to trending issues</h2>

   <FormProgress :progress="progressState" />

    <template v-if="insightStore.activeInsight && insightStore.activeInsight.tags.length <= 10">
    <form @submit.prevent="handleTagSubmission" autocomplete="off">
        <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <input 
            v-model="tagFormData.name" 
            id="Name" 
            class="form-field" 
            placeholder="Tag name" 
          />
        </fieldset>
          <span v-if="formSubmitted && validationErrors.name" class="validation-message">
        {{ validationErrors.name }}
      </span>

  <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
            :disabled="progressState.type === 'Loading' || lockSubmission"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Add' }}
          </button>
        </div>

      </form>
    </template>
    <template v-else>
  <p class="warning">
      You have reached the limit of ten (10) tags per insight. To add a new tag, remove an existing one.
    </p>
    </template>
  
    <template v-if="insightStore.activeInsight?.tags && insightStore.activeInsight.tags.length > 0">
      <form 
        v-for="tag in insightStore.activeInsight.tags" 
        :key="tag.tagId" 
        class="tag-row-form"
      >
         <fieldset :disabled="progressState.type === 'Loading' || lockSubmission">
          <input 
            type="text" 
            :value="tag.name" 
            class="form-field" 
            readonly 
          />
        </fieldset>
        
        <div class="button-holder">
    
          <button 
            type="button"
            class="btn primary"
               :disabled="progressState.type === 'Loading' || lockSubmission"
            :class="{active: !isAdd && currentTag == tag.tagId && (progressState.type === 'Loading' || lockSubmission )}"
            @click="handleUntagSubmission(tag.tagId, tag.name)"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Remove' }}
          </button>
        </div>
      </form>
    </template>
    
     <template v-else>
  <p class="warning">
      You have not added any tag to your insight.
    </p>
    </template>

  </div>

</template>

<style scoped>
@import "@/assets/css/form-input.less";
</style>