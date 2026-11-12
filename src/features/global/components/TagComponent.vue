<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { formatCounts } from '@/utils/stringHelpers'
import { type TagListDto } from '../types/GlobalTypes';
import { useModalStore } from '@/stores/modalStore'
import { toShortDate } from '@/utils/dateExtensions'

const modalStore = useModalStore()

// Declare compile-time parameter contract boundaries
interface Props {
  tag: TagListDto
}

const props = defineProps<Props>()

</script>

<template>

  <article class="discovery-card discovery-card--pill">

      <h3 class="discovery-card__title discovery-card__title--pill">

         <button 
          type="button" 
           class="discovery-card__title-link"
          title="View Tag Details"
          :class="{ 'disabled': tag.talesCounter === 0 }"
          @click="modalStore.push('TagDetail', 'Tag Details', tag.tagId)"
        >
          <span class="hash">#</span>{{ tag.name }}
        </button>

            </h3>

              <time class="discovery-card__date"> {{ toShortDate(tag.date) }}</time>
              
              <div class="discovery-card__actions discovery-card__actions--pill">

                 
                       <RouterLink 
                   :to="`/tales?tag=${tag.slug}`"  
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': tag.talesCounter === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(tag.talesCounter) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/discovery-card.less";
</style>