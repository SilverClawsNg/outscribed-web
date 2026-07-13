<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'

import { toRelativeTime } from '@/utils/dateExtensions'
import { type SourceContentDto } from '@/features/engagements/types/EngagementTypes'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()

// Declare compile-time parameter contract boundaries
interface Props {
  source: SourceContentDto
}

const props = defineProps<Props>()

</script>

<template>
 
   <article class="content-lists__card">
   
      <h1 class="content-lists__title alt">
        <RouterLink :to="`/${source.content.toLowerCase}/${source.slug}`">{{ source.title }}</RouterLink>
      </h1>

      <div class="content-lists__metadata">
        <button class="at" @click="modalStore.push('Profile', 'Profile', { creatorId: source.creatorId })">
          {{ source.creatorUsername }}
        </button>
        {{ toRelativeTime(source.date) }}
      </div>


    <section class="content-lists__summary">
      <div>
        {{ source.summary.length > 500 ? source.summary.substring(0, 500) + '...' : source.summary }}
        <RouterLink :to="`/insight/${source.slug}`">Continue Reading</RouterLink>
      </div>
    </section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/content-lists.less";
</style>