<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import { toRelativeTime } from '@/utils/dateExtensions'
import { type SourceTaleDto } from '../types/TalesTypes';

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()

// Declare compile-time parameter contract boundaries
interface Props {
  tale: SourceTaleDto
}

const props = defineProps<Props>()

</script>

<template>
 
<article class="content-lists__card">

      <h1 class="content-lists__title alt">
        <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h1>
      
      <section class="content-lists__metadata">
        <button class="at" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
          {{ tale.creatorUsername }}
        </button>
          <span>
            {{ toRelativeTime(tale.createdAt) }}
          </span>
      </section>

    <section class="content-lists__summary">
      <div>
        {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
        <RouterLink :to="`/insight/${tale.slug}`">Continue Reading</RouterLink>
      </div>
    </section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/content-lists.less";
</style>