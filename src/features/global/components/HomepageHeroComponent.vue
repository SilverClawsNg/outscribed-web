<script setup lang="ts">
import { formatCounts } from '@/utils/stringHelpers'
import { useLoginHint } from '@/utils/authHelper'
import { RouterLink, useRouter } from 'vue-router'
import { useHomeStore } from '../stores/HomeStore'; 
import { useModalStore } from '@/stores/modalStore'

const isLoggedIn = useLoginHint()
const router = useRouter()
const homepageStore = useHomeStore();
const modalStore = useModalStore()

function handleJoinClick() {
  if (isLoggedIn.value) {
    router.push('/switch');
  } else {
    router.push('/register');
  }
}
</script>
<template>
    
<div class="hero">

  <header class="hero__header">
    <h1 class="hero__title">
      The reality you know is <span class="hero__highlight">just one version.</span>
    </h1>
  </header>

  <div class="hero__contents">

     <div class="hero__left-contents">
      
      <p class="hero__explainer">
        Blending logic and artistic freedoms, our stories re-imagine the past, 
        reframe the present, and sculpt futures.
      </p>
      
      <div class="hero__cta-group">
          <RouterLink class="btn btn--primary" to="/about-us">
          How It Works!
        </RouterLink>
        <button class="btn btn--secondary" @click="modalStore.push('CreateTale', 'Create Tale')">
          Write A Story
        </button>
      </div>
    </div>

       <aside 
      v-if="homepageStore.tags.length > 0" 
      class="hero__trending"
      aria-label="Trending Topics"
    >
      <div class="hero__trending-header">
        <SvgIcons name="trending" :size="30" />
        <h2 class="hero__trending-title">Trending today</h2>
      </div>

      <div class="hero__tags">
        <RouterLink
          v-for="tag in homepageStore.tags" 
          :key="tag.tagId" 
          :to="`/tales?tag=${tag.slug}`" 
          class="tag-pill"
        >
          <span class="tag-pill__name">
            <span class="tag-pill__symbol">#</span>{{ tag.name }}
          </span>
          <span class="divider divider--circle"></span>
          <span class="tag-pill__metric">{{ formatCounts(tag.talesCounter) }}</span>
        </RouterLink>

        <RouterLink to="/tags" class="tag-pill tag-pill--more">
          <span class="tag-pill__name">Explore all &rarr;</span>
        </RouterLink>
      </div>
    </aside>

  </div>

  <!-- 4. FOOTER ANCHOR (Divider + Byline as unified rear unit) -->
  <div class="hero__footer">
    <div class="hero__divider">
      <span class="hero__rule"></span>
      <img src="@/assets/images/icon.png" alt="" aria-hidden="true" />
      <span class="hero__rule"></span>
    </div>
    <h2 class="hero__byline">
        The Facts, The Fiction, <br /> & Everything In-Between
      </h2>
  </div>

</div>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

@gutter: (20 / 1300) * 100%;  // 1.53846% (20px at 1300px)
@left-container: (750 / 1300) * 100%;   // 57.6923% (750px at 1300px)
@right-container: (530 / 1300) * 100%; // 40.7692% (530px at 1300px)

.hero {
  max-width: calc(100% - 20px);
  margin: 0 auto;
  padding: 3.5rem 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;

    // 5 intersecting circles fading cleanly into --bg-page
    background-image:
      // 1. Emerald Green (Top-Left)
      radial-gradient(
        circle 280px at 28% 35%,
        rgba(5, 166, 96, var(--spectrum-alpha)) 0%,
        transparent 50%
      ),
      // 2. Rich Purple (Mid-Left overlap)
      radial-gradient(
        circle 260px at 38% 58%,
        rgba(139, 30, 139, var(--spectrum-alpha)) 0%,
        transparent 50%
      ),
      // 3. Vivid Crimson (Top-Center / Right)
      radial-gradient(
        circle 290px at 54% 32%,
        rgba(230, 29, 56, var(--spectrum-alpha)) 0%,
        transparent 50%
      ),
      // 4. Sunset Orange (Center-Right overlap)
      radial-gradient(
        circle 270px at 66% 52%,
        rgba(242, 101, 34, var(--spectrum-alpha)) 0%,
        transparent 50%
      ),
      // 5. Warm Yellow (Lower-Center bridge)
      radial-gradient(
        circle 250px at 50% 68%,
        rgba(255, 204, 0, calc(var(--spectrum-alpha) * 1.15)) 0%,
        transparent 50%
      );

    // Soft vertical vignette mask so top and bottom edges dissolve completely into the page
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 20%,
      black 80%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 20%,
      black 80%,
      transparent 100%
    );
  }

  // Keep all hero text, titles, and rules crisp above the wash
  > * {
    position: relative;
    z-index: 1;
  }

  
   @media @desktop, @laptop{
    width: @max-width;
  }

   @media @tablet{
    width: @mid-width;
  }

   @media @phablet{
    width: @mod-width;
  }

   @media @phone{
    width: @min-width;
  }

  /* =============================================================
   * HERO HEADER
   * ============================================================= */
    
  &__header{
    width: 100%;
    
  
    @media @phone, @phablet, @tablet{
      margin-bottom: 2.5rem;
    }

     @media @desktop, @laptop {
     margin-bottom: 3.5rem;
    }

  }
  
  &__title {
    letter-spacing: -0.02em;

    @media @phone {
      font-size: 1.85rem;
      line-height: 2.15rem;
      max-width: 80%;
    }

    @media @phablet {
      font-size: 2.35rem;
      line-height: 2.65rem;
      max-width: 80%;
    }

    @media@tablet {
      font-size: 2.65rem;
      line-height: 2.95rem;
    }

    @media @desktop, @laptop {
      font-size: 2.95rem;
      line-height: 3.2rem;
    }
  }

 &__highlight {
  font-weight: 900;
  color: #bc0f82;
  color: #013248;
  color: @link-color;
 //color: #051125;
}

  /* =============================================================
   * HERO CONTENTS
   * ============================================================= */
  
   &__contents{
   display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    gap: @gutter;
    width: 100%;

    @media @phone, @phablet, @tablet{
      flex-direction: column;
    }

  }

  &__left-contents {
    min-width: 0;
    position: relative;

    @media @phone, @phablet, @tablet {
      flex: none;
      margin-bottom: 3rem;
      width: 100%; 
    }
   
     @media @desktop, @laptop {
      flex: 0 0 @left-container; // Exact 750px at 1300px; shrinks proportionally to ~572px at 992px
    }
  
  }

  &__explainer {
    
    margin-bottom: 1.5rem;

     @media @phone {
      font-size: 1.15rem;
       line-height: 1.4;
    }

    @media @phablet {
      font-size: 1.2rem;
       line-height: 1.4;
    }

    @media@tablet {
      font-size: 1.3rem;
       line-height: 1.6;
    }

    @media @desktop, @laptop {
      font-size: 1.15rem;
       line-height: 1.5;
      max-width: 54ch;
    }
  }

  &__cta-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
   
  }

  /* =============================================================
   * RIGHT TRACK (Trending Today Pulse)
   * ============================================================= */
  &__trending {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-color);
    align-items: flex-start;

     @media @phone, @phablet, @tablet {
      width: 100%;
    }

    @media @desktop, @laptop {
      width: @left-container;
    }

    @media (min-width: 992px) {
      align-items: flex-start;
      padding-top: 0;
      padding-left: 1.25rem;
      border-top: none;
      border-left: 1px solid var(--border-color);
    }
  }

  
  &__trending-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    & svg{
      stroke-width: 1.5;
    }
  }

  &__trending-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: capitalize;
   
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    align-items: center;
    justify-content: center;
    justify-content: flex-start;

    @media (min-width: 992px) {
      justify-content: flex-start;
    }
  }
  
.tag-pill {
  display: inline-flex;
  align-items: center;
  column-gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  
  font-size: 0.9rem;
  font-weight: 400;
  border-radius: 6rem;
  height: 2rem;
  text-decoration: none;

  &:hover {
    background-color: var(--surface-background-color);
    border-color: var(--surface-border-color);
  }

  &__name {
    display: inline-flex;
    align-items: center;
  }

  &__symbol {
    font-size: 0.9rem;
    font-weight: normal;
  }

  &__metric {
    font-weight: 700;
  }
  
}

  /* =============================================================
   * REAR FOOTER ANCHOR (Icon divider + Byline acting as one unit)
   * ============================================================= */
  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 2.25rem;
    gap: 0.65rem;

    @media @smallDevice {
      max-width: 750px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  &__divider {
    display: flex;
    align-items: center;
    width: 100%;

    img {
      height: auto;
      margin: 0 0.75rem;
      opacity: 0.85;

      @media @smallDevice {
        width: 2.25rem;
      }
      @media @largeDevice {
        width: 2.75rem;
      }
    }
  }

  &__rule {
    flex-grow: 1;
    height: 1px;
    background-color: var(--border-color);
  }

  &__byline {
    margin: 0;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    
  }
}

</style>