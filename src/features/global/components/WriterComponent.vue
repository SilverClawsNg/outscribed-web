<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { formatCounts } from '@/utils/stringHelpers'
import { type WriterStatsDto } from '../types/GlobalTypes'
import { useModalStore } from '@/stores/modalStore'
import { CountryDescriptions } from '@/utils/descriptors'
import { toShortDate } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement'

const modalStore = useModalStore()
const engage = useEngagement()

// Declare props contract: index is optional/nullable for unranked writers
interface Props {
  writer: WriterStatsDto
  index?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  index: null
})

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.writer.creator.engagement))

// Helper to determine if the writer is in the top 3 rankings
const isGold = computed(() => props.index === 0)
const isSilver = computed(() => props.index === 1)
const isBronze = computed(() => props.index === 2)
const isNewWriter = computed(() => props.index === null || props.index === undefined)
</script>

<template>

  <article 
    class="writer-card"
    :class="{
      'writer-card--gold': isGold,
      'writer-card--silver': isSilver,
      'writer-card--bronze': isBronze,
      'writer-card--new': isNewWriter
    }"
  >

    <div class="writer-card__header">

      <h3 class="writer-card__title">
        
        <!-- Rank / Badge Indicator (30px x 30px square element) -->
        <span 
          class="writer-card__badge"
          :class="{
            'writer-card__badge--gold': isGold,
            'writer-card__badge--silver': isSilver,
            'writer-card__badge--bronze': isBronze,
            'writer-card__badge--number': !isNewWriter && !isGold && !isSilver && !isBronze,
            'writer-card__badge--new': isNewWriter
          }"
          :title="isNewWriter ? 'New Writer' : `Rank ${index! + 1}`"
        >
          <!-- Display rank number only for rank #4 and lower -->
          <template v-if="!isNewWriter && !isGold && !isSilver && !isBronze">
            {{ index! + 1 }}
          </template>
        </span>

          <button 
            type="button"
            class="writer-card__username at" 
            @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)"
          >
            {{ writer.creator.username }}
          </button>
      </h3>
      
      <!-- Writer Call to Action -->
      <button 
        type="button" 
        class="btn btn--secondary"
        :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled"
        @click="engage.favorite(writer.creator.engagement)"
      >
        <SvgIcons name="bookmark" /> {{ uiMeta.favoriteAltText }}
      </button>

    </div>

      <div class="writer-card__metadata">
      
       <span class="writer-card__metadata--item">{{ CountryDescriptions[writer.country] }}</span>
             <span class="divider divider--circle"></span>
          <time>{{ toShortDate(writer.onboardedAt) }}</time>

      </div>

    <div class="writer-card__metric">
      <RouterLink 
        :to="`/tales?username=${writer.creator.username}`" 
        class="writer-card__metric-link" 
         :class="{ 'disabled': writer.creator.talesCount === 0 }"
        title="Filter Tales"
      >
        <span class="writer-card__metric-value">{{ formatCounts(writer.creator.talesCount) }}</span>
        <span class="writer-card__metric-label">Tales &rarr;</span>
      </RouterLink>

      <span class="divider divider--line"></span>

      <RouterLink 
        :to="`/insights?username=${writer.creator.username}`" 
        class="writer-card__metric-link" 
        :class="{ 'disabled': writer.creator.insightsCount === 0 }"
        title="Filter Insights"
      >
        <span class="writer-card__metric-value">{{ formatCounts(writer.creator.insightsCount) }}</span>
        <span class="writer-card__metric-label">Insights &rarr;</span>
      </RouterLink>

      <span class="divider divider--line"></span>

      <RouterLink 
        :to="`/comments?username=${writer.creator.username}`" 
        class="writer-card__metric-link" 
        :class="{ 'disabled': writer.creator.commentsCount === 0 }"
        title="Filter Comments"
      >
        <span class="writer-card__metric-value">{{ formatCounts(writer.creator.commentsCount) }}</span>
        <span class="writer-card__metric-label">Comments &rarr;</span>
      </RouterLink>

    </div>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/writer-x-card.less";
</style>