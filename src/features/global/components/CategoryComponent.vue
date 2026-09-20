<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { formatCounts } from '@/utils/stringHelpers'
import { type CategoryMetricsDto } from '../types/GlobalTypes';
import { useModalStore } from '@/stores/modalStore'
import { CategoryDescriptions, CategorySummaries } from '@/utils/descriptors'

const modalStore = useModalStore()


// Declare compile-time parameter contract boundaries
interface Props {
  category: CategoryMetricsDto
}

const props = defineProps<Props>()

</script>

<template>
  <div class="category-card">
    <h3 class="category-card__title">{{ CategoryDescriptions[category.category] }}</h3>
    <p class="category-card__summary">{{ CategorySummaries[category.category] }}</p>
    
    <div 
      class="category-card__meta" 
      :class="{ 'category-card__meta--empty': (category.talesCounter + category.insightsCounter) === 0 }"
    >
      <RouterLink 
          :to="`/tales?category=${category.category}`" 
          class="category-card__metric-link" 
          title="Filter Tales"
        >
          <span class="category-card__metric-value">{{ formatCounts(category.talesCounter) }}</span>
          <span class="category-card__metric-label">Tales</span>
        </RouterLink>

      <span class="divider divider--line"></span>

       <RouterLink 
          :to="`/insights?category=${category.category}`" 
          class="category-card__metric-link" 
          title="Filter Insights"
        >
          <span class="category-card__metric-value">{{ formatCounts(category.insightsCounter) }}</span>
          <span class="category-card__metric-label">Insights</span>
        </RouterLink>

        <span class="divider divider--line"></span>

        <!-- Writer Call to Action -->
          <button 
            type="button"
            class="btn btn--secondary" 
            @click="modalStore.push('CreateTale', 'Create Tale', category.category)"
          >
            Write Tale
          </button>

    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/category-card.less";
</style>