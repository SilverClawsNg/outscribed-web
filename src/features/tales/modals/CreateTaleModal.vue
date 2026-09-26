<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeMount } from 'vue'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue' // 🎯 Integrated safely
import { getValidCategory } from '@/utils/validators'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import type { CreateRequest, CreateTalePayload } from '../types/TalesTypes'
import { useRouter } from 'vue-router';

import { CategorySelectItems } from '@/utils/selectItemHelper'
import { useLoginHint } from '@/utils/authHelper'
import HelpIcon from '@/components/HelpIcon.vue'
import { CountryDescriptions } from '@/utils/descriptors'

const router = useRouter();

function redirectToEditor() {
  router.push(`/tales/editor`)
}

// 🎯 LOCAL CIRCUIT BREAKER: Prevents the UI vacuum
const isInitializing = ref(true)
const isLoggedIn = useLoginHint()
const isSuccessful = ref(false)
const pageTitle = ref('We can\'t wait to see what you are about to spin')


// 1. Mark payload as optional with a '?'
const props = defineProps<{
  payload?: CreateTalePayload | null;
}>();

// Extract pre-selected Category (if passed)
const preselectedCategory = computed<string | null>(() => {
  if (!props.payload) return null;
  if (typeof props.payload === 'string') return props.payload;
  return props.payload.category || '-1';
});

// Extract pre-selected Country (if passed)
const preselectedCountry = computed<string | null>(() => {
  if (props.payload && typeof props.payload === 'object') {
    return props.payload.country || null;
  }
  return null;
});

// Local working state bound strictly to your official contract schema
// Initialized with a placeholder string value for form dropdown validation

const formData = ref<CreateRequest>({
  title: '',
  category: '-1' as any,
  country: null
})

const taleStore = useTaleDraftStore()
const authStore = useAuthStore()
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

onBeforeMount(() => {
  // Assign the string value directly, not a Ref<string>
  formData.value.category = (preselectedCategory.value ?? '-1') as any;
  formData.value.country = (preselectedCountry.value) as any;
 if (preselectedCountry.value && preselectedCountry.value in CountryDescriptions) {
  const countryKey = preselectedCountry.value as keyof typeof CountryDescriptions;
  pageTitle.value = `You are now outscribing into ${CountryDescriptions[countryKey]}`;
}
  resetProgress();
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

  const { success, error } = await taleStore.createTale(formData.value)

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
  
  }

  }

  
  onBeforeMount(async () => {

resetProgress()


})

onMounted(async () => {

  //start with initializing set to true so page starts on loading

  if(!isLoggedIn.value){ //if there is no hint, show login form
    isInitializing.value = false 
  }
  else{

      // 1. Force the store to finish its network/hint verification routine completely
      var result = await authStore.verifyAuthoring()

      if(result){
      // 2. Hand control over to the store's computed workflow state
      isInitializing.value = false
      }
  
  }

})

</script>

<template>

  <template v-if=isInitializing>
     <div class="loader" role="status" aria-label="Resolving account">
        <p class="loader__dot"></p>
    </div>
  </template>
  
  <template v-else-if="!isLoggedIn || !authStore.hasAccessToken">
      <PageStatusMessage 
        title="Login Required!" 
        message="Not yet an OutScriber? Its easy and free. If your session expired, sign back in to create your tale draft."
        icon="warning"
        :is-standalone="true"
      >
        <template #actions>
          <button class="btn btn--primary"  @click="modalStore.push('LoginUser', 'Login')">Login</button>
          <button class="btn btn--secondary"  @click="modalStore.push('RegisterUser', 'Register')">Become An OutScriber</button>
        </template>
      </PageStatusMessage>
    </template>

     <template v-else-if="authStore.writerStatus === 'None'">
      <PageStatusMessage 
        title="Account Is Unauthorized!" 
        message="Your account is not currently authorized to publish tales. Upgrade now. It is free and easy."
        icon="warning"
        :is-standalone="true"
      >
        <template #actions>
          <button class="btn btn--primary"  @click="modalStore.push('WriterOnboarding', 'Writer Onboarding')">Upgrade To Writer</button>
        </template>
      </PageStatusMessage>
    </template>
   
    <template v-else-if="authStore.writerStatus === 'Suspended'">
      <PageStatusMessage 
        title="Account Is Suspended!" 
        message="Your account is currently restricted from submitting tales. Contact support."
        icon="warning"
        :is-standalone="true"
      >
        <template #actions>
          <button class="btn btn--secondary"  @click="modalStore.push('WriterHelp', 'Writers Help', null, false)">Learn More</button>
        </template>
      </PageStatusMessage>
    </template>

    <template v-else-if="isSuccessful">
        <PageStatusMessage 
        title="Created!" 
        message="Your tale has been created but you have to use your editor to update and launch."
        icon="check"
        :is-standalone="true"
      >
        <template #actions>
          <button class="btn btn--primary"  @click="redirectToEditor">Editor</button>
          <button class="btn btn--secondary"  @click="modalStore.pop">Close</button>
        </template>
      </PageStatusMessage>
  </template>
   
    <template v-else-if="authStore.writerStatus === 'Active'">

     <div class="form-container">

        <div class="form-header">
    
         <h2>{{ pageTitle }}</h2>
        <HelpIcon topic="CreateTale" />
    </div>

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
            class="btn btn--secondary"  
            :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Create Draft' }}
          </button>
        </div>
    </form>
  </div>
      
    </template>

    <template v-else>
      <PageStatusMessage 
        title="Unknown Error!" 
        message="An unknown error occured. Refresh page and try again"
        icon="warning"
        :is-standalone="true"
      >
      </PageStatusMessage>
    </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>