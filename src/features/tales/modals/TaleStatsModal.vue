<script setup lang="ts">

// --- IMPORTS ---
import { computed } from 'vue'
import { useModalStore } from '@/stores/modalStore'
import { type TaleDetailDto } from '@/features/tales/types/TalesTypes' // 🎯 Import your clean semantics
import { toLongDate } from '@/utils/dateExtensions'
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { formatCounts } from '@/utils/stringHelpers'
import { getEngagementMetadata, type ActiveContentContext } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import { useContentCommentsStore } from '@/features/engagements/stores/ContentCommentsStore.ts';

// --- INITIALIZE STORES ---
const modalStore = useModalStore()
const engage = useEngagement()
  const contentStore = useContentCommentsStore();

const props = defineProps<{
  payload: unknown // Accept as unknown for maximum flexibility
}>()

// 🔒 Strongly-type cast the payload context for your template and logic
const tale = computed(() => props.payload as TaleDetailDto)

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(tale.value.engagement));

const content: ActiveContentContext = {
  id: tale.value.taleId,
  title: tale.value.title,
  contentType: 'Tale',
  engagement: tale.value.engagement,
  pinnedComment: null
};

function viewComments() {
  contentStore.setActiveContent(content);
  modalStore.push('ContentComments', 'Comments');
}

function createComment() {
  contentStore.setActiveContent(content);
  modalStore.push('CreateComment', 'New Comment');
}
</script>

<template>

  <article>

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
      <dt>Comments</dt>
      <dd>
        {{ formatCounts(tale.engagement.commentsCount) }}
        <button 
          :disabled="tale.engagement.commentsCount === 0" 
          @click="viewComments"
        >
          View Comments
        </button>
        <span class="divider divider--line"></span>
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
      <dt>Transformed My Perspectives</dt>
      <dd>
        {{ formatCounts(tale.engagement.transformedPerspectivesCount) }}
        <button 
          :disabled="tale.engagement.transformedPerspectivesCount === 0" 
          @click="modalStore.push('ContentVotes', 'Tale Recommendations', tale.taleId)"
        >
          View Votes
        </button>
      </dd>
    </dl>

    <dl>
      <dt>Exposes Crucial Realities</dt>
      <dd>
        {{ formatCounts(tale.engagement.exposesRealitiesCount) }}
      </dd>
    </dl>

      <dl>
      <dt>Sparks Necessary Debates</dt>
      <dd>
        {{ formatCounts(tale.engagement.sparksDebatesCount) }}
      </dd>
    </dl>

      <dl>
      <dt>Missed Critical Context</dt>
      <dd>
        {{ formatCounts(tale.engagement.missedCriticalContextsCount) }}
      </dd>
    </dl>

      <dl>
      <dt>Lacks Real World Relevance</dt>
      <dd>
        {{ formatCounts(tale.engagement.lacksRealWorldRelevancesCount) }}
      </dd>
    </dl>

    <dl>
      <dt>Saves</dt>
      <dd>
        {{ formatCounts(tale.engagement.favoritesCount) }}
          <button 
              :disabled="uiMeta.isFavoriteDisabled || tale.isArchived" 
              aria-label="Bookmark this tale"
              title="Bookmark"
               @click="engage.favorite(tale.engagement)"
            >
             Add To Favorites
            </button>
      </dd>
    </dl>

    <dl>
      <dt>Shares</dt>
      <dd>{{ formatCounts(tale.engagement.sharesCount) }}</dd>
    </dl>

    <dl>
      <dt>Reports</dt>
      <dd>{{ formatCounts(tale.engagement.flagsCount) }}
        <button 
              :disabled="uiMeta.isFlagDisabled" 
              aria-label="Report this tale"
              title="Flag"
              @click="modalStore.push('FlagContent', 'Flag Tale', tale.engagement)"
            >
            Report Tale
            </button>
      </dd>
    </dl>

  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list.less";
</style>