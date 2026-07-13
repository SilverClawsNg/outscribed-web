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
 
<article class="content-lists__card">

      <h1 class="content-lists__title alt">
        <RouterLink :to="`/insight/${insight.slug}`">{{ insight.title }}</RouterLink>
      </h1>
      
      <section class="content-lists__metadata">
        <button class="at" @click="modalStore.push('Profile', 'Profile', insight.creatorId)">
          {{ insight.creatorUsername }}
        </button>
          <span>
            {{ toRelativeTime(insight.createdAt) }}
          </span>
      </section>

    <section class="content-lists__summary">
      <div>
        {{ insight.summary.length > 500 ? insight.summary.substring(0, 500) + '...' : insight.summary }}
        <RouterLink :to="`/insight/${insight.slug}`">Continue Reading</RouterLink>
      </div>
    </section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/content-lists.less";
</style>