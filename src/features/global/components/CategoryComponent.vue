<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { formatCounts } from '@/utils/stringHelpers'
import { type CategoryMetricsDto } from '../types/GlobalTypes';
import { useModalStore } from '@/stores/modalStore'
import { CategoryDescriptions, CategorySummaries } from '@/utils/descriptors'

const modalStore = useModalStore()

interface Props {
  category: CategoryMetricsDto;
  type?: 'focus' | 'pill';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'pill'
});


</script>

<template>

 <article class="discovery-card" 
          :class="[type === 'focus' ? 'discovery-card--focus' : 'discovery-card--pill']">

          <h3 class="discovery-card__title"
            :class="[type === 'focus' ? 'discovery-card__title--focus' : 'discovery-card__title--pill']">

               <RouterLink 
                    :to="`/tales?category=${category.category}`" 
                    class="discovery-card__title-link"
                    :class="{ 'disabled': category.talesCounter === 0 }"
                    title="Filter Tales"
                  >
                   <span class="hash">#</span>{{ CategoryDescriptions[category.category] }}
                  </RouterLink>
           
            </h3>

            <p class="discovery-card__summary"
            :class="[type === 'focus' ? 'discovery-card__summary--focus' : 'discovery-card__summary--pill']">
              {{ CategorySummaries[category.category] }}
            </p>

              <div class="discovery-card__actions"
              :class="[type === 'focus' ? 'discovery-card__actions--focus' : 'discovery-card__actions--pill']">

                    <button 
                        type="button" 
                        class="btn btn--primary btn--outscribe"
                         :class="[type === 'focus' ? 'btn--primary-white' : null]"
                        @click="modalStore.push('CreateTale', 'Create Tale', { category: category.category })"
                        title="OutScribe a new tale"
                      >
                      OutScribe
                      </button>
                       <RouterLink 
                    :to="`/tales?category=${category.category}`" 
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': category.talesCounter === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(category.talesCounter) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

      </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/discovery-card.less";
</style>