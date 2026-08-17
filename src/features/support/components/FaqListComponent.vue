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

  <article class="faq-lists__card">
    
    <section class="faq-lists__header">
      <button 
        class="btn primary" 
        :class="{ active: showAnswer }" 
        @click="showAnswer = !showAnswer"
      ></button>
      <h2>{{ faq.question }}</h2>
    </section>

    <section class="faq-lists__contents" :class="{ show: showAnswer }">

    <div class="shared__rich-text" v-html="sanitizeHtml(faq.answer)"></div>

    </section>

  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/faq-lists.less";
@import "@/assets/css/rich-text.less";
</style>