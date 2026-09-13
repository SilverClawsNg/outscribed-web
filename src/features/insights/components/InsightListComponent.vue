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

const contentType = 'insights'
const contentPath = 'insight'

</script>

<template>
  
  <article class="content-card">
    <!-- Cover Image Header -->
     
            <header class="content-card__media" :class="{ 'no-media': !insight.photo }">
                <template v-if="insight.photo">
              <RouterLink class="content-card__media-link" :to="`/${contentPath}/${insight.slug}`">
                  <img 
                    :src="mediaHelper.getUrl(insight.photo, contentType, 'thumb') || undefined" 
                    :alt="insight.title" 
                    class="content-card__image"
                  />
              </RouterLink>
               
     </template>
   <div class="content-card__author-badge" :class="{ 'stand-alone': !insight.photo }">
        <button class="at" @click="modalStore.push('Profile', 'Profile', insight.creatorId)">
          {{ insight.creatorUsername }}
        </button>
        <span class="shared__divider shared__divider--line"></span>
        <time class="content-card__date">{{ toRelativeTime(insight.createdAt) }}</time>
      </div>
     
    </header>
   
    <!-- Content Body -->
    <div class="content-card__body">
      <!-- Taxonomy Metadata -->
      <div class="content-card__meta">
        <RouterLink :to="`/${contentType}?category=${insight.category}`" class="content-card__meta-link">
          {{ CategoryDescriptions[insight.category] }}
        </RouterLink>
        
        <template v-if="insight.country">
          <span class="shared__divider shared__divider--circle"></span>
          <RouterLink :to="`/${contentType}?country=${insight.country}`" class="content-card__meta-link">
            {{ CountryDescriptions[insight.country] }}
          </RouterLink>
        </template>
      </div>

      <!-- Title -->
      <h2 class="content-card__title">
        <RouterLink :to="`/${contentPath}/${insight.slug}`">{{ insight.title }}</RouterLink>
      </h2>

      <!-- Summary -->
      <p class="content-card__summary">
        {{ insight.summary.length > 500 ? insight.summary.substring(0, 500) + '...' : insight.summary }}
      </p>

      <!-- Engagement Metrics -->
      <div class="content-card__stats">
        <p class="content-card__stat"><span>{{ insight.readingTime }}</span> Min Read</p>
        <p class="content-card__stat"><span>{{ formatCounts(insight.engagement.commentsCount) }}</span> Comments</p>
        <p class="content-card__stat"><span>{{ formatCounts(insight.engagement.viewsCount) }}</span> Views</p>
        <p class="content-card__stat"><span>{{ formatCounts(insight.engagement.upvotesCount) }}</span> Upvotes</p>
        <p class="content-card__stat"><span>{{ formatCounts(insight.engagement.favoritesCount) }}</span> Saves</p>
      </div>
    </div>

    <!-- Actions Footer -->
    <footer class="content-card__footer">
      <RouterLink class="btn secondary" :to="`/${contentPath}/${insight.slug}`">View Insight</RouterLink>
      
      <button 
        class="content-card__save-btn"
        @click="engage.favorite(insight.engagement)"
        :title="insight.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled"
      >
        <SvgIcons name="bookmark" /> 
        <span>{{ uiMeta.favoriteLongText }}</span>
      </button>
    </footer>
    
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/content-card.less";
</style>
