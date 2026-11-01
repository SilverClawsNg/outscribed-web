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
    // Safely route to login while passing the returnUrl as a clean object query
    router.push({
      path: '/login',
      query: { returnUrl: '/editor' }
    });
  } else {
    // Open login modal for standard page contexts
    modalStore.push('Login', 'Login');
  }
  emit('login');
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
        <button type="button" class="form-alert__actions-btn" @click="handleMoreDetails">
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
        <h4 class="form-alert__title"> {{ progress.title ?? 'Login Required' }}</h4>
        <p class="form-alert__message">{{ progress.message ?? 'Login is required to continue.' }}</p>
      </div>

      <div class="form-alert__actions">
      <button v-if="progress.error?.definition" type="button" class="form-alert__actions-btn" @click="handleMoreDetails">
          See Details
        </button>
        <button type="button" class="form-alert__actions-btn" @click="handleLogin">
          Continue to Login
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
   @import "@/assets/css/variables.less";

.form-alert {
  position: relative;
  margin: 1.25rem 0;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;

  // Horizontal flex layout for 750px editor canvas that wraps on small screens
  &__content--row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__loader{
     width: 100%;
    height: auto;
    z-index: 998;
    display: flex;
    justify-content: center;
    align-items:flex-start;
    padding: 1rem 0 2rem 0;

  }

  &__text-group {
    flex: 1 1 300px; 
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    font-weight: 600;
    margin: 0;
  }

  &__message {
    margin: 0;
  }

  &__actions {
    flex-shrink: 0; // Prevents button from squishing on tight viewports
  }

  // --------------------------------------------------------------------------
  // COLOR THEMES (TINTED BACKGROUNDS + ACCENT BORDERS)
  // --------------------------------------------------------------------------

  &--success {
    background-color: @success-background-color;
    border-left-color: @success-text-color;
    color: @success-text-color;
  }

  &--warning {
     background-color: @warning-background-color;
    border-left-color: @warning-text-color;
    color: @warning-text-color;
  }

  &--error {
    background-color: @danger-background-color;
    border-left-color: @danger-text-color;
    color: @danger-text-color;
  }


  &--boxed {
    border: 1px solid var(--border-color);
    border-left-width: 4px;
  }
}

// ----------------------------------------------------------------------------
// PLAIN WHITE BUTTON WITH BLACK TEXT FOR TINTED ALERTS
// ----------------------------------------------------------------------------
.form-alert__actions-btn {
  background-color: @white-color;
  color: @link-color;
  border:1px solid transparent;
  padding: 0.4rem 0.85rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;

  &:hover {
    color: @link-alt-color;
    border-color: @link-alt-color;
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid @link-color;
    outline-offset: 2px;
  }
}
</style>