<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';

import { type CommentListDto } from '../types/EngagementTypes';

import { CommentStatusDescriptions, CommentStatusClass, ContentTypeDescriptions } from '@/utils/descriptors'
import { toRelativeTime } from '@/utils/dateExtensions'
import { useModalStore } from '@/stores/modalStore'
import { useDraftCommentsStore } from '../stores/DraftCommentsStore';
import { formatCounts } from '@/utils/stringHelpers'

const modalStore = useModalStore()
const commentStore = useDraftCommentsStore();

// Declare compile-time parameter contract boundaries
interface Props {
  comment: CommentListDto
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

// --- VISUAL ROUTING AND MODAL EMULATORS ---
async function handleModalUpdate(type: string, title: string) {
  // 1. Tell the store: "This is the comment we are working on right now"
  commentStore.setActiveComment(props.comment);

  // 2. Launch the modal. The component doesn't need to await a response anymore!
  console.log(`Launching modal type: ${type} for active comment context.`);
   modalStore.push(type, title); 
}

</script>

<template>
      
  <article class="comments-list__card">

    <div class="shared__content-status">

      <span class="status-title">Status</span>
       <span :class=CommentStatusClass[comment.status]>
         {{ CommentStatusDescriptions[comment.status] }}
      </span>
    </div>

    <section class="comments-list__metadata">
        {{ toRelativeTime(comment.commentedAt) }}
      <span class="divider circle"></span>
       <RouterLink :to="`/${comment.contentType.toLowerCase()}/${comment.contentId}`">
         {{ ContentTypeDescriptions[comment.contentType] }}
      </RouterLink>

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

     <section class="comment-lists__stats">
      <p><span>{{ formatCounts(comment.engagement.commentsCount) }}</span> Replies</p>
      <p><span>{{ formatCounts(comment.engagement.upvotesCount) }}</span> Upvotes</p>
       <p><span>{{ formatCounts(comment.engagement.downvotesCount) }}</span> Downvotes</p>
      <p><span>{{ formatCounts(comment.engagement.favoritesCount) }}</span> Saves</p>
      <p><span>{{ formatCounts(comment.engagement.flagsCount) }}</span> Flags</p>
      
    </section>

    <section class="btn-group">
      
      <template v-if="comment.status !== 'ArchivedByAdmin'">
        
        <template v-if="comment.status !== 'HiddenByAdmin' && comment.status !== 'HiddenByModeration'">
          
          <template v-if="comment.hasEngagement">
            <button class="btn primary" @click="handleModalUpdate('UpdateCommentAddendum', 'Addendum')">
              Addendum
            </button>
              <template v-if="comment.status === 'Active' || comment.status === 'CertifiedByAdmin'">
          <button class="btn secondary" @click="handleModalUpdate('ArchiveComment', 'Archive Comment')">
              Archive
            </button>
        </template>
         <template v-if="comment.status === 'ActiveToArchivedByCreator' || comment.status === 'CertifiedToArchivedByCreator'">
            <button class="btn secondary" @click="handleModalUpdate('UnarchiveComment', 'Unarchive Comment')">
              Unarchive
            </button>
        </template>
          </template>

          <template v-else>
            <button class="btn primary" @click="handleModalUpdate('UpdateCommentDetail', 'Update Comment Detail')">
              Update
            </button>
          <button class="btn secondary" @click="handleModalUpdate('DeleteComment', 'Delete Comment')">
            Delete
          </button>
          </template>

        </template>

      </template>

      <button class="btn secondary" @click="modalStore.push('CommentThread', 'Thread', comment.commentId)">
        Thread
      </button>

    </section>

  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/comment-lists.less";
</style>