<script setup lang="ts">
import { ref } from 'vue'
import type { FaqItem } from '../types/SupportTypes';
import { sanitizeHtml } from '@/utils/markupHelper';

// 1. Define props and emits
defineProps<{
  faq: FaqItem;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle', id: number): void;
}>();

</script>

<template>
  <article class="faq-card">
  <button
      type="button"
      class="faq-card__header"
      :class="{ 'faq-card__header--active': isOpen }"
      :aria-expanded="isOpen"
      :aria-controls="`faq-content-${faq.id}`"
      @click="emit('toggle', faq.id)"
    >
      <h3 class="faq-card__question">
        {{ faq.question }}
      </h3>
      <span class="faq-card__indicator" aria-hidden="true"></span>
    </button>
    <div
      :id="`faq-content-${faq.id}`"
      class="faq-card__content"
      :class="{ 'faq-card__content--show': isOpen }"
    >
      <div class="faq-card__body rich-text rich-text--faq" v-html="sanitizeHtml(faq.answer)"></div>
    </div>
    
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/rich-text.less";
@import "@/assets/css/variables.less";

.faq-card {
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
      .faq-card__question {
        color: @link-color;
      }

      .faq-card__indicator{
        &::before {
          color:  @link-color;
        }
      }
    }
  }

  &__question {
     font-size: 1.1rem;
    line-height: 1.35;
    font-weight:600;
    color:var(--text-color);
    margin: 0;
    transition: color 0.2s ease;
    text-align:left;

  }

  &__indicator {
    font-size: 1.6rem;
    font-weight: 400;
    line-height: 1;
    flex-shrink: 0;

    &::before {
      content: "+";
      color:var(--text-color);
    }

    .faq-card__header--active & {
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