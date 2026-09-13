<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useModalStore } from '@/stores/modalStore'

import { toRelativeTime } from '@/utils/dateExtensions'
import { type CommentPageListDto } from '@/features/engagements/types/EngagementTypes';
import SvgIcons from '@/components/SvgIcons.vue'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()

// Declare compile-time parameter contract boundaries
interface Props {
  comment: CommentPageListDto
}

const props = defineProps<Props>()

  // 2. Reactive Component States
const isExpanded = ref<boolean>(false);
const hasOverflow = ref<boolean>(false);

// 3. Declare the Template Ref (Matches v-ref / @ref from Blazor)
const commentElement = ref<HTMLElement | null>(null);

// 4. Lifecycle Execution: Equivalent to OnAfterRenderAsync(firstRender)
onMounted(async () => {
  // Ensure DOM has entirely settled printing the v-html payload
  await nextTick();

  if (commentElement.value) {
    const el = commentElement.value;
    
    // Check line overflow directly without window scope attachments
    const isOverflowing = el.scrollHeight > el.clientHeight;
    hasOverflow.value = isOverflowing;

    // If it fits completely inside the truncation boundaries, treat it as expanded
    if (!isOverflowing) {
      isExpanded.value = true;
    }
  }
});

</script>

<template>

  <article class="comment-x-card">
    
    <header class="comment-x-card__meta">
      <button class="at" @click="modalStore.push('Profile', 'Profile', comment.commentatorId)">
        {{ comment.commentatorUsername }}
      </button>
      
      <p class="comment-x-card__date">
        {{ toRelativeTime(props.comment.commentedAt) }}
      </p>

    </header>

    <section class="comment-x-card__text">

      <div 
        ref="commentElement" 
        :class="['shared__richtext', { 'truncated': !isExpanded }]"
        v-html="props.comment.detail"
      ></div>
      
      <button 
        v-if="hasOverflow && !isExpanded" 
        class="comment-x-card__show-text" 
        @click="isExpanded = true"
      >
        <span class="caret-down"></span>
      </button>
      
    </section>

    <footer class="comment-x-card__actions">
       <button type="button" @click="modalStore.push('CommentThread', 'Thread', comment.commentId)">
        Thread &rarr;
      </button>
    </footer>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/comment-x-card.less";
</style>