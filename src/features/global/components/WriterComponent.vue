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
import SvgIcons from '@/components/SvgIcons.vue'

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

    <header class="writer-card__header">

      <div class="writer-card__meta">
        
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

        <div class="writer-card__title">
            <button 
            type="button"
            class="writer-card__title--username at" 
            @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)"
          >
            {{ writer.creator.username }}
          </button>

            <time class="writer-card__title--time"><span>OutScribing </span>since {{ toShortDate(writer.onboardedAt) }}</time>
        </div>
        
      </div>
      
      <!-- Writer Call to Action -->
      <button 
        type="button" 
        class="btn btn--secondary"
        :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled"
        @click="engage.favorite(writer.creator.engagement)"
      >
       {{ uiMeta.favoriteAltText }}
      </button>

    </header>

    <div class="writer-card__metric">
      <RouterLink 
        :to="`/tales?username=${writer.creator.username}`" 
        class="writer-card__metric-link" 
         :class="{ 'disabled': writer.creator.talesCount === 0 }"
        title="Filter Tales"
      >
        <span class="writer-card__metric-value">{{ formatCounts(writer.creator.talesCount) }}</span>
        <span class="writer-card__metric-label">Tales&rarr;</span>
      </RouterLink>

      <span class="divider divider--line"></span>

      <RouterLink 
        :to="`/comments?username=${writer.creator.username}`" 
        class="writer-card__metric-link" 
        :class="{ 'disabled': writer.creator.commentsCount === 0 }"
        title="Filter Comments"
      >
        <span class="writer-card__metric-value">{{ formatCounts(writer.creator.commentsCount) }}</span>
        <span class="writer-card__metric-label">Comments&rarr;</span>
      </RouterLink>

    </div>
  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.writer-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  border-bottom: 2px solid var(--border-color);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    
  }

  &__title{
    display: flex;
    flex-direction:column;
    align-items:flex-start;

    &--username{
      font-size: 1.25rem;
      }

      &--time{
        font-size: 0.95rem;

        & span{
          font-style: italic;
        }
  
      }
  }

  &__badge {
    font-size: 0.95rem;
    font-weight: 900;
    border-radius: 4px;
    letter-spacing: 0.03em;
    line-height: 1;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items:center;
    justify-content:center;
    color: var(--background-color);

    // #1 Gold Background
     &--gold {
      background-color: @gold-color;
    }

     &--silver {
      background-color: @silver-color;
    }

    &--bronze {
      background-color: @bronze-color;
    }

    &--number{
        background-color: var(--text-color);
    }

    // New Writers (Unnumbered, Transparent, Neutral Theme Border)
    &--new {
      background-color: transparent;
      border: 1px solid var(--text-color);
    }
  }

  &__metadata{
    margin-bottom: 1rem;
    display: flex;
    align-items:center;
    column-gap: 0.25rem;
  }

  &__metrics {
    display: flex;
    align-items: center;
    column-gap: 0.75rem;
    font-size: 0.95rem;
     
    @media @phone{
      column-gap: 0.15rem;
    }
  }

  &__metric-link {
    display: inline-flex;
    align-items: center;
    column-gap: 0.25rem;
  }

  &__metric-value {
    font-weight: 700;
  }

  &__metric-label {
    font-weight: 400;
  }
}
</style>