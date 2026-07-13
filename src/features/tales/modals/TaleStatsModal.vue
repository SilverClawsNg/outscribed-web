<script setup lang="ts">

// --- IMPORTS ---
import { computed } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import { type TaleDetailDto } from '@/features/tales/types/TalesTypes' // 🎯 Import your clean semantics
import { toLongDate } from '@/utils/dateExtensions'
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { formatCounts } from '@/utils/stringHelpers'
import { type ActiveContentContext } from '@/features/engagements/types/EngagementTypes'

// --- INITIALIZE STORES ---
const modalStore = useModalStore()

const props = defineProps<{
  payload: unknown // Accept as unknown for maximum flexibility
}>()

// 🔒 Strongly-type cast the payload context for your template and logic
const tale = computed(() => props.payload as TaleDetailDto)

const content: ActiveContentContext = {
    id: tale.value.taleId,
    title: tale.value.title,
    contentType: 'Tale',
    engagement: tale.value.engagement, // Live reactive proxy reference
    writeCommentFromInline: false,
    pinnedComment: null
  };

function viewComments() {
  modalStore.push('ContentComments', 'Comments', content)
}

function createComment() {
  modalStore.push('CreateComment', 'New Comment', content)
}

</script>

<template>
  <div class="tale-stats-grid">
    <dl>
      <dt>Title</dt>
      <dd>{{ tale.title }}</dd>
    </dl>

    <dl>
      <dt>Published</dt>
      <dd>{{ toLongDate(tale.createdAt) }}</dd>
    </dl>

    <dl>
      <dt>Writer</dt>
      <dd>
        <span class="at">{{ tale.creator.username }}</span>
        <button @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)">
          View Profile
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Category</dt>
      <dd>
         {{ CategoryDescriptions[tale.category] }}
        <router-link :to="`/tales?category=${tale.category}`">
          View Tales
        </router-link>
      </dd>
    </dl>

    <dl v-if="tale.country">
      <dt>Country</dt>
      <dd>
        {{ CountryDescriptions[tale.country] }} 
        <router-link :to="`/tales?country=${tale.country}`">
          View Tales
        </router-link>
      </dd>
    </dl>

    <dl>
      <dt>Insights</dt>
      <dd>
        {{ formatCounts(tale.engagement.insightsCount) }}
        <router-link 
          v-if="tale.engagement.insightsCount > 0" 
          :to="`/insights?taleId=${tale.taleId}`" 
          title="View Insights"
        >
          View Insights
        </router-link>
        <a v-else href="#" title="Insights" class="disabled" @click.prevent>
          View Insights
        </a>
        <span class="divider line"></span>
        <button title="Create Insight" @click="modalStore.push('CreateInsight', 'Create Insight', payload)">
          New Insight
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Comments</dt>
      <dd>
        {{ formatCounts(tale.engagement.commentsCount) }}
        <button 
          :disabled="tale.engagement.commentsCount === 0" 
          @click="viewComments"
        >
          View Comments
        </button>
        <span class="divider line"></span>
        <button title="Create Comment" @click="createComment">
          New Comment
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Views</dt>
      <dd>{{ formatCounts(tale.engagement.viewsCount) }}</dd>
    </dl>

    <dl>
      <dt>Upvotes</dt>
      <dd>
        {{ formatCounts(tale.engagement.upvotesCount) }}
        <button 
          :disabled="tale.engagement.upvotesCount === 0 && tale.engagement.downvotesCount === 0" 
          @click="modalStore.push('Comments', 'Comments', payload)"
        >
          View All Votes
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Downvotes</dt>
      <dd>
        {{ formatCounts(tale.engagement.downvotesCount) }}
        <button 
          :disabled="tale.engagement.upvotesCount === 0 && tale.engagement.downvotesCount === 0" 
          @click="modalStore.push('Comments', 'Comments', payload)"
        >
          View All Votes
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Saves</dt>
      <dd>
        {{ formatCounts(tale.engagement.favoritesCount) }}
        <button 
          :disabled="tale.engagement.favoritesCount === 0" 
          @click="modalStore.push('Comments', 'Comments', payload)"
        >
          View Saves
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Shares</dt>
      <dd>{{ formatCounts(tale.engagement.sharesCount) }}</dd>
    </dl>

    <dl>
      <dt>Reports</dt>
      <dd>{{ formatCounts(tale.engagement.flagsCount) }}</dd>
    </dl>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/description-list.less";
</style>