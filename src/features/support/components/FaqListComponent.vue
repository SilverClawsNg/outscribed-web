<script setup lang="ts">
import { ref } from 'vue'
import { toLongDate } from '@/utils/dateExtensions'
import type { FaqListDto, VoteRequest } from '../types/SupportTypes';
import type { VoteType } from '@/utils/enumHelper';
import { useFaqListStore } from '../stores/FaqListStore';
import { sanitizeHtml } from '@/utils/markupHelper';

// Declare compile-time parameter contract boundaries
interface Props {
  faq: FaqListDto
}

const props = defineProps<Props>()

  const faqStore = useFaqListStore();

// 3. Reactive Component States (Replaces private fields)
const showAnswer = ref(false)
const showVote = ref(true)
const voteMessage = ref<string | null>(null)
const isErrorClass = ref<string | null>(null)

// 5. The Vote action workflow
async function handleVote(type: VoteType) {
  // Pass your strict request body 
  const payload: VoteRequest = {
    faqId: props.faq.faqId, // Front-end uses the string representation directly
    voteType: type
  }

  const result = await faqStore.vote(payload)

  if (!result.success) {
    isErrorClass.value = 'shared__no-content'
    
    if (!result.error) {
      voteMessage.value = 'Unknown server error occurred. Refresh page and try again.'
    } else {
      voteMessage.value = result.error.description
    }
  } else {
    isErrorClass.value = null
    voteMessage.value = 'Thank you! Your feedback helps us improve.'
  }
  
  // Toggle visibility layout down to the message display
  showVote.value = false
}

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

      <p class="faq-lists__contents-date">
        This article was last updated at {{ toLongDate(faq.lastUpdatedAt) }}
      </p>

      <div class="faq-lists__contents-action">

        <template v-if="showVote">

          <p>Did you find this article helpful?</p>
          <div class="faq-lists__contents-action-buttons">
            <button class="btn primary" @click="handleVote('Upvote')">YES</button>
            <button class="btn secondary" @click="handleVote('Downvote')">NO</button>
          </div>

        </template>

        <template v-else>
          <p :class="isErrorClass">{{ voteMessage }}</p>
        </template>

      </div>
    </section>

  </article>
</template>


<style lang="less" scoped>
@import "@/assets/css/faq-lists.less";
@import "@/assets/css/rich-text.less";
</style>