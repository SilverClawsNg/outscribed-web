<script setup lang="ts">
import { ref, onBeforeMount, computed, watch } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue' // 🎯 Integrated safely
import { type Category } from '@/utils/enumHelper'
import { getValidCategory } from '@/utils/validators'
import { useInsightDraftStore } from '../stores/InsightDraftStore'
import type { CreateRequest } from '../types/InsightsTypes'
import { useRouter } from 'vue-router';

import { CategorySelectItems } from '@/utils/selectItemHelper'
import { useLoginHint } from '@/utils/authHelper'

// --- INITIALIZE STORES ---
const router = useRouter();

function redirectToEditor() {
  router.push(`/insights/editor`)
}

// 🎯 LOCAL CIRCUIT BREAKER: Prevents the UI vacuum
const isSuccessful = ref(false)
const isLoggedIn = useLoginHint()

const props = defineProps<{
  payload: { taleId: string, category: Category } // Arrives untouched as the raw string taleId from your container
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>();

//const targetTale = computed(() => props.payload as CreateRequest)

// Local working state bound strictly to your official contract schema
// Initialized with a placeholder string value for form dropdown validation

const formData = ref<CreateRequest>({
  taleId: '',
  title: '',
  category: '-1'
})

const insightStore = useInsightDraftStore()
const modalStore = useModalStore()
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const titleText = formData.value.title || '';
  const parsedCategory = getValidCategory(formData.value.category);

  return {
  
    title: titleText === '' || titleText.length < 8 || titleText.length > 128
      ? 'Title must be between 8 and 128 characters'
      : '',

    category: !parsedCategory
      ? 'Please select a category.' 
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

  const { success, error } = await insightStore.createInsight(formData.value)

  if(!success){

    if(error){
    setError(error)
    } else{
          setWarning('An unknown error occured. Refresh page and try again')
    }
  } else{
 
    // Close down the active overlay panel instance securely
    //modalStore.pop()
  
    isSuccessful.value = true

    // Trigger the emit cleanly
  emit('success');
  }

  }

  onBeforeMount(async () => {

    formData.value.taleId = props.payload.taleId
    formData.value.category = props.payload.category
resetProgress()


})

</script>

<template>

  <template v-if="!isLoggedIn">
      <PageStatusMessage 
        title="401: Unauthorized!" 
        message="It appears you are not logged in or have been logged out. Login/register to continue."
      >
        <template #actions>
          <button class="btn primary" @click="modalStore.push('LoginUser', 'Login')">Login</button>
          <button class="btn secondary" @click="modalStore.push('RegisterUser', 'Register')">Register</button>
        </template>
      </PageStatusMessage>
    </template>

     <template v-else>
    
  <template v-if=isSuccessful>
        <PageStatusMessage 
        title="201: Created!" 
        message="Your insight has been created but you have to use your editor to update and launch."
      >
        <template #actions>
          <button class="btn primary" @click="redirectToEditor">Editor</button>
          <button class="btn secondary" @click="modalStore.pop">Close</button>
        </template>
      </PageStatusMessage>
  </template>

    <template v-else>

     <div class="form-container">

    <h2>Let's give this tale some substance</h2>

   <FormProgress :progress="progressState" />

    <form @submit.prevent="handleFormSubmission" autocomplete="off">

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
         <select v-model="formData.category" class="form-field">
            <option value="-1">-- select category --</option>
            <option v-for="item in CategorySelectItems" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
      </fieldset>
               <span v-if="formSubmitted && validationErrors.category" class="validation-message">
        {{ validationErrors.category }}
      </span>

        <div class="button-holder">
          <button 
            type="submit" 
            class="btn primary" 
            :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Create' }}
          </button>
        </div>
        
    </form>
  </div>
      
    </template>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>