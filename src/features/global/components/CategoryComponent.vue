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
  index: number
}

const props = defineProps<Props>()

</script>

<template>

  <article 
    class="category-card"
    :class="{
      'category-card--gold': index === 0,
      'category-card--silver': index === 1,
      'category-card--bronze': index === 2
    }"
  >

  <header class="category-card__header">

  <h3 class="category-card__title">
      
  <!-- Rank Indicator -->
      <!-- #1: Top border handles the gold visual accent -->
      <span v-if="index === 0" class="category-card__badge category-card__badge--gold" title="Rank 1"></span>

      <!-- #2: Silver Badge -->
      <span v-else-if="index === 1" class="category-card__badge category-card__badge--silver"></span>

      <!-- #3: Bronze Badge -->
      <span v-else-if="index === 2" class="category-card__badge category-card__badge--bronze"></span>

      <!-- #4+: Standard Rank Prefix -->
      <span v-else class="category-card__badge category-card__badge--number">{{ index + 1 }}</span>

    {{ CategoryDescriptions[category.category] }}
  </h3>

   <button 
            type="button"
            class="btn btn--secondary" 
            @click="modalStore.push('CreateTale', 'Create Tale', category.category)"
          >
            OutScribe
          </button>

  </header>


    <p class="category-card__summary">{{ CategorySummaries[category.category] }}</p>
    
    <div 
      class="category-card__meta" 
      :class="{ 'category-card__meta--empty': (category.talesCounter + category.insightsCounter) === 0 }"
    >
      <RouterLink 
          :to="`/tales?category=${category.category}`" 
          class="category-card__metric-link" 
          :class="{ 'disabled': category.talesCounter === 0 }"
          title="Filter Tales"
        >
          <span class="category-card__metric-value">{{ formatCounts(category.talesCounter) }}</span>
          <span class="category-card__metric-label">Tales &rarr;</span>
        </RouterLink>

      <span class="divider divider--line"></span>

       <RouterLink 
          :to="`/insights?category=${category.category}`" 
          class="category-card__metric-link" 
          :class="{ 'disabled': category.insightsCounter === 0 }"
          title="Filter Insights"
        >
          <span class="category-card__metric-value">{{ formatCounts(category.insightsCounter) }}</span>
          <span class="category-card__metric-label">Insights &rarr;</span>
        </RouterLink>

    </div>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/category-card.less";
</style>