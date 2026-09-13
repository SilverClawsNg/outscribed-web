<script setup lang="ts">
import { ref } from 'vue'
import type { FaqItem } from '../types/SupportTypes';
import { sanitizeHtml } from '@/utils/markupHelper';

// Declare compile-time parameter contract boundaries

defineProps<{
  faq: FaqItem;
}>();

// 3. Reactive Component States (Replaces private fields)
const showAnswer = ref(false)

</script>

<template>
  <article class="faq-card">
    <button
      type="button"
      class="faq-card__header"
      :class="{ 'faq-card__header--active': showAnswer }"
      :aria-expanded="showAnswer"
      :aria-controls="`faq-content-${faq.id}`"
      @click="showAnswer = !showAnswer"
    >
      <h3 class="faq-card__question">
        {{ faq.question }}
      </h3>
      <span class="faq-card__indicator" aria-hidden="true"></span>
    </button>

    <div
      :id="`faq-content-${faq.id}`"
      class="faq-card__content"
      :class="{ 'faq-card__content--show': showAnswer }"
    >
      <div class="faq-card__body shared__rich-text" v-html="sanitizeHtml(faq.answer)"></div>
    </div>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/faq-card.less";
@import "@/assets/css/rich-text.less";
</style>