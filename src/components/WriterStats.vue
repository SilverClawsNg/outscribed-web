<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { formatCounts } from '@/utils/stringHelpers'

interface WriterStatsProps {
  username: string
  talesCount: number
  insightsCount: number
  commentsCount: number
  hasMargin?: boolean | null

}

defineProps<WriterStatsProps>()
</script>

<template>
  <div class="writer-stats":class="{ 'writer-stats--margined': hasMargin }">
    <RouterLink 
      :to="`/tales?username=${username}`" 
      class="btn secondary writer-stats__link" 
      title="Tales"
    >
      <span class="writer-stats__value">{{ formatCounts(talesCount) }}</span> 
      <span class="writer-stats__label">Tales</span>
    </RouterLink>

    <RouterLink 
      :to="`/insights?username=${username}`" 
      class="btn secondary writer-stats__link" 
      title="Insights"
    >
      <span class="writer-stats__value">{{ formatCounts(insightsCount) }}</span> 
      <span class="writer-stats__label">Insights</span>
    </RouterLink>

    <RouterLink 
      :to="`/comments?username=${username}`" 
      class="btn secondary writer-stats__link" 
      title="Comments"
    >
      <span class="writer-stats__value">{{ formatCounts(commentsCount || 0) }}</span> 
      <span class="writer-stats__label">Comments</span>
    </RouterLink>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/writer-stats.less";
</style>