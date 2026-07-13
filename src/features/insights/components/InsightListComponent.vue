<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement';

import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'
import { mediaHelper } from '@/utils/mediaHelper'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type InsightListDto } from '../types/InsightsTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()


// Declare compile-time parameter contract boundaries
interface Props {
  insight: InsightListDto
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.insight.engagement));

</script>

<template>
 
   <article class="content-lists__card">
    
    <section class="content-lists__card-header">
      <h1 class="content-lists__title">
        <RouterLink :to="`/insight/${insight.slug}`">{{ insight.title }}</RouterLink>
      </h1>

      <div class="content-lists__metadata">
        <button class="at" @click="modalStore.push('Profile', 'Profile', insight.creatorId)">
          {{ insight.creatorUsername }}
        </button>
        {{ toRelativeTime(insight.createdAt) }}
      </div>

      <div class="content-lists__metadata">
        <SvgIcons name="tag" />
        <RouterLink :to="`/insights?category=${insight.category}`">
          {{ CategoryDescriptions[insight.category] }}
        </RouterLink>
        
        <template v-if="insight.country">
          <SvgIcons name="globe" />
          <RouterLink :to="`/insights?country=${insight.country}`">
            {{ CountryDescriptions[insight.country] }}
          </RouterLink>
        </template>
      </div>
    </section>

    <section class="content-lists__image">
       <img :src="mediaHelper.getUrl(insight.photo, 'insights', 'thumb') || undefined" :alt="insight.title" />
    </section>

    <section class="content-lists__summary">
      <div>
        {{ insight.summary.length > 500 ? insight.summary.substring(0, 500) + '...' : insight.summary }}
        <RouterLink :to="`/insight/${insight.slug}`">Continue Reading</RouterLink>
      </div>
    </section>

    <section class="content-lists__stats">
      <p><span>{{ insight.readingTime }}</span> Minutes Read</p>
      <p><span>{{ formatCounts(insight.engagement.commentsCount) }}</span> Comments</p>
      <p><span>{{ formatCounts(insight.engagement.viewsCount) }}</span> Views</p>
      <p><span>{{ formatCounts(insight.engagement.upvotesCount) }}</span> Upvotes</p>
      <p><span>{{ formatCounts(insight.engagement.favoritesCount) }}</span> Saves</p>
    </section>

    <section class="content-lists__favorite">
      <button 
        @click="engage.favorite(insight.engagement)"
        :title="insight.engagement.isFavorite ? 'Remove From Saves' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled">
        <SvgIcons name="bookmark" /> {{ uiMeta.favoriteText }}
      </button>
    </section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/content-lists.less";
</style>