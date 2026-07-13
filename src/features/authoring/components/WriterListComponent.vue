<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useWriterListStore } from '../stores/WriterListStore';
import { useEngagement } from '@/composables/useEngagement';

import { formatCounts, truncateText } from '@/utils/stringHelpers'
import { toRelativeTime, toShortDate } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type WriterListDto } from '../types/AuthoringTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'

// 2. Setup Shared Store Hooks
const authStore = useAuthStore()
const modalStore = useModalStore()
const engage = useEngagement()

const writerStore = useWriterListStore();

// Declare compile-time parameter contract boundaries
interface Props {
  writer: WriterListDto
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.writer.creator.engagement));

</script>

<template>
 
   <article class="writer-lists__card">

<section class="writer-lists__writer-details">
  <h1 class="writer-lists__writer-details-title">
         <button title="Creator Profile" class="at" @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)">
          {{ writer.creator.username }}
        </button>
      </h1>
        <div class="writer-lists__writer-details-metadata">
          <span>  <SvgIcons name="clock" /> Onboarded  {{ toShortDate(writer.onboardedAt) }}</span>
                <span>  <SvgIcons name="globe" />   
                  <RouterLink :to="`/writers?country=${writer.country}`">
            {{ CountryDescriptions[writer.country] }}
          </RouterLink></span>

      </div>
         <div class="writer-lists__writer-details-actions">

      <button title="Creator Profile" @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)">
         <SvgIcons name="user" />   Profile
       </button>

        <button 
        @click="engage.favorite(writer.creator.engagement)"
        :title="writer.creator.engagement.isFavorite ? 'Remove From Saves' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled">
        <SvgIcons name="bookmark" /> {{ uiMeta.favoriteAltText }}
      </button>

      </div>
       <div class="writer-lists__writer-details-links">

     <RouterLink :to="`/tales?username=${writer.creator.username}`" class="btn secondary" title="Tales">
        <span class="value">{{ formatCounts(writer.creator.talesCount) }}</span> 
        <span class="field">Tales</span>
      </RouterLink>
      <RouterLink :to="`/insights?username=${writer.creator.username}`" class="btn secondary" title="Insights">
        <span class="value">{{ formatCounts(writer.creator.insightsCount) }}</span> 
        <span class="field">Insights</span>
      </RouterLink>
      <RouterLink :to="`/comments?username=${writer.creator.username}`" class="btn secondary" title="Comments">
        <span class="value">{{ formatCounts(writer.creator.commentsCount) }}</span> 
        <span class="field">Comments</span>
      </RouterLink>

 </div>

</section>

 <section class="writer-lists__latest-content-container">

  <template v-if="writer.latestTale">
  <RouterLink class="writer-lists__latest-content" :to="`/tale/${writer.latestTale.slug}`">
      <h2 class="writer-lists__latest-content-title">
          {{writer.latestTale.title}}
      </h2>
      <p class="writer-lists__latest-content-date">
        {{ toRelativeTime(writer.latestTale.createdAt) }}
      </p>
      <section class="writer-lists__latest-content-summary">
          <div>
              {{truncateText(writer.latestTale.summary, 250)}}
              <span>Continue Reading</span>
          </div>
      </section>
  </RouterLink>
  </template>

   <template v-else>
    <p class="shared_no-content">A problem occured while retrieving the writer's latest tale'</p>
  </template>

</section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/writer-lists.less";
</style>