<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeMount } from 'vue'
import { useAuthenticationStore } from '@/features/authentication/stores/AuthenticationStore'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { getValidCategory } from '@/utils/validators'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import type { CreateRequest, CreateTalePayload } from '../types/TalesTypes'
import { useRouter } from 'vue-router'

import { CategorySelectItems } from '@/utils/selectItemHelper'
import { useLoginHint } from '@/utils/authHelper'
import HelpIcon from '@/components/HelpIcon.vue'
import { CountryDescriptions } from '@/utils/descriptors'

// 🎯 Embedded Auth & Onboarding Components for direct inline rendering
import LoginComponent from '@/features/authentication/components/LoginComponent.vue'
import RegisterComponent from '@/features/authentication/components/RegisterComponent.vue'
import ResetComponent from '@/features/authentication/components/ResetComponent.vue'
import WriterOnboardingComponent from '@/features/authoring/components/WriterOnboardingComponent.vue'

const router = useRouter()

function redirectToEditor() {
  modalStore.pop()
  router.push(`/editor`)
}

// 🎯 LOCAL NAVIGATION CIRCUIT: Manages modal internal view state
type ViewState = 'CreateForm' | 'Login' | 'Register' | 'Reset' | 'Onboarding'
const currentView = ref<ViewState>('CreateForm')

const isInitializing = ref(true)
const isLoggedIn = useLoginHint()
const isSuccessful = ref(false)
const pageTitle = ref('We can\'t wait to see what you are about to spin')

const props = defineProps<{
  payload?: CreateTalePayload | null
}>()

// Extract pre-selected Category (if passed)
const preselectedCategory = computed<string | null>(() => {
  if (!props.payload) return null
  if (typeof props.payload === 'string') return props.payload
  return props.payload.category || '-1'
})

// Extract pre-selected Country (if passed)
const preselectedCountry = computed<string | null>(() => {
  if (props.payload && typeof props.payload === 'object') {
    return props.payload.country || null
  }
  return null
})

const formData = ref<CreateRequest>({
  title: '',
  category: '-1' as any,
  country: null
})

const taleStore = useTaleDraftStore()
const authStore = useAuthenticationStore()
const modalStore = useModalStore()
const { progressState, startLoading, setWarning, setError, resetProgress } = useFormProgress()

const formSubmitted = ref(false)

const titleLength = computed(() => formData.value.title?.length || 0)

const validationErrors = computed(() => {
  const titleText = formData.value.title || ''
  const parsedCategory = getValidCategory(formData.value.category)

  return {
    title: titleText === '' || titleText.length < 8 || titleText.length > 128
      ? 'Title must be between 8 and 128 characters'
      : '',
    category: !parsedCategory
      ? 'Please select a category.'
      : ''
  }
})

const isFormValid = computed(() => {
  return Object.values(validationErrors.value).every(error => error === '')
})

watch(
  [isFormValid, formSubmitted],
  ([isValid, submitted]) => {
    if (!submitted) return

    if (!isValid) {
      setWarning('Ensure all fields are filled out correctly before submission.')
    } else {
      if (progressState.value.type === 'Warning') {
        resetProgress()
      }
    }
  },
  { immediate: true }
)

onBeforeMount(() => {
  formData.value.category = (preselectedCategory.value ?? '-1') as any
  formData.value.country = (preselectedCountry.value) as any
  if (preselectedCountry.value && preselectedCountry.value in CountryDescriptions) {
    const countryKey = preselectedCountry.value as keyof typeof CountryDescriptions
    pageTitle.value = `You are now outscribing into ${CountryDescriptions[countryKey]}`
  }
  resetProgress()
})

onMounted(async () => {
  await evaluateState()
})

// Centralized state evaluation logic
async function evaluateState() {
  isInitializing.value = true

  if (!isLoggedIn.value) {
    currentView.value = 'Login'
    isInitializing.value = false
    return
  }

  const isVerified = await authStore.verifyAuthoring()
  
  if (!authStore.hasAccessToken) {
    currentView.value = 'Login'
  } else if (authStore.writerStatus === 'None') {
    currentView.value = 'Onboarding'
  } else if (authStore.writerStatus === 'Active') {
    currentView.value = 'CreateForm'
  }

  isInitializing.value = false
}

// Handler functions for auth/onboarding transitions
async function handleAuthSuccess() {
  await evaluateState()
}

function handleOnboardingSuccess() {
  authStore.writerStatus = 'Active'
  currentView.value = 'CreateForm'
}

async function handleFormSubmission() {
  formSubmitted.value = true

  if (!isFormValid.value) return

  startLoading()

  const { success, error } = await taleStore.createTale(formData.value)

  if (!success) {
    if (error) {
      setError(error)
    } else {
      setWarning('An unknown error occurred. Refresh page and try again')
    }
  } else {
    isSuccessful.value = true
  }
}
</script>

<template>
  <!-- 1. LOADING / RESOLVING STATE -->
  <template v-if="isInitializing">
    <div class="loader" role="status" aria-label="Resolving account">
      <p class="loader__dot"></p>
    </div>
  </template>

  <!-- 2. LOGIN VIEW -->
  <template v-else-if="currentView === 'Login'">
    <LoginComponent
      :is-page="false"
      message="to create a tale draft."
      @success="handleAuthSuccess"
      @forgot-password="currentView = 'Reset'"
      @sign-up="currentView = 'Register'"
    />
  </template>

  <!-- 3. REGISTER VIEW -->
  <template v-else-if="currentView === 'Register'">
    <RegisterComponent
      :is-page="false"
      @success="handleAuthSuccess"
      @log-in="currentView = 'Login'"
    />
  </template>

  <!-- 4. RESET PASSWORD VIEW -->
  <template v-else-if="currentView === 'Reset'">
    <ResetComponent
      :is-page="false"
      @success="currentView = 'Login'"
      @log-in="currentView = 'Login'"
    />
  </template>

  <!-- 5. WRITER ONBOARDING VIEW -->
  <template v-else-if="currentView === 'Onboarding'">
    <WriterOnboardingComponent
      :is-page="false"
      @success="handleOnboardingSuccess"
    />
  </template>

  <!-- 6. ACCOUNT SUSPENDED -->
  <template v-else-if="authStore.writerStatus === 'Suspended'">
    <PageStatusMessage 
      title="Account Is Suspended!" 
      message="Your account is currently restricted from submitting tales. Contact support."
      icon="warning"
      :is-standalone="true"
    >
      <template #actions>
        <button class="btn btn--secondary" @click="modalStore.push('WriterHelp', 'Writers Help', null)">
          Learn More
        </button>
      </template>
    </PageStatusMessage>
  </template>

  <!-- 7. SUCCESS CREATION -->
  <template v-else-if="isSuccessful">
    <PageStatusMessage 
      title="Created!" 
      message="Your tale has been created but you have to use your editor to update and launch."
      icon="check"
      :is-standalone="true"
    >
      <template #actions>
        <button class="btn btn--primary" @click="redirectToEditor">Editor</button>
        <button class="btn btn--secondary" @click="modalStore.pop">Close</button>
      </template>
    </PageStatusMessage>
  </template>

  <!-- 8. ACTIVE AUTHOR -> CREATE TALE FORM -->
  <template v-else-if="currentView === 'CreateForm'">
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
          <span 
            class="character-counter" 
            :class="{ 
              'is-warning': titleLength > 100 && titleLength <= 128,
              'is-over-limit': titleLength > 128 
            }"
          >
            {{ titleLength }}/128
          </span>
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

  <!-- 9. FALLBACK UNKNOWN ERROR -->
  <template v-else>
    <PageStatusMessage 
      title="Unknown Error!" 
      message="An unknown error occurred. Refresh page and try again"
      icon="warning"
      :is-standalone="true"
    />
  </template>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";
</style>