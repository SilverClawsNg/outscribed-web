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
  tale: TaleListDto,
  isHomepage?: boolean
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.tale.engagement));

const contentType = 'tales'
const contentPath = 'tale'

</script>

<template>

  <article class="tale-card">

    <div v-if="tale.photo" class="tale-card__media">
      <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
    </div>
    <div v-else class="tale-card__media--empty">
      <SvgIcons name="nophoto" :size="60" />
    </div>

      <div class="tale-card__content">

      <TaleTextComponent 
              :tale="tale" 
              type="pill" 
            />

        </div>

      </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/discovery-container.less";


.content-card {
  width: 100%;
  height: auto;
 
  &__media {
    width: 100%;
    aspect-ratio: 450 / 337;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--light-background-color);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }
}

   
</style>
