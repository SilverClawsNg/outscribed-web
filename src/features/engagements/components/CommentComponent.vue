
<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useModalStore } from '@/stores/modalStore';
import type { CommentListDto } from '../types/EngagementTypes';
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement';
import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'

const props = withDefaults(defineProps<{
  comment: CommentListDto;
  isFocus?: boolean;
  isAncestor?: boolean;
}>(), {
  isFocus: false, isAncestor: false
});

const modalStore = useModalStore();
const engage = useEngagement()

  // 2. Reactive Component States
const isExpanded = ref<boolean>(false);
const hasOverflow = ref<boolean>(false);

// 3. Declare the Template Ref (Matches v-ref / @ref from Blazor)
const commentElement = ref<HTMLElement | null>(null);

// System moderation blocks definition filter array
const systemMessages = [
  'This comment was flagged by community moderation and is currently under review.',
  'This comment has been permanently deleted by its creator.',
  'This comment has been archived by administration.',
  'This comment is currently under administrative review.'
];


// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.comment.engagement));


const isSystemMessage = computed(() => {
  return systemMessages.includes(props.comment.detail);
});


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

function viewReplies() {
  modalStore.push('CommentReplies', 'Replies', props.comment)
}

function replyComment() {
  modalStore.push('ReplyComment', 'New Reply', props.comment)
}

function returnAncestor() {
  modalStore.popAncestors(props.comment.commentId)
}

</script>

<template>

   <article class="comment-inline-card">

<!-- 1. Header: Author Metadata & Options Menu -->
    <header class="comment-inline-card__header">

      <div class="comment-inline-card__meta">

        <button 
          type="button" 
          class="at comment-inline-card__meta-link" 
          @click="modalStore.push('Profile', 'Profile', comment.commentatorId)"
        >
          {{ comment.commentatorUsername }}
        </button>
        <time class="comment-inline-card__date">{{ toRelativeTime(comment.commentedAt) }}</time>
      </div>

      <!-- More Actions / Stats Trigger -->
      <button 
        type="button"
        class="comment-inline-card__menu-btn" 
        title="More options"
        @click="modalStore.push('CommentStats', 'Comment Stats', comment)"
      >
        <span class="comment-inline-card__menu-dot"></span>
        <span class="comment-inline-card__menu-dot"></span>
        <span class="comment-inline-card__menu-dot"></span>
      </button>

    </header>

    <!-- 2. Comment Body Text -->
    <section class="comment-inline-card__body">
      <div v-if="isSystemMessage" class="comment-inline-card__text comment-inline-card__text--system">
        {{ comment.detail }}
      </div>

      <div v-else class="comment-inline-card__text">
        <div 
          ref="commentElement" 
          :class="['shared__richtext', { 'truncated': !isExpanded }]"
          v-html="props.comment.detail"
        ></div>

        <button 
          v-if="hasOverflow && !isExpanded" 
          type="button"
          class="comment-inline-card__expand-btn" 
          @click="isExpanded = true"
        >
          <span class="caret-down"></span>
        </button>
      </div>
    </section>

    <!-- 3. Navigation / Threading Info -->
    <section class="comment-inline-card__thread">

      <template  v-if="!isFocus">

        <template v-if="isAncestor">
          <button 
            type="button"
            class="comment-inline-card__thread-link" 
            @click="returnAncestor"
          >
            ← Return to Thread
          </button>
        </template>

        <template v-else>

          <div class="comment-inline-card__reply">
            <button 
                type="button"
                @click="replyComment"
              >
                Reply
              </button>
              <button 
                type="button"
                class="comment-inline-card__thread-link"
                :disabled="uiMeta.isRepliesDisabled" 
                @click="viewReplies"
              >
              — View  {{ formatCounts(comment.engagement?.commentsCount) }} Replies
            </button>

          </div>
        
        </template>
      </template>
      
        <template v-else>

          <div class="comment-inline-card__reply">
            <button 
                type="button"
                @click="replyComment"
              >
                Reply
              </button>
           
          </div>
        
        </template>
      
    </section>

    <!-- 4. Engagement Actions (Upvote, Downvote, Reply, Favorite) -->
    <footer class="comment-inline-card__actions">
       <button 
          type="button"
          :class="['comment-inline-card__action-btn', { 'is-active': comment.engagement?.myVote === 'Upvote' }]" 
          title="Upvote"
          :disabled="uiMeta.isVoteDisabled"
          @click="engage.vote(comment.engagement, 'Upvote')"
        >
          <SvgIcons name="upvote" />
          <span>{{ formatCounts(comment.engagement?.upvotesCount) }}</span>
        </button>

        <button 
          type="button"
          :class="['comment-inline-card__action-btn', { 'is-active': comment.engagement?.myVote === 'Downvote' }]" 
          title="Downvote"
          :disabled="uiMeta.isVoteDisabled"
          @click="engage.vote(comment.engagement, 'Downvote')"
        >
          <SvgIcons name="downvote" />
          <span>{{ formatCounts(comment.engagement?.downvotesCount) }}</span>
        </button>

       <button 
          type="button"
          class="comment-inline-card__action-btn"
          title="Add To Favorites"
          :disabled="uiMeta.isFavoriteDisabled"
          @click="engage.favorite(comment.engagement)"
        >
          <SvgIcons name="bookmark" />
          <span>{{ uiMeta.favoriteLongText }}</span>
        </button>
    </footer>

    </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/comment-inline-card.less";
</style>
