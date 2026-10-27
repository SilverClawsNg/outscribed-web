<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { formatCounts } from '@/utils/stringHelpers'
import { type CountryMetricsDto } from '../types/GlobalTypes';
import { useModalStore } from '@/stores/modalStore'
import { CountryDescriptions } from '@/utils/descriptors'
import SvgIcons from '@/components/SvgIcons.vue'

const modalStore = useModalStore()

// Declare compile-time parameter contract boundaries
interface Props {
  country: CountryMetricsDto
  index: number
}

const props = defineProps<Props>()

</script>

<template>

   <article 
    class="country-card"
    :class="{
      'country-card--gold': index === 0,
      'country-card--silver': index === 1,
      'country-card--bronze': index === 2
    }"
  >
    
      <div class="country-card__header">
  
      <h2 class="country-card__title">
     
     <!-- Rank Indicator -->
      <!-- #1: Top border handles the gold visual accent -->
        
      <span v-if="index === 0" class="country-card__badge country-card__badge--gold" title="Rank 1"></span>

      <!-- #2: Silver Badge -->
      <span v-else-if="index === 1" class="country-card__badge country-card__badge--silver"></span>

      <!-- #3: Bronze Badge -->
      <span v-else-if="index === 2" class="country-card__badge country-card__badge--bronze"></span>

      <!-- #4+: Standard Rank Prefix -->
      <span v-else class="country-card__badge country-card__badge--number">{{ index + 1 }}</span>

      <!-- Tag Name Trigger: Opens Details Modal -->

        {{ CountryDescriptions[country.country] }}

      </h2>

        <button 
            type="button"
            class="btn btn--secondary" 
            @click="modalStore.push('CreateTale', 'Create Tale', { country: country.country })"
          >
            OutScribe
          </button>

      </div>

      <!-- Metrics Navigation Links -->
      <div class="country-card__metrics">
        <RouterLink 
          :to="`/tales?country=${country.country}`" 
          class="country-card__metric-link" 
          :class="{ 'disabled': country.talesCounter === 0 }"
          title="Filter Tales"
        >
          <span class="country-card__metric-value">{{ formatCounts(country.talesCounter) }}</span>
          <span class="country-card__metric-label">Tales&rarr;</span>
        </RouterLink>

      </div>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.country-card {
  width: 100%;
  padding: 1.5rem 0;
  border-bottom: 2px dotted var(--border-color);

  &__header{
    display: flex;
    column-gap: 0.25rem;
    align-items:center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  // Metallic badges for ranks 2 and 3
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


  // --- Title & Icon ---
  &__title {
    display: flex;
    align-items:center;
    column-gap: 0.5rem;
    font-size: 1.25rem;

  }

  // --- Metrics ---
  &__metrics {
    display: flex;
    align-items: center;
    column-gap: 0.75rem;
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