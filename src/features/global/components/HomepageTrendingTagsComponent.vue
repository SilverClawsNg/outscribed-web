<script setup lang="ts">
import { formatCounts } from '@/utils/stringHelpers'
import { useHomeStore } from '../stores/HomeStore'; 
import SvgIcons from '@/components/SvgIcons.vue';

const homepageStore = useHomeStore();

</script>

<template>
  <section
  v-if="homepageStore.tags.length > 0"
  class="trending-feature"
  aria-labelledby="trending-feature-heading"
>
  <!-- Left Column: Centered Editorial Anchor -->
    <div class="trending-feature__lead">
      <div class="trending-feature__lead-content">
        <span class="trending-feature__eyebrow">
          <SvgIcons name="trending" :size="18" />
          <span>Live Pulse</span>
        </span>

        <h2 id="trending-feature-heading" class="trending-feature__title">
          Trending<br />This Week
        </h2>

        <p class="trending-feature__subtitle">
          For every breaking news, there is an OutScribed story.
        </p>
      </div>
    </div>

    <!-- Right Column: Tag Cluster + Prominent CTA -->
    <div class="trending-feature__body">
      <div class="trending-feature__tags">
        <RouterLink
          v-for="tag in homepageStore.tags"
          :key="tag.tagId"
          :to="`/tales?tag=${tag.slug}`"
          class="trending-tag"
        >
          <span class="trending-tag__name">
            <span class="trending-tag__symbol">#</span>{{ tag.name }}
          </span>
          <span class="trending-tag__dot" aria-hidden="true"></span>
          <span class="trending-tag__metric">{{ formatCounts(tag.talesCounter) }}</span>
        </RouterLink>
      </div>

      <div class="trending-feature__actions">
        <RouterLink to="/tags" class="trending-feature__cta">
          <span>Explore all topics</span>
          <span aria-hidden="true">&rarr;</span>
        </RouterLink>
      </div>
    </div>
</section>
    </template>


<style lang="less" scoped>
@import "@/assets/css/variables.less";
/* =============================================================
- TRENDING FEATURE INTERLUDE (Between Hot & Recent Tales)
- ============================================================= */

.trending-feature {
  max-width: calc(100% - 20px);
  
  margin: 2.5rem auto;
  border-radius: 6px;
  border: 1px solid #051125;
  overflow: hidden;
  position: relative;
  color: #f5f5f5;
  background:
    radial-gradient(circle at 18% 22%, rgba(157, 210, 255, 0.14) 0%, transparent 48%),
    linear-gradient(135deg, #033750 0%, #051125 65%, #08182e 100%);
  display: flex;

  
    @media @smallDevice{
flex-direction: column;
width: @min-width; // 1300px
    }

      @media @largeDevice{
width: @mid-width; // 1300px
    }

  // -----------------------------------------------------------
  // Left Column: Centered Title & Tagline + Vertical Divider
  // -----------------------------------------------------------
  &__lead {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 2rem 2.25rem;
   

    @media @smallDevice{
border-bottom: 1px solid rgba(157, 210, 255, 0.18);
 width: 100%;
    }

     @media @largeDevice{
border-right: 1px solid rgba(157, 210, 255, 0.2);
 width: 50%;
    }
    
  }

  &__lead-content {
    max-width: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.3rem 0.75rem;
    border: 1px solid rgba(157, 210, 255, 0.28);
    border-radius: 99999px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9dd2ff;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.4rem, 4.5vw, 3.6rem);
    font-weight: 900;
    line-height: 1.03;
    letter-spacing: -0.025em;
    color: #ffffff;
  }

  &__subtitle {
    margin: 0;
    font-size: clamp(1rem, 1.35vw, 1.15rem);
    font-weight: 400;
    line-height: 1.55;
    color: #d4d4d4;
  }

  // -----------------------------------------------------------
  // Right Column: Tag Pills + Prominent Gold CTA
  // -----------------------------------------------------------
  &__body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    padding: 2.25rem 1.75rem 3rem;

      @media @smallDevice{
 width: 100%;
    }

     @media @largeDevice{
 width: 50%;
    }
  }

  &__tags {
    display: flex;
    flex-direction: column;
    width:auto;
   
    gap: 0.75rem;

     @media @smallDevice{
 align-items: center;
    }

     @media @largeDevice{
  align-items: flex-start;
    }
  }

  &__actions {
    display: flex;
    align-items: center;

     @media @smallDevice{
 justify-content: center;
    }
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.85rem 1.65rem;
    border-radius: 99999px;
    background-color: #d99b00;
    color: #111111;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    text-decoration: none;
    transition: transform 0.15s ease, filter 0.15s ease;

    &:hover {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }
  }
}

// -------------------------------------------------------------
// Elevated Tag Pills for Dark Midnight Surface
// -------------------------------------------------------------
.trending-tag {
  display: inline-flex;
  align-items: center;
  width: auto;
  gap: 0.5rem;
  padding: 0.6rem 1.05rem;
  border-radius: 99999px;
  border: 1px solid rgba(157, 210, 255, 0.24);
  background-color: rgba(255, 255, 255, 0.06);
  font-size: 0.92rem;
  line-height: 1.2;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;

  &__symbol {
    color: #9dd2ff;
    font-weight: 700;
  }

  &__name {
    color: #ffffff;
    font-weight: 400;
  }

  &__dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);
  }

  &__metric {
    font-size: 0.82rem;
    color: #b4c6d8;
  }

  &:hover {
    background-color: rgba(157, 210, 255, 0.14);
    border-color: #9dd2ff;
    transform: translateY(-1px);
  }
}

</style>