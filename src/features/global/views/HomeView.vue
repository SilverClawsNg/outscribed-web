<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { APIError } from '@/api/apiTypes'
import { useHomeStore } from '../stores/HomeStore'; 

// Import your sub-components (We map these next)
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import TaleListComponent from '@/features/tales/components/TaleListComponent.vue'
import TagComponent from '../components/TagComponent.vue'
import { useModalStore } from '@/stores/modalStore'
import CategoryComponent from '../components/CategoryComponent.vue';
import CountryComponent from '../components/CountryComponent.vue';
import WriterComponent from '../components/WriterComponent.vue';

// 1. Setup Services & State
const homepageStore = useHomeStore();
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

function handleCreateDraftClick() {
  modalStore.push('CreateTale', 'Create Tale')
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 1. Fetch from store
  const { success, error } = await homepageStore.loadhomecontents()

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving homepage contents. Refresh page and try again.'
      );
  }
  }

  // No matter the result, stop loading
  isLoading.value = false

  // 3. ⏳ Late-Binding Personal Layer Hydration (Runs seamlessly in background)
  if (success) {
    await homepageStore.hydratePersonals(); 
  }
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

// inside your HomeView.vue
onUnmounted(() => {
  homepageStore.abort();
});

</script>

<template>

<div class="hero-wrapper">

  <div class="hero__pattern" aria-hidden="true"></div>
  <div class="hero__fade hero__fade--bottom" aria-hidden="true"></div>
  <div class="hero__fade hero__fade--top" aria-hidden="true"></div>
 
  <div class="hero-contents">

   <div class="hero">

    <div class="hero__image">
      <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
    </div>
   
    <div class="hero__content">
      <h3 class="hero__eyebrow">
      The Facts, The Fiction, & Everything In-between
      </h3>
      
      <h1 class="hero__title">
       The <span class="text-gradient">reality</span> you know is just one <span class="text-gradient">version</span>.
      </h1>
      
      <h2 class="hero__explainer">
        Blending logic and artistic freedoms, our stories re-imagine the past, 
                  reframe the present, and sculpt futures.
      </h2>

      <div class="hero__cta">
        <RouterLink class="btn btn--primary hero__action" to="/faqs">
          More About OutScribed
        </RouterLink>
        <RouterLink class="btn btn--secondary hero__action" to="/register">
          Become An OutScriber
        </RouterLink>
      </div>
    </div>

  </div>
  
</div>

</div>
<div class="publishing-roadmap">

<div class="publishing-roadmap__contents">
  
  <div class="publishing-roadmap__header">
  <h3 class="publishing-roadmap__title">From Guest to OutScriber</h3>
  <p class="publishing-roadmap__subtitle">
    Become a <span>bona fide</span> OutScriber and start sharing your alternate realities in quick, simple steps.
  </p>
  
</div>

  <div class="publishing-roadmap__grid">
    
    <!-- Step 1: Sign Up (Red / Start) -->
    <div class="publishing-roadmap__card publishing-roadmap__card--step1">
      <span class="publishing-roadmap__number">01</span>
      <div class="publishing-roadmap__content">
        <h4>Sign Up</h4>
        <p>Choose a unique username and secure password to create your writer profile.</p>
      </div>
    </div>

    <!-- Step 2: Verify Account (Orange) -->
    <div class="publishing-roadmap__card publishing-roadmap__card--step2">
      <span class="publishing-roadmap__number">02</span>
      <div class="publishing-roadmap__content">
        <h4>Verify Account</h4>
        <p>Confirm via Google, Microsoft, Apple, or an email security token.</p>
      </div>
    </div>

    <!-- Step 3: Acknowledgement (Yellow) -->
    <div class="publishing-roadmap__card publishing-roadmap__card--step3">
      <span class="publishing-roadmap__number">03</span>
      <div class="publishing-roadmap__content">
        <h4>Acknowledgement</h4>
        <p>Agree to platform publishing guidelines with a single check.</p>
      </div>
    </div>

    <!-- Step 4: Write Story (Purple) -->
    <div class="publishing-roadmap__card publishing-roadmap__card--step4">
      <span class="publishing-roadmap__number">04</span>
      <div class="publishing-roadmap__content">
        <h4>Create A Draft</h4>
        <p>Get started with your story by selecting a category and a befitting title.</p>
      </div>
    </div>

    <!-- Step 5: Metadata (Green Transition) -->
    <div class="publishing-roadmap__card publishing-roadmap__card--step5">
      <span class="publishing-roadmap__number">05</span>
      <div class="publishing-roadmap__content">
        <h4>Build Story</h4>
        <p>Use a rich text editor to write story. Complete basic information, reality check, and optional photo & tags.</p>
      </div>
    </div>

    <!-- Step 6: Publish Story (Emerald Green / Live) -->
    <div class="publishing-roadmap__card publishing-roadmap__card--step6">
      <span class="publishing-roadmap__number">06</span>
      <div class="publishing-roadmap__content">
        <h4>Go Live & Engage</h4>
        <p>Launch your tale to the network and start inviting other to experience your world!</p>
      </div>
    </div>

  </div>

  
<!-- Third Line CTA with Direct Action Button -->
    <div class="publishing-roadmap__footer">
      <span>Ready to start? Click here.</span>
      <button 
        type="button" 
        class="btn btn--secondary"
        @click="handleCreateDraftClick"
      >
        OutScribe
      </button>
    </div>
    
</div>

</div>

   <template v-if="isLoading">

    <div class="loader" role="status" aria-label="Loading homepage">
  <p class="loader__dot"></p>
  
</div>

  </template>

   <template v-else-if="loadingError">

     <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'"
      icon="warning"
      :is-standalone="true">
        <template v-if="loadingError.definition" #actions>
           <button class="btn btn--primary"  @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
    </PageStatusMessage>

  </template>

  <template v-else>
   
       <template v-if="homepageStore.tales && homepageStore.tales.length > 0">

    <header class="page-header">
    <h1>Recent Tales</h1>
      <RouterLink to="/tales" class="btn btn--primary"  title="Recent Tales"><span>View All</span></RouterLink>
    </header>
    
         <div class="container">

            <TaleListComponent 
        v-for="tale in homepageStore.tales" 
        :key="tale.taleId" 
        :tale="tale" 
        :is-homepage="true"
      />

        </div>

  </template>

       <template v-if="homepageStore.categories && homepageStore.categories.length > 0">

        <header class="page-header">
       <h1>Categories Leaderboard</h1>
    </header>

         <div class="container">

           <CategoryComponent 
              v-for="(category, index) in homepageStore.categories" 
              :key="category.category"
              :category="category" 
              :index="index"
            />

        </div>

    
  </template>

       <template v-if="homepageStore.tags && homepageStore.tags.length > 0">

       <header class="page-header">
      <h1>Trending Tags</h1>
      <RouterLink to="/tags" class="btn btn--primary"  title="Recent Tales"><span>View All</span></RouterLink>
    </header>
    
         <div class="container">

            <TagComponent 
              v-for="tag in homepageStore.tags" 
              :key="tag.tagId" 
              :tag="tag" 
            />

        </div>
    
  </template>

         <template v-if="homepageStore.countries && homepageStore.countries.length > 0">

        <header class="page-header">
       <h1>Country Leaderboard</h1>
      <RouterLink to="/country/metrics" class="btn btn--secondary"  title="Countries Leaderboard"><span>View All</span></RouterLink>
    </header>
      
        <div class="container">

           <CountryComponent 
              v-for="(country, index) in homepageStore.countries" 
              :key="country.country"
              :country="country" 
              :index="index"
            />

        </div>
    
  </template>

         <template v-if="homepageStore.prolificWriters && homepageStore.prolificWriters.length > 0">

        <header class="page-header">
       <h1>Writer Leaderboard</h1>
      <RouterLink to="/writers" class="btn btn--primary"  title="Countries Leaderboard"><span>View All</span></RouterLink>
    </header>
      
        <div class="container">

         <template v-for="(writer, index) in homepageStore.prolificWriters" :key="writer?.creator?.accountId || index">
          <WriterComponent 
            v-if="writer?.creator"
            :writer="writer" 
            :index="index"
          />
        </template>

        </div>

    
  </template>

         <template v-if="homepageStore.newWriters && homepageStore.newWriters.length > 0">
        
        <header class="page-header">
       <h1>And Introducing...</h1>
    </header>

        <div class="container">

         <!-- New Writers (Unranked - index omitted) -->
        <template v-for="writer in homepageStore.newWriters" :key="writer?.creator?.accountId">
          <WriterComponent 
            v-if="writer?.creator"
            :writer="writer" 
          />
        </template>

        </div>

        <!--<div class="page-closure"></div>-->
    
  </template>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.hero-wrapper {
  width: 100%;
  height: auto;
  margin-top: -1px;
  position:relative;
  //background-color: @link-color;
  //color:@black-color;
  //border-bottom: 1px solid var(--border-color);
  //background-image: url('@/assets/images/background-image.png');

  background-color: var(--bbackground-color);
  overflow: hidden;
  transition: background-color 0.3s ease;

    display: flex;
    flex-direction:column;
    justify-content:center;

  @media @smallDevice{
    min-height: calc(100svh - 56px);
  }
  
  @media @largeDevice{
    min-height:600px;
  }
   
}

.hero-contents{
  margin: 0 auto;
  position:relative;
  max-width: calc(100% - 20px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero__pattern {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    /* Layer 1: Top wash gradient fading downward from header */
    //linear-gradient(180deg, var(--hero-top-wash) 0%, transparent 60%),

    /* Layer 2: 5-Step Alternating Brand Spectrum Gridlines (48px Spacing) */
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 48px,
      var(--grid-green) 48px,
      var(--grid-green) 49px,

      transparent 49px,
      transparent 97px,
      var(--grid-red) 97px,
      var(--grid-red) 98px,

      transparent 98px,
      transparent 146px,
      var(--grid-purple) 146px,
      var(--grid-purple) 147px,

      transparent 147px,
      transparent 195px,
      var(--grid-orange) 195px,
      var(--grid-orange) 196px,

      transparent 196px,
      transparent 244px,
      var(--grid-yellow) 244px,
      var(--grid-yellow) 245px
    );
}

.hero__fade {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;
  pointer-events: none;
}

.hero__fade--bottom {
  bottom: 0;
  height: 5rem; /* Provides a smooth 100px transition into page content */
  background: var(--hero-fade-bottom);
}

.hero-contents {
  position: relative;
  z-index: 2; /* Sits cleanly above background pattern & bottom fade */
}

.hero__fade--top {
  top: 0;
  height: 5rem;
  background: linear-gradient(
    0deg,
    rgba(23, 21, 25, 0) 0%,
    var(--background-color) 100%
  );
}

.hero__image{
  height: auto;
  display:flex;
  justify-content:center;
  margin-bottom: 1.5rem;

  & img{
    width: 3rem;
    height: auto;
  }
 
}

.hero {
  position: relative;
  height: auto;
  z-index: 1;
  text-align:center;
   width: @min-width;
   max-width: 100%;
  
   @media @phone, @phablet {
         padding: 2rem 0;
    }

     @media @tablet, @largeDevice {
        
         padding: 4rem 0;
    }

  // Element: Logo and line divider header
  &__brand {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 1.5rem;
  }

  &__logo {
    width: 5rem;
    height: auto;
    padding: 0 1rem;
  }

  // Element: Main text wrapper
  &__content {
    width: 100%;
    margin: 0 auto;
  }

   &__title,
   &__eyebrow,
   &__explainer {
    margin-bottom: 1.5rem;
    //text-shadow: 0 0.5px 1px rgba(0, 0, 0, 0.4);

      @media @phone, @phablet {
         text-align:center;
    }

  }

 
  &__eyebrow {
    font-size: 0.94rem;
    font-weight: normal;

    &-break {
       @media @phone, @phablet {
        display: block;
      }
    }
  }

  

  &__title {
    font-size: clamp(2rem, 2.2vw + 1rem, 2.3rem);
    line-height: clamp(2.3rem, 2.2vw + 1rem, 2.6rem);
    font-weight: 700;
    text-transform: uppercase;
    //color: @link-color;
    //text-shadow: 0 0.5px 1px rgba(0, 0, 0, 0.4);
    &-highlight{
      display:block;
    }

    & .text-gradient {
      background: linear-gradient(
        115deg,
        #05a660 0%,   /* Emerald Green */
        #e61d38 25%,  /* Crimson Red */
        #8b1e8b 50%,  /* Violet Purple */
        #f26522 75%,  /* Sunset Orange */
        #ffcc00 100%  /* Warm Yellow */
      );
      
      /* Standard & Webkit clip definitions */
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      
      /* Fallback color for legacy browsers */
      color: #0066cc;
      
      /* Prevents descenders from clipping horizontally */
      display: inline-block;
      padding-right: 0.05em;
    }
  }

  &__explainer {
    font-weight: 500;
    font-size: 1.12rem;
  }

  &__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 0.75rem;
    flex-wrap: wrap; // Allows buttons to wrap cleanly when space runs out
  }

  &__action {
   
    flex: 1 1 auto; // Allows buttons to grow and fill available space evenly
    min-width: 150px; // Guarantees enough horizontal space so text won't wrap inside the button
    white-space: nowrap; // Prevents the text string itself from breaking onto multiple lines
    transition: background-color 0.3s ease;
    border-radius:99999px;
  
  }

}

//Road Map
.publishing-roadmap {
  display: flex;
  flex-direction: column;
  //background-color: var(--light-background-color);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  //border-radius: 12px;
  padding: 2rem 0;
  //margin: 0 auto 2rem auto;
  //max-width: 750px; // Constrained 750px viewing width
  //box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);

  &__contents{
width: @mid-width;
max-width: calc(100% - 20px);
margin: 0 auto;
  }

  @media @largeDevice {
    padding: 2.5rem 2rem;
  }

  &__header {
    text-align: center;
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--text-color);
    margin-bottom: 0.3rem;
  }

  &__subtitle {
    font-size: 0.95rem;
    color: var(--muted-text-color);
    font-style: italic;
    margin-bottom: 1rem;

    & span{
      border-bottom: 1px dotted var(--text-color);
    }
  }

 /* CTA Banner Box with Embedded Button */
  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    

    & span{
        font-style: italic;
    }
  }

  /* 2-Column Grid for Large Devices, Single for Small */
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    @media @largeDevice {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
  }

  /* Borderless Color-Tinted Cards */
  &__card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    /* --- Logo Ribbon Spectrum Background Wash --- */
    &--step1 {
      background-color: fade(@logo-red, 8%);
            border: 1px solid fade(@logo-red, 35%); // Highlight victory state

      .publishing-roadmap__number { background-color: @logo-red; color: @white-color; }
      h4 { color: darken(@logo-red, 10%); }
    }

    &--step2 {
      background-color: fade(@logo-orange, 8%);
            border: 1px solid fade(@logo-orange, 35%); // Highlight victory state

      .publishing-roadmap__number { background-color: @logo-orange; color:@white-color;  }
      h4 { color: darken(@logo-orange, 15%); }
    }

    &--step3 {
      background-color: fade(@logo-yellow, 15%);
            border: 1px solid fade(@logo-yellow, 35%); // Highlight victory state

      .publishing-roadmap__number { background-color: darken(@logo-yellow, 20%); color:@white-color;  }
      h4 { color: darken(@logo-yellow, 10%); }
    }

    &--step4 {
      background-color: fade(@logo-purple, 8%);
            border: 1px solid fade(@logo-purple, 35%); // Highlight victory state

      .publishing-roadmap__number { background-color: @logo-purple; color:@white-color;  }
      h4 { color: @logo-purple; }
    }

    &--step5 {
      background-color: fade(@logo-green, 8%);
            border: 1px solid fade(@logo-green, 35%); // Highlight victory state

      .publishing-roadmap__number { background-color: @logo-green; color:@white-color;  }
      h4 { color: darken(@logo-green, 10%); }
    }

    &--step6 {
      background-color: fade(@link-color, 8%);
      border: 1px solid fade(@link-color, 35%); // Highlight victory state
      .publishing-roadmap__number { background-color: @link-color; color:@white-color;  }
      h4 { color: darken(@link-color, 15%); font-weight: 700; }
    }
  }

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    font-weight: 700;
    font-size: 0.85rem;
    border-radius: 50%;
    font-variant-numeric: tabular-nums;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    h4 {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0;
    }

    p {
      font-size: 0.85rem;
      color: var(--muted-text-color);
      margin: 0;
      line-height: 1.4;
    }
  }
}
</style>
