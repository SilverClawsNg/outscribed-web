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
      <p class="content__summary">{{ tale.summary }}</p>
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
            <button class="content__footer--save" @click="engage.favorite(tale.engagement)">
              <SvgIcons name="bookmark" /> <span>Add to Favorites</span>
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

</style>
