<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import { toRelativeTime } from '@/utils/dateExtensions'

const modalStore = useModalStore()

const props = withDefaults(
  defineProps<{
    title: string
    slug: string
    creatorId: string
    creatorUsername: string
    createdAt: string
    contentType: 'tale' | 'insight' | string
    summary: string
    isBordered?: boolean
  }>(),
  {
    isBordered: false
  }
)
</script>

<template>

  <article class="content-x-card" :class="{ 'content-x-card--bordered': isBordered }">
    <h1 class="content-x-card__title">
      <RouterLink :to="`/${contentType}/${slug}`">
        {{ title }}
      </RouterLink>
    </h1>

    <div class="content-x-card__meta">
      <button 
        type="button" 
        class="content-x-card__author-btn" 
        @click="modalStore.push('Profile', 'Profile', creatorId)"
      >
        @{{ creatorUsername }}
      </button>
      <time class="content-x-card__date">
        {{ toRelativeTime(createdAt) }}
      </time>
    </div>

    <p class="content-x-card__summary">
      {{ summary.length > 500 ? summary.substring(0, 500) + '...' : summary }}
    </p>

    <footer class="content-x-card__actions">
      <RouterLink :to="`/${contentType}/${slug}`" class="content-x-card__read-link">
        Read &rarr;
      </RouterLink>
    </footer>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/content-x-card.less";
</style>