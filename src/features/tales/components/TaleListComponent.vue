<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement';

import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type TaleListDto } from '../types/TalesTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

interface Props {
  content: TaleListDto
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.content.engagement));

const contentType = 'tales'
const contentPath = 'tale'

</script>

<template>

  <article class="content-card">
    <!-- Cover Image Header -->
      <template v-if="content.photo">
           
     <header class="content-card__media">
       <RouterLink class="content-card__media-link" :to="`/${contentPath}/${content.slug}`">
          <img 
        :src="mediaHelper.getUrl(content.photo, contentType, 'thumb') || undefined" 
        :alt="content.title" 
        class="content-card__image"
      />
       </RouterLink>
    
      <div class="content-card__author-badge">
        <button class="content-card__author-link" @click="modalStore.push('Profile', 'Profile', content.creatorId)">
          {{ content.creatorUsername }}
        </button>
        <span class="divider line alt"></span>
        <time class="content-card__date">{{ toRelativeTime(content.createdAt) }}</time>
      </div>
    </header>

        </template>
   
    
    <!-- Content Body -->
    <div class="content-card__body">
      <!-- Taxonomy Metadata -->
      <div class="content-card__meta">
        <RouterLink :to="`/${contentType}?category=${content.category}`" class="content-card__meta-link">
          {{ CategoryDescriptions[content.category] }}
        </RouterLink>
        
        <template v-if="content.country">
          <span class="divider circle"></span>
          <RouterLink :to="`/${contentType}?country=${content.country}`" class="content-card__meta-link">
            {{ CountryDescriptions[content.country] }}
          </RouterLink>
        </template>
      </div>

      <!-- Title -->
      <h2 class="content-card__title">
        <RouterLink :to="`/${contentPath}/${content.slug}`">{{ content.title }}</RouterLink>
      </h2>

      <!-- Summary -->
      <p class="content-card__summary">
        {{ content.summary.length > 500 ? content.summary.substring(0, 500) + '...' : content.summary }}
      </p>

      <!-- Engagement Metrics -->
      <div class="content-card__stats">
        <p class="content-card__stat"><span>{{ content.readingTime }}</span> Min Read</p>
        <p class="content-card__stat"><span>{{ formatCounts(content.engagement.commentsCount) }}</span> Comments</p>
        <p v-if="content.insightsCount !== undefined" class="content-card__stat">
          <span>{{ formatCounts(content.insightsCount) }}</span> Insights
        </p>
        <p class="content-card__stat"><span>{{ formatCounts(content.engagement.viewsCount) }}</span> Views</p>
        <p class="content-card__stat"><span>{{ formatCounts(content.engagement.upvotesCount) }}</span> Upvotes</p>
        <p class="content-card__stat"><span>{{ formatCounts(content.engagement.favoritesCount) }}</span> Saves</p>
      </div>
    </div>

    <!-- Actions Footer -->
    <footer class="content-card__footer">
      <RouterLink class="btn secondary" :to="`/${contentPath}/${content.slug}`">View Tale</RouterLink>
      
      <button 
        class="content-card__save-btn"
        @click="engage.favorite(content.engagement)"
        :title="content.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
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
