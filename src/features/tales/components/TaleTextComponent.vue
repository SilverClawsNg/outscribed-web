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
import { CategoryClasses, CategoryDescriptions, CountryDescriptions, CountryFlags } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

interface Props {
   tale: TaleListDto,
  type?: 'focus' | 'pill';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'pill'
});

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.tale.engagement));

</script>

<template>
   
    <div class="content">
       <p class="content__categories">
            <RouterLink :to="`/tales?category=${tale.category}`"
             :class="`categories__${CategoryClasses[tale.category]}`">
              <span>{{ CategoryDescriptions[tale.category] }}</span>
            </RouterLink>
          </p>
      <h3 class="content__title"
      :class="[type === 'focus' ? 'content__title--focus' : 'content__title--pill']">
        <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h3>
      <p class="content__summary">
        {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
      </p>
        <div class="content__meta">
              <button class="at" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
              {{ tale.creatorUsername }}
            </button>
            <span class="divider divider--circle"></span>
            <time>{{ toRelativeTime(tale.createdAt) }}</time>
            <span class="divider divider--circle"></span>
             <span>{{ tale.readingTime }} Min Read</span>
            <span class="divider divider--circle"></span>
            <RouterLink :to="`/tales?country=${tale.country}`">
              <span class="content__meta--spaced">{{ CountryFlags(tale.country) }}</span>
              <span>{{ CountryDescriptions[tale.country] }}</span>
            </RouterLink>
          </div>
            <footer class="content__footer">
            <RouterLink  class="content__footer--read" :to="`/tale/${tale.slug}`">Read&rarr;</RouterLink>
            <button class="content__footer--save" 
                :title="tale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                :disabled="uiMeta.isFavoriteDisabled"
                @click="engage.favorite(tale.engagement)">
              <SvgIcons name="bookmark" />   <span>{{ uiMeta.favoriteLongText }}</span>
            </button>
          </footer>
      </div>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

 .content {
    width: 100%;

    &__categories{
      margin-bottom: 0.5rem;

  // Base pill styling
  a {
    display: inline-block;
    padding: 1px 2px;
    border-radius: 4px;
    border: 1px solid transparent;
    font-size: 0.725rem;
    font-weight: 600;
    text-transform: uppercase;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.85;
    }
  }

    }

    
    
  &__title{
    font-weight:700;
    margin-bottom: 0.5rem;

    &--focus{
    font-size:2rem;
    line-height: 2.2rem;
    }

      &--pill{
    font-size:1.2rem;
    line-height: 1.4rem;

  }

  }

  &__summary{
    color: var(--muted-text-color);
    margin-bottom: 0.5rem;
  }

  &__meta{
    font-size:0.9rem;
    line-height: 1.5rem;

    &--spaced{
      margin-right: 0.25rem
    }
  }
  
  &__footer {
    display: flex;
    justify-content: flex-start;
    align-items:center;
    column-gap: 0.75rem;
    width: 100%;
    margin-top: 1rem;
    font-weight: normal;
     font-size: 0.9rem;
    
  &--read {
     background-color: var(--background-color);
     border:1px solid var(--border-color);
     padding: 0.5rem 0.75rem;
     border-radius: 99999px;
     color: var(--muted-text-color);
     

      &:hover {
        background-color: var(--light-background-color);
        color: @link-color;
      }
    }

    &--save{
      display: flex;
      align-items:center;
      column-gap: 0.15rem;
    }
  
  }

}

  .categories {
  display: inline-flex;

  // Mapped Modifiers matching your CategoryClasses keys
  &__tributuary {
    background-color: @tributuary-background-color;
    border-color: @tributuary-border-color;
    color: @tributuary-text-color;
  }

  &__reflections {
    background-color: @reflections-background-color;
    border-color: @reflections-border-color;
    color: @reflections-text-color;
  }

  &__dooms-day {
    background-color: @dooms-day-background-color;
    border-color: @dooms-day-border-color;
    color: @dooms-day-text-color;
  }

  &__politics-government {
    background-color: @politics-government-background-color;
    border-color: @politics-government-border-color;
    color: @politics-government-text-color;
  }

  &__sports-gaming {
    background-color: @sports-gaming-background-color;
    border-color: @sports-gaming-border-color;
    color: @sports-gaming-text-color;
  }

  &__science-technology {
    background-color: @science-technology-background-color;
    border-color: @science-technology-border-color;
    color: @science-technology-text-color;
  }

  &__education {
    background-color: @education-background-color;
    border-color: @education-border-color;
    color: @education-text-color;
  }

  &__business-economy {
    background-color: @business-economy-background-color;
    border-color: @business-economy-border-color;
    color: @business-economy-text-color;
  }

  &__arts-entertainment {
    background-color: @arts-entertainment-background-color;
    border-color: @arts-entertainment-border-color;
    color: @arts-entertainment-text-color;
  }

  &__medicine-healthcare {
    background-color: @medicine-healthcare-background-color;
    border-color: @medicine-healthcare-border-color;
    color: @medicine-healthcare-text-color;
  }

  &__law-order {
    background-color: @law-order-background-color;
    border-color: @law-order-border-color;
    color: @law-order-text-color;
  }

  &__societal-norms-values {
    background-color: @societal-norms-values-background-color;
    border-color: @societal-norms-values-border-color;
    color: @societal-norms-values-text-color;
  }

  &__history-culture {
    background-color: @history-culture-background-color;
    border-color: @history-culture-border-color;
    color: @history-culture-text-color;
  }

  &__environment-climate {
    background-color: @environment-climate-background-color;
    border-color: @environment-climate-border-color;
    color: @environment-climate-text-color;
  }

  &__religion-spirituality {
    background-color: @religion-spirituality-background-color;
    border-color: @religion-spirituality-border-color;
    color: @religion-spirituality-text-color;
  }

  &__family-relationships {
    background-color: @family-relationships-background-color;
    border-color: @family-relationships-border-color;
    color: @family-relationships-text-color;
  }

  &__miscellaneous {
    background-color: @miscellaneous-background-color;
    border-color: @miscellaneous-border-color;
    color: @miscellaneous-text-color;
  }
}

</style>
