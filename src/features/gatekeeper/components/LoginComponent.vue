<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { APIError } from '@/api/apiTypes'
import type { LoginRequest} from '../types/GatewayTypes'
import { useModalStore } from '@/stores/modalStore';

// 🎯 Conditional layout environment prop flags
interface Props {
  isPage?: boolean
  message?: string
}
const props = withDefaults(defineProps<Props>(), {
  isPage: true
})

// 🎯 Add specialized modal action emits alongside your success emit
const emit = defineEmits<{
  success: []
  forgotPassword: []
  createAccount: []
}>()

const displayMessage = ref(props.message ?? "Welcome back. Log in to continue.")

const authStore = useAuthStore()
const modalStore = useModalStore();

const { progressState, startLoading, setError, setWarning, resetProgress } = useFormProgress()
const passwordVisible = ref(false)

const formData = ref<LoginRequest>({
  username: '',
  password: ''
})


// 1. Tracks whether the user has at least attempted to submit the form once
const formSubmitted = ref(false)

// 2. Pure, derivative validation state. No tracking refs, no manual clearing.
const validationErrors = computed(() => {

const usernameText = formData.value.username || '';
const passwordText = formData.value.password || '';

  return {
  
    username: usernameText === '' || usernameText.length < 2 || usernameText.length > 20
      ? 'Enter a valid username'
      : '',

    password: passwordText === '' || passwordText.length < 8
      ? 'Enter a valid password'
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

async function handleSubmit() {

 // 1. Tell the ecosystem the user has initiated an action
  formSubmitted.value = true

  // 2. Pure, clean execution guard. The watcher has already handled the UI text alerts!
  if (!isFormValid.value) return

  startLoading()

  const outcome = await authStore.login(formData.value)

  if (outcome.isFailure) {

    if (outcome.error) {
      setError(outcome.error)
    } else {
      setError(new APIError(0, 'Authentication Error', 'An unexpected connection failure occurred.'))
    }
    return
  }

  //isFormLoading.value = false
  emit('success')
}

onMounted(() => {
  resetProgress()
})
</script>

<template>

  <div class="form-container boxed">

    <template v-if="isPage">
      <h1>Login</h1>
    </template>

    <h2>{{ displayMessage }}</h2>

    <FormProgress :progress="progressState" :is-boxed="true" />

    <form @submit.prevent="handleSubmit">

      <fieldset :disabled="progressState.type === 'Loading'">
        <input 
          v-model="formData.username" 
          type="text" 
          class="form-field" 
          placeholder="Username" 
        />
      </fieldset>

       <span v-if="formSubmitted  && validationErrors.username" class="validation-message">
    {{ validationErrors.username }}
  </span>
  
      <fieldset class="password-box" :disabled="progressState.type === 'Loading'">
        <button 
          type="button" 
          class="show-password" 
          @click="passwordVisible = !passwordVisible"
        >
          👁️
        </button>
        <input 
          v-model="formData.password" 
          :type="passwordVisible ? 'text' : 'password'" 
          class="form-field" 
          placeholder="Password" 
        />
      </fieldset>

       <span v-if="formSubmitted  && validationErrors.password" class="validation-message">
    {{ validationErrors.password }}
  </span>


      <div class="button-holder">
          <button 
            type="submit" 
            class="btn contrast" 
            :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Complete' }}
          </button>
        </div>

       <template v-if="isPage">
          <div class="form-options">
            <RouterLink to="/reset" title="Reset password">Forgotten password?</RouterLink>
            <span class="divider line"></span>
            <RouterLink to="/register" title="Create Account">Create a new account</RouterLink>
        </div>
           
            </template>

            <template v-else>
                  <div class="form-options">
             <button 
                type="button" 
                @click="emit('forgotPassword')"
            >
                Forgotten password?
            </button>
           
        </div>
        
        </template>
      
    </form>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-container.less";
@import "@/assets/css/form-input.less";
</style>