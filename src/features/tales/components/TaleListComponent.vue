<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useTaleListStore } from '../stores/TaleListStore';
import { useEngagement } from '@/composables/useEngagement';

import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type TaleListDto } from '../types/TalesTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'

// 2. Setup Shared Store Hooks
const authStore = useAuthStore()
const modalStore = useModalStore()
const engage = useEngagement()

const taleStore = useTaleListStore();

// Declare compile-time parameter contract boundaries
interface Props {
  tale: TaleListDto
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.tale.engagement));

</script>

<template>
 
   <article class="content-lists__card">
   
    <section class="content-lists__image">

       <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb') || undefined" :alt="tale.title" />

         <div class="content-lists__metadata-writer">

        <button class="at" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
          {{ tale.creatorUsername }}
        </button>
        <span class="divider line"></span>
        {{ toRelativeTime(tale.createdAt) }}

      </div>

    </section>

    
      <div class="content-lists__metadata">
       
        <RouterLink :to="`/tales?category=${tale.category}`">
          {{ CategoryDescriptions[tale.category] }}
        </RouterLink>
        
        <template v-if="tale.country">
         <span class="divider circle"></span>
          <RouterLink :to="`/tales?country=${tale.country}`">
            {{ CountryDescriptions[tale.country] }}
          </RouterLink>
        </template>
      </div>

      <h1 class="content-lists__title">
        <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h1>

    <section class="content-lists__summary">
      <div>
        {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
       
      </div>
    </section>

    <section class="content-lists__stats">
      <p><span>{{ tale.readingTime }}</span> Minutes Read</p>
      <p><span>{{ formatCounts(tale.engagement.commentsCount) }}</span> Comments</p>
      <p><span>{{ formatCounts(tale.insightsCount) }}</span> Insights</p>
      <p><span>{{ formatCounts(tale.engagement.viewsCount) }}</span> Views</p>
      <p><span>{{ formatCounts(tale.engagement.upvotesCount) }}</span> Upvotes</p>
      <p><span>{{ formatCounts(tale.engagement.favoritesCount) }}</span> Saves</p>
    </section>

    <section class="content-lists__footer">
       <RouterLink class="btn secondary" :to="`/tale/${tale.slug}`">Read More</RouterLink>
      <button 
        @click="engage.favorite(tale.engagement)"
        :title="tale.engagement.isFavorite ? 'Remove From Saves' : 'Add To Favorites'"
        :disabled="uiMeta.isFavoriteDisabled">
        <SvgIcons name="bookmark" /> {{ uiMeta.favoriteLongText }}
      </button>
    </section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/content-lists.less";
</style>