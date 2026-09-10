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
 
 <article class="content-x-card">

      <h1 class="content-x-card__title">
        <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h1>
      
      <div class="content-x-card__meta">
        <button class="at" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
          {{ tale.creatorUsername }}
        </button>
          <time>
            {{ toRelativeTime(tale.createdAt) }}
          </time>
        </div>

    <div class="content-x-card__summary">
      <div>
        {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
        <RouterLink :to="`/tale/${tale.slug}`">Continue Reading</RouterLink>
      </div>
    </div>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/content-x-card.less";
</style>