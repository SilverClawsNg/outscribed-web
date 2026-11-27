<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useHomeStore } from '../stores/HomeStore'; 
import { CategoryDescriptions } from '@/utils/descriptors';
import { mediaHelper } from '@/utils/mediaHelper'
import TaleTextComponent from '@/features/tales/components/TaleTextComponent.vue';
import TaleCardComponent from '@/features/tales/components/TaleCardComponent.vue';

const homepageStore = useHomeStore();


// Hot Tales (4 items total)
const focusHotTale = computed(() => homepageStore.hotTales[0] ?? null)        // (1) Top of hot tales
const pillHotTales = computed(() => homepageStore.hotTales.slice(1, 4))       // (2) Remaining 3 hot tales

</script>

<template>

<div class="hot-tales-wrapper">


<section
  v-if="focusHotTale"
  class="hot-tales"
  aria-labelledby="hot-tales-heading"
>
  <header class="hot-tales__header">
    <h2 id="hot-tales-heading" class="hot-tales__title">
      Hot this week
    </h2>
    <RouterLink to="/tales?sort=hot" class="hot-tales__more">
      View all hot tales &rarr;
    </RouterLink>
  </header>

  <!-- 1. FOCUS HOT TALE (Split Dark Panel + Cover Media) -->
  <article class="hot-focus">
    <div class="hot-focus__body">
      <TaleTextComponent :tale="focusHotTale" type="focus" />
    </div>

    <RouterLink
      :to="`/tale/${focusHotTale.slug}`"
      class="hot-focus__media"
      :aria-label="`Read ${focusHotTale.title}`"
    >
     <img 
          v-if="focusHotTale.photo"
          :src="mediaHelper.getUrl(focusHotTale.photo, 'tales', 'full')" 
          :alt="focusHotTale.title"
          loading="lazy"
        />

   
      <div v-else class="hot-focus__fallback" aria-hidden="true">
        <span>{{ CategoryDescriptions[focusHotTale.category] }}</span>
      </div>
    </RouterLink>
  </article>

  <!-- 2. PILL HOT TALES (3-Column Grid) -->
<div v-if="pillHotTales.length" class="tale-grid">
  <TaleCardComponent v-for="tale in pillHotTales" :key="tale.taleId" :tale="tale" />
</div>
</section>

</div>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/tale-card.less";

/* =============================================================
- HOT TALES SECTION (1 Focus Split Banner + 3 Pill Cards)
- ============================================================= */

.hot-tales-wrapper{
    //background-color: var(--surface-background-color);
    width: 100%;
    height: auto;
    padding: 2.5rem 0;

}

.hot-tales {
  width:  @max-width;
  max-width: calc(100% - 20px); // 1300px
  margin: 0 auto;
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
}

// -------------------------------------------------------------
// 1. Focus Hot Tale (Dark Split Feature Card)
// -------------------------------------------------------------
.hot-focus {
  display: grid;
  grid-template-columns: 1fr;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  background-color: #111111; // Crisp broadsheet dark panel on both light & dark themes
background-color: var(--surface-background-color);
background-color: var(--background-color);
  &__body {
    order: 2; // Image on top, text below on mobile
    padding: 1.5rem 1.25rem;
    display: flex;
    align-items: center;
    
  }

  &__media {
    order: 1;
    display: block;
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background-color: #1a1a1a;
    background-color: var(--background-color);
    text-decoration: none;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }

    &:hover img {
      transform: scale(1.02);
    }
  }

  &__fallback {
    width: 100%;
    height: 100%;
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: radial-gradient(circle at 30% 30%, #1f3250 0%, #0b1320 100%);
    color: #9dd2ff;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: center;
  }
}

// -------------------------------------------------------------
// 2. Pill Hot Tales (3-Column Grid)
// -------------------------------------------------------------
.hot-pills {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  align-items: stretch;
}

.hot-pill-card {
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

// Container margin below 1320px
@media (max-width: 1320px) {
  .hot-tales {
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
  }
}

// Tablet & up (>= 680px): 3 pill cards sit side-by-side
@media (min-width: 680px) {
  .hot-pills {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }
}

// Desktop (>= 900px): Focus card splits 50/50 horizontally (Text left, Media right)
@media (min-width: 900px) {
  .hot-focus {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: 390px;

    &__body {
      order: 1;
      padding: 2.5rem 2.75rem;
    }

    &__media {
      order: 2;
      aspect-ratio: auto;
      height: 100%;
    }
  }
}
</style>