<script setup lang="ts">

// --- IMPORTS ---
import { computed } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import { type CommentListDto } from '@/features/engagements/types/EngagementTypes' // 🎯 Import your clean semantics
import { toLongDate } from '@/utils/dateExtensions'
import { formatCounts } from '@/utils/stringHelpers'

// --- INITIALIZE STORES ---
const modalStore = useModalStore()

const props = defineProps<{
  payload: unknown // Accept as unknown for maximum flexibility
}>()

// 🔒 Strongly-type cast the payload context for your template and logic
const comment = computed(() => props.payload as CommentListDto)

</script>

<template>
  <div class="comment-stats-grid">
   
    <dl>
      <dt>Commented</dt>
      <dd>{{ toLongDate(comment.commentedAt) }}</dd>
    </dl>

    <dl>
      <dt>Commentator</dt>
      <dd>
        <span class="at">{{ comment.commentatorUsername}}</span>
        <button @click="modalStore.push('Profile', 'Profile', comment.commentatorId)">
          View Profile
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Upvotes</dt>
      <dd>
        {{ formatCounts(comment.engagement.upvotesCount) }}
        <button 
          :disabled="comment.engagement.upvotesCount === 0 && comment.engagement.downvotesCount === 0" 
          @click="modalStore.push('ContentVotes', 'Comment Upvotes', comment.commentId)"
        >
          View Votes
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Downvotes</dt>
      <dd>
        {{ formatCounts(comment.engagement.downvotesCount) }}
      </dd>
    </dl>

    <dl>
      <dt>Saves</dt>
      <dd>
        {{ formatCounts(comment.engagement.favoritesCount) }}
      </dd>
    </dl>

    <dl>
      <dt>Reports</dt>
      <dd>{{ formatCounts(comment.engagement.flagsCount) }}</dd>
    </dl>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/description-list.less";
</style>