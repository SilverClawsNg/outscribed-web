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

  <article class="comments-list__brief">
    
    <section class="comments-list__text">

      <div 
        ref="commentElement" 
        :class="['shared__richtext', { 'truncated': !isExpanded }]"
        v-html="props.comment.detail"
      ></div>
      
      <button 
        v-if="hasOverflow && !isExpanded" 
        class="comments-list__show-text" 
        @click="isExpanded = true"
      >
        <span class="caret-down"></span>
      </button>
      
    </section>

    <section class="comments-list__metadata">
      <button class="at" @click="modalStore.push('Profile', 'Profile', comment.commentatorId)">
        {{ comment.commentatorUsername }}
      </button>
      
     <div class="comments-list__other-metadata">
       <p>
         {{ toRelativeTime(props.comment.commentedAt) }}
       </p>
          <span class="divider circle"></span>
       <RouterLink :to="`/${comment.contentType.toLowerCase()}/${comment.contentId}`">
         {{ ContentTypeDescriptions[comment.contentType] }}
      </RouterLink>
    </div>
      
    </section>

     <section class="comment-lists__stats">
      <p><span>{{ formatCounts(comment.engagement.commentsCount) }}</span> Replies</p>
      <p><span>{{ formatCounts(comment.engagement.upvotesCount) }}</span> Upvotes</p>
       <p><span>{{ formatCounts(comment.engagement.downvotesCount) }}</span> Downvotes</p>
      <p><span>{{ formatCounts(comment.engagement.favoritesCount) }}</span> Saves</p>
      <p><span>{{ formatCounts(comment.engagement.flagsCount) }}</span> Flags</p>
    </section>

    <section class="comments-list__actions alt">
      
      <button @click="modalStore.push('CommentThread', 'Thread', comment.commentId)">
        <SvgIcons name="comment" /> Thread
      </button>
      <button 
        @click="engage.favorite(comment.engagement)"
        :title="comment.engagement.isFavorite ? 'Remove From Saves' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled">
        <SvgIcons name="bookmark" /> {{ uiMeta.favoriteText }}
      </button>
    </section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/comment-lists.less";
</style>