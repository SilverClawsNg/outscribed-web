<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { APIError } from '@/api/apiTypes'
import { useModalStore } from '@/stores/modalStore'
import { useTaleDraftStore } from '@/features/tales/stores/TaleDraftStore'

export type LoadingProgress = 'Idle' | 'Loading' | 'Success' | 'Error' | 'Login' | 'Warning'

export interface ProgressState {
  type: LoadingProgress
  title: string | null
  message: string | null
  error: APIError | null
}

const props = withDefaults(
  defineProps<{
    progress: ProgressState
    isBoxed?: boolean
    isEditor?: boolean
  }>(),
  {
    isBoxed: false,
    isEditor: false
  }
)

const router = useRouter()
const modalStore = useModalStore()
const taleStore = useTaleDraftStore()

const emit = defineEmits<{
  (e: 'more-details', error: APIError): void
  (e: 'login'): void
}>()

function handleMoreDetails() {
  if (!props.progress.error) return

  if (props.isEditor) {
    taleStore.openModal(props.progress.error)
  } else {
    modalStore.push('ProblemDefinition', 'Problem Detail', props.progress.error)
  }

  emit('more-details', props.progress.error)
}

function handleLogin() {
  if (props.isEditor) {
    // Redirect directly to login view when operating within the Studio
    router.push('/login?returnurl="/editor"')
  } else {
    // Open login modal for standard page contexts
    modalStore.push('LoginUser', 'Login')
  }
  emit('login')
}
</script>

<template v-if="progress.type !== 'Idle'">
  <!-- LOADING DOTS ANIMATION -->
  <div
    v-if="progress.type === 'Loading'"
    class="form-alert__loader"
    role="status"
    aria-label="Submitting form"
  >
    <p class="loader__dot"></p>
  </div>

  <!-- SUCCESS ALERT BOX -->
  <div
    v-else-if="progress.type === 'Success'"
    class="form-alert form-alert--success"
    :class="{ 'form-alert--boxed': isBoxed }"
    role="status"
  >
    <div class="form-alert__content">
      <p class="form-alert__message">{{ progress.message }}</p>
    </div>
  </div>

  <!-- WARNING ALERT BOX -->
  <div
    v-else-if="progress.type === 'Warning'"
    class="form-alert form-alert--warning"
    :class="{ 'form-alert--boxed': isBoxed }"
    role="alert"
  >
    <div class="form-alert__content">
      <p class="form-alert__message">{{ progress.message }}</p>
    </div>
  </div>

  <!-- ERROR ALERT BOX -->
  <div
    v-else-if="progress.type === 'Error'"
    class="form-alert form-alert--error"
    :class="{ 'form-alert--boxed': isBoxed }"
    role="alert"
  >
    <div class="form-alert__content form-alert__content--row">
      <div class="form-alert__text-group">
        <h4 v-if="progress.title" class="form-alert__title">
          {{ progress.title }}
        </h4>
        <p class="form-alert__message">
          {{ progress.message ?? 'An unexpected error occurred.' }}
        </p>
      </div>

      <div v-if="progress.error?.definition" class="form-alert__actions">
        <button type="button" class="btn btn--alert-action" @click="handleMoreDetails">
          See Details
        </button>
      </div>
    </div>
  </div>

  <!-- UNAUTHORIZED / LOGIN REQUIRED ALERT BOX -->
  <div
    v-else-if="progress.type === 'Login'"
    class="form-alert form-alert--warning"
    :class="{ 'form-alert--boxed': isBoxed }"
    role="alert"
  >
    <div class="form-alert__content form-alert__content--row">
      <div class="form-alert__text-group">
        <h4 class="form-alert__title">401: Login Required</h4>
        <p class="form-alert__message">Authentication is required to continue this action.</p>
      </div>

      <div class="form-alert__actions">
      <button v-if="progress.error?.definition" type="button" class="btn btn--alert-action" @click="handleMoreDetails">
          See Details
        </button>
        <button type="button" class="btn btn--alert-action" @click="handleLogin">
          Continue to Login
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
   @import "@/assets/css/form-progress.less";
</style>