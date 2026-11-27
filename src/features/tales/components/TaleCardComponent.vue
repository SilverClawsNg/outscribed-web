<script setup lang="ts">
import { CategoryDescriptions } from '@/utils/descriptors.ts'
import { mediaHelper } from '@/utils/mediaHelper'
import { type TaleListDto } from '../types/TalesTypes';
import TaleTextComponent from './TaleTextComponent.vue';

defineProps<{
  tale: TaleListDto
}>()
</script>

<template>
  <article class="tale-card">
    <RouterLink
      :to="`/tale/${tale.slug}`"
      class="tale-card__media"
      :aria-label="`Read ${tale.title}`"
    >
         <img 
          v-if="tale.photo"
          :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" 
          :alt="tale.title"
          loading="lazy"
        />
      <div v-else class="tale-card__fallback" aria-hidden="true">
        <span>{{ CategoryDescriptions[tale.category] }}</span>
      </div>
    </RouterLink>

    <div class="tale-card__body">
      <TaleTextComponent :tale="tale" type="pill" />
    </div>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.tale-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--background-color);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--heading-text-color);
  }

  &__media {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--surface-background-color, #f4f4f5);
    text-decoration: none;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.03);
    }
  }

  &__fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: linear-gradient(135deg, #10203a 0%, #1f3250 100%);
    color: #f5f5f5;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
  }

  &__body {
    flex: 1 1 auto;
    padding: 1.15rem 1.2rem 1.25rem;
    display: flex;
    flex-direction: column;
  }
}

</style>