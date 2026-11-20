<script setup lang="ts">
import { ref } from 'vue'
import type { UseCaseItem } from '../types/SupportTypes';
import { sanitizeHtml } from '@/utils/markupHelper';

// 1. Define props and emits
defineProps<{
  useCase: UseCaseItem;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle', id: number): void;
}>();

</script>

<template>
  <article class="useCase-card">
  <button
      type="button"
      class="useCase-card__header"
      :class="{ 'useCase-card__header--active': isOpen }"
      :aria-expanded="isOpen"
      :aria-controls="`useCase-content-${useCase.id}`"
      @click="emit('toggle', useCase.id)"
    >
      <h3 class="useCase-card__question">
        {{ useCase.title }}
      </h3>
      <span class="useCase-card__indicator" aria-hidden="true"></span>
    </button>
    <div
      :id="`useCase-content-${useCase.id}`"
      class="useCase-card__content"
      :class="{ 'useCase-card__content--show': isOpen }"
    >
      <div class="useCase-card__body rich-text rich-text--faq" v-html="sanitizeHtml(useCase.description)"></div>
    </div>
    
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/rich-text.less";
@import "@/assets/css/variables.less";

.useCase-card {
  width: 100%;
  height: auto;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
   
  &__header {
    width: 100%;
    max-width: @mid-width;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0;
    background: transparent;
    border: none;
    cursor: pointer;
    gap: 1rem;
    transition: color 0.2s ease;

    &:hover {
    
      .useCase-card__indicator{
        &::before {
          opacity: 0.65;
        }
      }
    }
  }

  &__question {
     font-size: 1.1rem;
    line-height: 1.35;
    margin: 0;
    color: var(--heading-text-color);

  }

  &__indicator {
    font-size: 1.6rem;
    font-weight: 400;
    line-height: 1;
    flex-shrink: 0;

    &::before {
      content: "+";
      color:var(--heading-text-color);
    }

    .useCase-card__header--active & {
      &::before {
        content: "−";
      }
    }
  }

  &__content {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.4s cubic-bezier(0, 1, 0, 1), opacity 0.3s ease-in-out;

    &--show {
      max-height: 2000px; /* High boundary for smooth expansion transition */
      opacity: 1;
      transition: max-height 0.4s ease-in-out, opacity 0.4s ease-in-out;
    }
  }

  &__body {
    padding-bottom: 1rem;
  }
}
</style>