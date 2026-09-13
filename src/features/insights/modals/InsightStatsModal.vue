<script setup lang="ts">

// --- IMPORTS ---
import { computed } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import { type InsightDetailDto } from '@/features/insights/types/InsightsTypes' // 🎯 Import your clean semantics
import { toLongDate } from '@/utils/dateExtensions'
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { formatCounts } from '@/utils/stringHelpers'
import { getEngagementMetadata, type ActiveContentContext } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';

// --- INITIALIZE STORES ---
const modalStore = useModalStore()
const engage = useEngagement()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(insight.value.engagement));

const props = defineProps<{
  payload: unknown // Accept as unknown for maximum flexibility
}>()

// 🔒 Strongly-type cast the payload context for your template and logic
const insight = computed(() => props.payload as InsightDetailDto)

const content: ActiveContentContext = {
    id: insight.value.insightId,
    title: insight.value.title,
    contentType: 'Insight',
    engagement: insight.value.engagement, // Live reactive proxy reference
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
  
  <article>
    <dl>
      <dt>Title</dt>
      <dd>{{ insight.title }}</dd>
    </dl>

    <dl>
      <dt>Published</dt>
      <dd>{{ toLongDate(insight.createdAt) }}</dd>
    </dl>

    <dl>
      <dt>Writer</dt>
      <dd>
        <span class="at">{{ insight.creator.username }}</span>
        <button @click="modalStore.push('Profile', 'Profile', insight.creator.accountId)">
          View Profile
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Category</dt>
      <dd>
         {{ CategoryDescriptions[insight.category] }}
        <router-link :to="`/insights?category=${insight.category}`">
          View Insights
        </router-link>
      </dd>
    </dl>

    <dl v-if="insight.country">
      <dt>Country</dt>
      <dd>
        {{ CountryDescriptions[insight.country] }} 
        <router-link :to="`/insights?country=${insight.country}`">
          View Insights
        </router-link>
      </dd>
    </dl>

    <dl>
      <dt>Comments</dt>
      <dd>
        {{ formatCounts(insight.engagement.commentsCount) }}
        <button 
          :disabled="insight.engagement.commentsCount === 0" 
          @click="viewComments"
        >
          View Comments
        </button>
        <span class="shared__divider shared__divider--line"></span>
        <button title="Create Comment" @click="createComment">
          New Comment
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Views</dt>
      <dd>{{ formatCounts(insight.engagement.viewsCount) }}</dd>
    </dl>

    <dl>
      <dt>Upvotes</dt>
      <dd>
        {{ formatCounts(insight.engagement.upvotesCount) }}
        <button 
          :disabled="insight.engagement.upvotesCount === 0 && insight.engagement.downvotesCount === 0" 
          @click="modalStore.push('ContentVotes', 'Insight Upvotes', insight.insightId)"
        >
          View Votes
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Downvotes</dt>
      <dd>
        {{ formatCounts(insight.engagement.downvotesCount) }}
      </dd>
    </dl>

    <dl>
      <dt>Saves</dt>
      <dd>
        {{ formatCounts(insight.engagement.favoritesCount) }}
          <button 
              :disabled="uiMeta.isFavoriteDisabled || insight.isArchived" 
              aria-label="Bookmark this insight"
              title="Bookmark"
               @click="engage.favorite(insight.engagement)"
            >
              Add To Favorites
            </button>
      </dd>
    </dl>

    <dl>
      <dt>Shares</dt>
      <dd>{{ formatCounts(insight.engagement.sharesCount) }}</dd>
    </dl>

    <dl>
      <dt>Reports</dt>
      <dd>{{ formatCounts(insight.engagement.flagsCount) }}
          <button 
              :disabled="uiMeta.isFlagDisabled" 
              aria-label="Report this insight"
              title="Flag"
                @click="modalStore.push('FlagContent', 'Flag Insight', insight.engagement)"
            >
          Report Insight
            </button>
      </dd>
    </dl>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/description-list.less";
</style>