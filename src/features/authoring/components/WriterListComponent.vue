<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement';

import { toShortDate } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type WriterListDto } from '../types/AuthoringTypes';
import { CountryDescriptions } from '@/utils/descriptors'
import Content from '@/components/Content.vue'
import WriterStats from '@/components/WriterStats.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'

// Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

// Declare compile-time parameter contract boundaries
interface Props {
  writer: WriterListDto
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.writer.creator.engagement));

</script>

<template>
  
  <article class="writer-card">
    <!-- Writer Identity & Profile Section -->
    <header class="writer-card__profile">
      <h1 class="writer-card__username">
        <button 
          type="button" 
          class="writer-card__profile-btn" 
          title="Creator Profile" 
          @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)"
        >
          @{{ writer.creator.username }}
        </button>
      </h1>
      <div class="writer-card__meta">
        <span class="writer-card__meta-item">
          <SvgIcons name="clock" /> Onboarded {{ toShortDate(writer.onboardedAt) }}
        </span>
        <span class="writer-card__meta-item">
          <SvgIcons name="globe" />   
          <RouterLink :to="`/writers?country=${writer.country}`" class="writer-card__meta-link">
            {{ CountryDescriptions[writer.country] }}
          </RouterLink>
        </span>
      </div>

      <div class="writer-card__actions">
        <button 
          type="button" 
          class="writer-card__action-btn" 
          title="Creator Profile" 
          @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)"
        >
          <SvgIcons name="user" /> Profile
        </button>

        <button 
          type="button" 
          class="writer-card__action-btn"
          :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
          :disabled="uiMeta.isFavoriteDisabled"
          @click="engage.favorite(writer.creator.engagement)"
        >
          <SvgIcons name="bookmark" /> {{ uiMeta.favoriteAltText }}
        </button>
      </div>

       <WriterStats 
            :username="writer.creator.username"
            :tales-count="writer.creator.talesCount"
            :insights-count="writer.creator.insightsCount"
            :comments-count="writer.creator.commentsCount"
          />

    </header>

    <!-- Writer's Latest Featured Content -->
  
    <div class="writer-card__latest">

      <template v-if="writer.latestTale">

          <Content 
            :title="writer.latestTale.title"
            :slug="writer.latestTale.slug"
            :creator-id="writer.creator.accountId"
            :creator-username="writer.creator.username"
            :created-at="writer.latestTale.createdAt"
            content-type='tale'
            :summary="writer.latestTale.summary"
            :is-alt="false"
          />

      </template>

      <template v-else>
          <PageStatusMessage 
              title="No Published Tale!" 
              message="We could not retrieve the latest tale for this writer."
              icon="broken-chain" 
            />
      </template>
    </div>
  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/writer-card.less";
</style>