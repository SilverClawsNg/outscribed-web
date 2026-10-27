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
            @click="modalStore.push('CreateTale', 'Create Tale', { category: category.category })"
          >
            OutScribe
          </button>
  </header>

    <p class="category-card__summary">{{ CategorySummaries[category.category] }}</p>
    
    <div class="category-card__metrics">
      <RouterLink 
          :to="`/tales?category=${category.category}`" 
          class="category-card__metric-link" 
          :class="{ 'disabled': category.talesCounter === 0 }"
          title="Filter Tales"
        >
          <span class="category-card__metric-value">{{ formatCounts(category.talesCounter) }}</span>
          <span class="category-card__metric-label">Tales&rarr;</span>
        </RouterLink>

    </div>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.category-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-bottom: 2px dotted var(--border-color);

  &__header{
    width: 100%;
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom: 1.25rem;
  }

  &__title {
    font-size: 1.25rem;
    display: flex;
    align-items:center;
    column-gap: 0.5rem;
  
  }

  &__summary {
    margin-bottom: 1.25rem;
    color:var(--muted-text-color);
  }

  &__badge {
    font-size: 0.95rem;
    font-weight: 900;
    border-radius: 4px;
    letter-spacing: 0.03em;
    line-height: 1;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items:center;
    justify-content:center;
    color: var(--background-color);

    &--gold {
      background-color: @gold-color;
    }

     &--silver {
      background-color: @silver-color;
    }

    &--bronze {
      background-color: @bronze-color;
    }

    &--number{
        background-color: var(--text-color);
    }
  }
  
  &__metrics {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
     
  }

  &__metric-link {
   display: inline-flex;
    align-items: center;
    column-gap: 0.25rem;

  }

  &__metric-value {
    font-weight: 700;
  }

  &__metric-label {
    font-weight: 400;
  }

}
</style>