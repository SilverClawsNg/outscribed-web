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
import { formatCounts } from '@/utils/stringHelpers'

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
    <header class="writer-card__header">

      <div class="writer-card__title">
        <button 
          type="button" 
          class="writer-card__username" 
          title="Creator Profile" 
          @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)"
        >
          @{{ writer.creator.username }}
        </button>
        <span class="divider divider--circle"></span>

          <time>{{ toShortDate(writer.onboardedAt) }}</time>
      </div>

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
        <span class="writer-card__metric-value"> {{ formatCounts(writer.creator.talesCount) }}</span>
        <span class="writer-card__metric-label"> Tales&rarr;</span>
      </RouterLink>

      <span class="divider divider--line"></span>

      <RouterLink 
        :to="`/comments?username=${writer.creator.username}`" 
        class="writer-card__metric-link" 
        :class="{ 'disabled': writer.creator.commentsCount === 0 }"
        title="Filter Comments"
      >
        <span class="writer-card__metric-value">{{ formatCounts(writer.creator.commentsCount) }}</span>
        <span class="writer-card__metric-label"> Comments&rarr;</span>
      </RouterLink>

    </div>

  <div class="divider-multi"><span></span></div>

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

.content-x-card {
padding: 0;
border-bottom:0;
}
</style>