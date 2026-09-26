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
  <article class="tag-card">

   
 <header class="tag-card__header">
 
      <h2 class="tag-card__title">
        <button 
          type="button" 
          class="tag-card__trigger" 
          title="View Tag Details"
          @click="modalStore.push('TagDetail', 'Tag Details', tag.tagId)"
        >
          <span class="tag-card__pre">#</span><span class="tag-card__name">{{ tag.name }}</span>
        </button>
      </h2>

      <time> {{ toShortDate(tag.date) }}</time>

 </header>

      <!-- Metrics Navigation Links -->
      <div class="tag-card__metrics">
        <RouterLink 
          :to="`/tales?tag=${tag.slug}`" 
          class="tag-card__metric-link" 
          title="Filter Tales"
        >
          <span class="tag-card__metric-value">{{ formatCounts(tag.talesCounter) }}</span>
          <span class="tag-card__metric-label">Tales&rarr;</span>
        </RouterLink>

          <span class="divider divider--line"></span>

        <RouterLink 
          :to="`/insights?tag=${tag.slug}`" 
          class="tag-card__metric-link" 
          title="Filter Insights"
        >
          <span class="tag-card__metric-value">{{ formatCounts(tag.insightsCounter) }}</span>
          <span class="tag-card__metric-label">Insights&rarr;</span>
        </RouterLink>
      </div>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/tag-card.less";
</style>