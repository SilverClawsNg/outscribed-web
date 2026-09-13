<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useModalStore } from '@/stores/modalStore'

import { toRelativeTime } from '@/utils/dateExtensions'
import { type CommentPageListDto } from '@/features/engagements/types/EngagementTypes';
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import SvgIcons from '@/components/SvgIcons.vue'
import { formatCounts } from '@/utils/stringHelpers'
import { ContentTypeDescriptions } from '@/utils/descriptors'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

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
  
// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.comment.engagement));


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

  <article class="comment-card">

     <header class="comment-card__header">

        <button 
          type="button" 
          class="comment-card__author-link at" 
          @click="modalStore.push('Profile', 'Profile', comment.commentatorId)"
        >
          {{ comment.commentatorUsername }}
        </button>
        <time class="comment-card__date">{{ toRelativeTime(comment.commentedAt) }}</time>

         <span class="shared__divider shared__divider--circle"></span>

           <RouterLink :to="`/${comment.contentType.toLowerCase()}/${comment.contentId}`">
            {{ ContentTypeDescriptions[comment.contentType] }}
          </RouterLink>

    </header>
    
    <section class="comment-card__text">

      <div 
        ref="commentElement" 
        :class="['shared__richtext', { 'truncated': !isExpanded }]"
        v-html="props.comment.detail"
      ></div>
      
      <button 
        v-if="hasOverflow && !isExpanded" 
        class="comment-card__show-text" 
        @click="isExpanded = true"
      >
        <span class="caret-down"></span>
      </button>
      
    </section>

     <section class="comment-card__stats">
      <p class="comment-card__stat"><span>{{ formatCounts(comment.engagement.commentsCount) }}</span> Replies</p>
      <p class="comment-card__stat"><span>{{ formatCounts(comment.engagement.upvotesCount) }}</span> Upvotes</p>
      <p class="comment-card__stat"><span>{{ formatCounts(comment.engagement.favoritesCount) }}</span> Saves</p>
    </section>

   <!-- Actions Footer -->
    <footer class="comment-card__footer">
        <button 
        type="button"
         class="btn secondary"
        @click="modalStore.push('CommentThread', 'Thread', comment.commentId)">
        View Thread
      </button>
      <button 
        class="comment-card__save-btn"
        @click="engage.favorite(comment.engagement)"
        :title="comment.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled"
      >
        <SvgIcons name="bookmark" /> 
        <span>{{ uiMeta.favoriteLongText }}</span>
      </button>
    </footer>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/comment-card.less";
</style>