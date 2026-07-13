
<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore';
import { useModalStore } from '@/stores/modalStore';
import type { CommentListDto } from '../types/EngagementTypes';
import { getEngagementMetadata, type ActiveContentContext } from '@/features/engagements/types/EngagementTypes'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement';
import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime, toShortDate } from '@/utils/dateExtensions'

const props = withDefaults(defineProps<{
  comment: CommentListDto;
  isFocus?: boolean;
  isAncestor?: boolean;
}>(), {
  isFocus: false, isAncestor: false
});

const authStore = useAuthStore();

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
  modalStore.push('CommentReplies', 'Replies', props.comment)
}

</script>

<template>

    <article class="comments-list__card">

  <section v-if="isSystemMessage" class="comments-list__text no">
    {{ comment.detail }}
  </section>

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
        {{ toRelativeTime(comment.commentedAt) }}
    </p>
      
    <template v-if="!isFocus">
  <span class="divider circle"></span>
  
  <!-- If it's an ancestor, it acts as a smooth rewind trigger -->
  <button 
    v-if="isAncestor" 
    class="reply-trigger ancestor-rewind" 
    @click="returnAncestor"
  >
    Return to Thread
  </button>

  <!-- Default behavior: open fresh replies deeper down the stack -->
  <button 
    v-else 
    :disabled="uiMeta.isRepliesDisabled" 
    @click="viewReplies"
  >
    {{ formatCounts(comment.engagement?.commentsCount) }} Replies
  </button>
</template>

    </div>

  
  </section>

  <section class="comments-list__actions">
    <section class="comments-list__rating-actions">
      <button 
        :class="[comment.engagement?.myVote === 'Upvote' ? 'active-upvote-class' : '']" 
        title="Upvote"
        :disabled="uiMeta.isVoteDisabled"
        @click="engage.vote(comment.engagement, 'Upvote')"
      >
       <SvgIcons name="upvote" />
        <span>{{ formatCounts(comment.engagement?.upvotesCount) }}</span>
      </button>

      <button 
        :class="[comment.engagement?.myVote === 'Downvote' ? 'active-downvote-class' : '']" 
        title="Downvote"
        :disabled="uiMeta.isVoteDisabled"
       @click="engage.vote(comment.engagement, 'Downvote')"
      >
        <SvgIcons name="downvote" />
        <span>{{ formatCounts(comment.engagement?.downvotesCount) }}</span>
      </button>

      <button @click="replyComment">
         <SvgIcons name='reply' /> <span>Reply</span>
      </button>
    </section>
   
    <section class="comments-list__other-actions">
      <button 
        title="Add To Favorites"
        :disabled="uiMeta.isFavoriteDisabled"
        @click="engage.favorite(comment.engagement)"
      >
        <SvgIcons name='bookmark' />
        <span>{{ uiMeta.favoriteText }}</span>
      </button>

      <button 
        title="Report"
        :disabled="uiMeta.isFlagDisabled"
       @click="modalStore.push('FlagContent', 'Flag Comment', comment.engagement)"
      >
        <SvgIcons name='flag' />
        <span>{{ uiMeta.flagText }}</span>
      </button>

      <button class="comments-list__hamburger" @click="modalStore.push('CommentStats', 'Comment Stats', comment)">
        <div></div><div></div><div></div>
      </button>
    </section>
  </section>
  
    </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/comment-lists.less";

</style>
