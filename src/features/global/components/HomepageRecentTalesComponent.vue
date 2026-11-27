<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useHomeStore } from '../stores/HomeStore'; 
import { CategoryDescriptions } from '@/utils/descriptors';
import { mediaHelper } from '@/utils/mediaHelper'
import TaleTextComponent from '@/features/tales/components/TaleTextComponent.vue';
import TaleCardComponent from '@/features/tales/components/TaleCardComponent.vue';

const homepageStore = useHomeStore();


// Hot Tales (4 items total)
const recentTales = computed(() => homepageStore.recentTales ?? null)        // (1) Top of hot tales

</script>

<template>

<div class="hot-tales-wrapper">

<section
  v-if="recentTales.length"
  class="recent-tales"
  aria-labelledby="recent-tales-heading"
>
  <header class="recent-tales__header">
    <h2 id="recent-tales-heading" class="recent-tales__title">
      Recent tales
    </h2>
    <RouterLink to="/tales?sort=recent" class="recent-tales__more">
      View all recent tales &rarr;
    </RouterLink>
  </header>

 <div v-if="recentTales.length" class="tale-grid">
  <TaleCardComponent v-for="tale in recentTales" :key="tale.taleId" :tale="tale" />
</div>
</section>
</div>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/tale-card.less";

/* =============================================================
- RECENT TALES SECTION (6 Pill Cards in a 3x2 Desktop Grid)
- ============================================================= */

.recent-tales {
  width: 100%;
  max-width: @max-width; // 1300px
  margin: 3rem auto 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border-color);
  }

  &__title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--heading-text-color);
  }

  &__more {
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

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    align-items: stretch;
  }
}

@media (max-width: 1320px) {
  .recent-tales {
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
  }
}

@media (min-width: 600px) {
  .recent-tales__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 992px) {
  .recent-tales__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.35rem;
  }
}
</style>