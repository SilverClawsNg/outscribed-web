<script setup lang="ts">
import { formatCounts } from '@/utils/stringHelpers'
import { useHomeStore } from '../stores/HomeStore'; 
import SvgIcons from '@/components/SvgIcons.vue';

const homepageStore = useHomeStore();

</script>

<template>
    <section
  v-if="homepageStore.tags.length > 0"
  class="trending-strip"
  aria-label="Trending Topics"
>
  <div class="trending-strip__inner">
    <div class="trending-strip__header">
      <SvgIcons name="trending" :size="30" />
      <h2 class="trending-strip__title">Trending today</h2>
    </div>

    <div class="trending-strip__tags">
      <RouterLink
        v-for="tag in homepageStore.tags"
        :key="tag.tagId"
        :to="`/tales?tag=${tag.slug}`"
        class="tag-pill"
      >
        <span class="tag-pill__name">
          <span class="tag-pill__symbol">#</span>{{ tag.name }}
        </span>
        <span class="tag-pill__dot" aria-hidden="true"></span>
        <span class="tag-pill__metric">{{ formatCounts(tag.talesCounter) }}</span>
      </RouterLink>

      <RouterLink to="/tags" class="trending-strip__more">
        Explore all &rarr;
      </RouterLink>
    </div>
  </div>
</section>
    </template>


<style lang="less" scoped>
@import "@/assets/css/variables.less";

.trending-strip {
  width: 100%;
  max-width: @max-width; // 1300px
  margin: 2rem auto 0;
  padding: 0.9rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);

  &__inner {
    display: flex;
    align-items: center;
    gap: 1rem 1.5rem;
    flex-wrap: wrap;
  }

  &__header {
    display: inline-flex;
    align-items: center;
    column-gap: 0.45rem;
    flex-shrink: 0;
    color: var(--heading-text-color);

    svg {
      flex-shrink: 0;
      stroke-width: 1.5;
    }
  }

  &__title {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--heading-text-color);
  }

  &__tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 0.65rem;
    flex: 1 1 auto;
  }

  &__more {
    margin-left: auto;
    font-size: 0.85rem;
    font-weight: 400;
    white-space: nowrap;
    color: var(--heading-text-color);
    text-decoration: underline;
    text-underline-offset: 4px;

    &:hover {
      color: var(--body-text-color);
      text-decoration: none;
    }
  }
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  column-gap: 0.4rem;
  height: 30px;
  padding: 0 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 999999px;
  background-color: transparent;
  font-size: 0.82rem;
  line-height: 1;
  text-decoration: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;

  &__symbol {
    color: var(--muted-text-color);
    margin-right: 1px;
  }

  &__name {
    font-weight: 400;
    color: var(--heading-text-color);
  }

  &__dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: var(--muted-text-color);
  }

  &__metric {
    font-size: 0.78rem;
    color: var(--muted-text-color);
  }

  &:hover {
    border-color: var(--heading-text-color);
  }
}

@media (max-width: 1320px) {
  .trending-strip {
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
  }
}

@media (max-width: 767px) {
  .trending-strip__more {
    margin-left: 0;
  }
}
</style>