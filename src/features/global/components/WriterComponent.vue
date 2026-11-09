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
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.writer.creator.engagement))

</script>

<template>

 <article class="discovery-card discovery-card--pill">

          <h3 class="discovery-card__title discovery-card__title--pill">

          <button 
            type="button"
            class="discovery-card__title--username at" 
            @click="modalStore.push('Profile', 'Profile', writer.creator.accountId)"
          >
            {{ writer.creator.username }}
          </button>

          </h3>

          <time class="discovery-card__date"><span>OutScribing </span>since {{ toShortDate(writer.onboardedAt) }}</time>

              <div class="discovery-card__actions discovery-card__actions--pill">

                    <button 
                        type="button" 
                        class="btn btn--primary"
                        :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                        :disabled="uiMeta.isFavoriteDisabled"
                        @click="engage.favorite(writer.creator.engagement)"
                      >
                      {{ uiMeta.favoriteAltText }}
                      </button>
                     <RouterLink 
                        :to="`/tales?username=${writer.creator.username}`" 
                       class="discovery-card__metric-link"
                        :class="{ 'disabled': writer.creator.talesCount === 0 }"
                        title="Filter Tales"
                      >
                        <span class="discovery-card__metric-value">{{ formatCounts(writer.creator.talesCount) }}</span>
                        <span class="discovery-card__metric-label">Tales&rarr;</span>
                      </RouterLink>


              </div>

      </article>


</template>

<style lang="less" scoped>
@import "@/assets/css/discovery-card.less";
</style>