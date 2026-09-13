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
  tale: TaleListDto
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.tale.engagement));

const contentType = 'tales'
const contentPath = 'tale'

</script>

<template>

  <article class="content-card">
    <!-- Cover Image Header -->
           
     <header class="content-card__media" :class="{ 'no-media': !tale.photo }">

        <template v-if="tale.photo">
          <RouterLink class="content-card__media-link" :to="`/${contentPath}/${tale.slug}`">
              <img 
            :src="mediaHelper.getUrl(tale.photo, contentType, 'thumb') || undefined" 
            :alt="tale.title" 
            class="content-card__image"
          />
          </RouterLink>
       </template>

      <div class="content-card__author-badge" :class="{ 'stand-alone': !tale.photo }">
        <button class="at" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
          {{ tale.creatorUsername }}
        </button>
        <span class="shared__divider shared__divider--line"></span>
        <time class="content-card__date">{{ toRelativeTime(tale.createdAt) }}</time>
      </div>
    </header>

    <!-- Content Body -->
    <div class="content-card__body">
      <!-- Taxonomy Metadata -->
      <div class="content-card__meta">
        <RouterLink :to="`/${contentType}?category=${tale.category}`" class="content-card__meta-link">
          {{ CategoryDescriptions[tale.category] }}
        </RouterLink>
        
        <template v-if="tale.country">
          <span class="shared__divider shared__divider--circle"></span>
          <RouterLink :to="`/${contentType}?country=${tale.country}`" class="content-card__meta-link">
            {{ CountryDescriptions[tale.country] }}
          </RouterLink>
        </template>
      </div>

      <!-- Title -->
      <h2 class="content-card__title">
        <RouterLink :to="`/${contentPath}/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h2>

      <!-- Summary -->
      <p class="content-card__summary">
        {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
      </p>

      <!-- Engagement Metrics -->
      <div class="content-card__stats">
        <p class="content-card__stat"><span>{{ tale.readingTime }}</span> Min Read</p>
        <p class="content-card__stat"><span>{{ formatCounts(tale.engagement.commentsCount) }}</span> Comments</p>
        <p v-if="tale.insightsCount !== undefined" class="content-card__stat">
          <span>{{ formatCounts(tale.insightsCount) }}</span> Insights
        </p>
        <p class="content-card__stat"><span>{{ formatCounts(tale.engagement.viewsCount) }}</span> Views</p>
        <p class="content-card__stat"><span>{{ formatCounts(tale.engagement.upvotesCount) }}</span> Upvotes</p>
        <p class="content-card__stat"><span>{{ formatCounts(tale.engagement.favoritesCount) }}</span> Saves</p>
      </div>
    </div>

    <!-- Actions Footer -->
    <footer class="content-card__footer">
      <RouterLink class="btn secondary" :to="`/${contentPath}/${tale.slug}`">View Tale</RouterLink>
      
      <button 
        class="content-card__save-btn"
        @click="engage.favorite(tale.engagement)"
        :title="tale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
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
