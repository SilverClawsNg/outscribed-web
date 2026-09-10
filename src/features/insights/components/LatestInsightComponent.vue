<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'

import { toRelativeTime } from '@/utils/dateExtensions'
import { type InsightLatestListDto } from '@/features/insights/types/InsightsTypes';

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()

// Declare compile-time parameter contract boundaries
interface Props {
  insight: InsightLatestListDto
}

const props = defineProps<Props>()

</script>

<template>
 
  <article class="content-x-card">

      <h1 class="content-x-card__title">
        <RouterLink :to="`/insight/${insight.slug}`">{{ insight.title }}</RouterLink>
      </h1>
      
      <div class="content-x-card__meta">
        <button class="at" @click="modalStore.push('Profile', 'Profile', insight.creatorId)">
          {{ insight.creatorUsername }}
        </button>
          <time>
            {{ toRelativeTime(insight.createdAt) }}
          </time>
      </div>

    <div class="content-x-card__summary">
      <div>
        {{ insight.summary.length > 500 ? insight.summary.substring(0, 500) + '...' : insight.summary }}
        <RouterLink :to="`/tale/${insight.slug}`">Continue Reading</RouterLink>
      </div>
    </div>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/content-x-card.less";
</style>