<script setup lang="ts">
import { ref } from 'vue';
import { useAlert } from '@/composables/useAlert';

const alert = useAlert();
const isExecutingAction = ref(false);

async function handleActionClick() {
  if (!alert.onActionClick || isExecutingAction.value) return;

  try {
    isExecutingAction.value = true;
    // Fire the page-level method passed into the alert container parameters
    await alert.onActionClick();
  } catch (error) {
    console.error('Error executing alert action handler:', error);
  } finally {
    isExecutingAction.value = false;
  }
}
</script>
<template>
  <Transition name="slide">
    <div 
      v-if="alert.show" 
      class="alert" 
      :class="`alert--${alert.type.toLowerCase()}`"
      role="status" 
      aria-live="polite"
    >
      <div class="alert__wrapper">
        <div class="alert__icon-container">
          <span v-if="alert.type === 'Success'" class="alert__icon">✔️</span>
          <span v-else-if="alert.type === 'Warning'" class="alert__icon">⚠️</span>
          <span v-else-if="alert.type === 'Danger'" class="alert__icon">⛔</span>
          <span v-else-if="alert.type === 'Info'" class="alert__icon">ℹ️</span>
        </div>

        <div class="alert__body">
          <p class="alert__text">
            {{ alert.message }}
          </p>

          <div v-if="alert.type === 'Loading'" class="alert__loader"></div>

          <button 
            v-if="alert.onActionClick" 
            type="button"
            class="btn btn--primary alert__action-btn" 
            :disabled="isExecutingAction"
            @click="handleActionClick"
          >
            {{ alert.buttonText }}
          </button>
        </div>

        <div v-if="alert.type !== 'Loading'" class="alert__close-container">
          <button 
            type="button"
            class="alert__close-btn" 
            aria-label="Dismiss alert"
            @click="alert.close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

.alert {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  
  /* Enforce width bounds: capped at @min-width, guaranteed at least 20px shorter than viewport */
  width: min(@min-width, calc(100vw - 20px));
  max-width: calc(100vw - 20px);
  box-sizing: border-box;

  &__wrapper {
    width: 100%;
    height: auto;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    border-radius: 8px;
    box-shadow: var(--box-shadow);
    box-sizing: border-box;
  }

  &__icon-container {
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__icon {
    border: none;
    font-size: 1.1rem;
  }

  &__body {
    flex-grow: 1;
    padding: 0 0.5rem;
    text-align: center;
  }

  &__text {
    font-size: 1rem;
    line-height: 1.2rem;
    margin: 0;
  }

  &__action-btn {
    margin-top: 0.35rem;
  }

  &__close-container {
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  &__close-btn {
    border: none;
    background: transparent;
    border-radius: 50%;
    font-size: 1.2rem;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
    border: 1px solid transparent;

    &:hover {
      background-color: @white-color;
      color: @link-color;
    }
  }

  /* Variant Modifiers */
  &--success {
    background-color: @success-background-color;
    color: @success-text-color;
    border-color: @success-border-color;
  }

  &--warning {
     background-color: @warning-background-color;
    color: @warning-text-color;
    border-color: @warning-border-color;
  }

  &--danger {
     background-color: @danger-background-color;
    color: @danger-text-color;
    border-color: @danger-border-color;
  }

  &--info {
    /* Style hooks for info */
  }

  &--loading {
    /* Style hooks for loading state */
  }
}

/* Slide Transition Animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translate(-50%, -100%);
  opacity: 0;
}</style>
