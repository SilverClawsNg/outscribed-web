<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { APIError } from '@/api/apiTypes'
import { useHomeStore } from '../stores/HomeStore'; 
import { type TaleListDto } from '@/features/tales/types/TalesTypes';
import { useRouter, useRoute } from 'vue-router'


// Import your sub-components (We map these next)
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import TaleListComponent from '@/features/tales/components/TaleListComponent.vue'
import TagComponent from '../components/TagComponent.vue'
import { useModalStore } from '@/stores/modalStore'
import CategoryComponent from '../components/CategoryComponent.vue';
import CountryComponent from '../components/CountryComponent.vue';
import WriterComponent from '../components/WriterComponent.vue';
import { mediaHelper } from '@/utils/mediaHelper'
import { CategoryDescriptions, CountryDescriptions, CategorySummaries } from '@/utils/descriptors'
import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import SvgIcons from '@/components/SvgIcons.vue';
import { useLoginHint } from '@/utils/authHelper'


// 1. Setup Services & State
const homepageStore = useHomeStore();
const modalStore = useModalStore()
const engage = useEngagement()
const router = useRouter()
const isLoggedIn = useLoginHint()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

const isRecent = ref(false)


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

// 🎯 1. FOCUS TALE: Takes the very first tale in the collection
const focusTale = computed<TaleListDto | null | undefined>(() => {
  return homepageStore.tales.length > 0 ? homepageStore.tales[0] : null;
});


// 🎯 2. PILL DISPLAY TALES: Slices the rest of the array (from index 1 onward)
const pillTales = computed<TaleListDto[]>(() => {
  return homepageStore.tales.length > 1 ? homepageStore.tales.slice(1) : [];
});

function handleJoinClick() {
  if (isLoggedIn.value) {
    // Option A: Direct them to a clear session transition/logout page
    router.push('/switch');
  } else {
    // Standard guest flow
    router.push('/register');
  }
}

</script>

<template>

<div class="hero-wrapper">
 
       <div class="hero">
     
      <h1 class="hero__title">
       The reality you know is just one version.
      </h1>
      
      <h2 class="hero__explainer">
        Blending logic and artistic freedoms, our stories re-imagine the past, 
        reframe the present, and sculpt futures.
      </h2>

      <div class="hero__cta">
        <RouterLink class="hero__cta-action hero__cta-action--faq" to="/faqs">
          About Us
        </RouterLink>
          <button class="hero__cta-action hero__cta-action--join" @click="handleJoinClick">
          Join
          </button>

      </div>

    </div>
</div>

<div class="trending-container">
  
 <div class="trending-container-title">
  <SvgIcons name="trending" :size="80" />
 <h2 class="trending__title">Trending On OutScribed </h2>
 </div>

 <div class="tag-group">
  
<RouterLink
 :to="`/tales?tag=${tag.slug}`" 
 class="tag-link" 
  v-for="tag in homepageStore.tags" 
              :key="tag.tagId" 
              :tag="tag">

<span class="tag-link__name"><span class="tag-link__name--pre">#</span>{{ tag.name }}</span>
<span class="divider divider--circle"></span>
<span class="tag-link__metric-value">{{ formatCounts(tag.talesCounter) }}</span>
</RouterLink>

<RouterLink
 to="/tags" 
 class="tag-link">

<span class="tag-link__name">More...</span>

</RouterLink>

 </div>
</div>

<div class="main-contents">

<div class="tale-contents">

  <header class="page-header">
    <h1>Recent Tales</h1>
      <RouterLink to="/tales" class="btn btn--primary"  title="Recent Tales"><span>View All</span></RouterLink>
    </header>

<section class="focus-tale-container">
  <article class="focus-tale-wrapper" v-if="focusTale">
    
    <!-- Text Wrapper -->
    <div class="focus-text-wrapper">
        <div class="content-card">
       
      <!-- Title -->
      <h2 class="content-card__title content-card__title--large">
        <RouterLink :to="`/tale/${focusTale.slug}`">{{ focusTale.title }}</RouterLink>
      </h2>
 
      <!-- Summary -->
      <p class="content-card__summary content-card__summary--large">
        {{ focusTale.summary.length > 500 ? focusTale.summary.substring(0, 500) + '...' : focusTale.summary }}
      </p>

      <div class="content-card__meta">
        <button class="at" @click="modalStore.push('Profile', 'Profile', focusTale.creatorId)">
          {{ focusTale.creatorUsername }}
        </button>
        <span class="divider divider--circle"></span>
        <time class="content-card__date">{{ toRelativeTime(focusTale.createdAt) }}</time>
        <span class="divider divider--circle"></span>
        <span>{{ focusTale.readingTime }} Min Read</span>
      </div>
      
    <!-- Actions Footer -->
    <footer class="content-card__footer">
     
      <button 
        class="content-card__save-btn"
        @click="engage.favorite(focusTale.engagement)"
        :title="focusTale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
      >
        <SvgIcons name="bookmark" /> 
        <span>Add to Favorites</span>
      </button>

       <RouterLink class="btn btn--secondary"  :to="`/tale/${focusTale.slug}`">View Tale</RouterLink>
      
    </footer>
        
      </div>
    </div>

    <!-- Image Wrapper -->
    <div class="focus-image-wrapper">
        <img 
            :src="mediaHelper.getUrl(focusTale.photo, 'tales', 'full') || undefined" 
            :alt="focusTale.title" 
            class="content-card__image"
          />
    </div>

  </article>
</section>

    <div class="pill-tales-grid">
      <article 
        v-for="tale in pillTales" 
        :key="tale.taleId" 
        class="pill-card"
      >
       <div class="pill-wrapper">
         <div class="pill-image-wrap">
          <img 
            :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb') || undefined" 
            :alt="tale.title" 
            class="content-card__image"
          />
        </div>
        <div class="pill-body">
          <div class="content-card">
      
      <!-- Title -->
      <h2 class="content-card__title content-card__title--small">
        <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h2>
 
      <!-- Summary -->
      <p class="content-card__summary content-card__summary--small">
        {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
      </p>

      <div class="content-card__meta">
        <button class="at" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
          {{ tale.creatorUsername }}
        </button>
        <span class="divider divider--circle"></span>
        <time class="content-card__date">{{ toRelativeTime(tale.createdAt) }}</time>
        <span class="divider divider--circle"></span>
        <span>{{ tale.readingTime }} Min Read</span>
      </div>
      
    <!-- Actions Footer -->
    <footer class="content-card__footer">
       
      <button 
        class="content-card__save-btn"
        @click="engage.favorite(tale.engagement)"
        :title="tale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
      >
        <SvgIcons name="bookmark" /> 
        <span>Add to Favorites</span>
      </button>

      <RouterLink class="btn btn--secondary"  :to="`/tale/${tale.slug}`">View Tale</RouterLink>
     
    </footer>
        
      </div>
        </div>
       </div>
      </article>
    </div>

</div>

<aside class="sidebar">

<div class="sidebar-block">
  <header class="block-header">Top Categories</header>

  <div class="block-contents">

  <article 
    v-for="category in homepageStore.categories" 
        :key="category.category" 
    class="block-card"
  >

 <h3 class="block-card__title">
   <span class="hash">#</span>{{ CategoryDescriptions[category.category] }}
  </h3>

    <div class="block-card__actions">
        <RouterLink 
          :to="`/tales?category=${category.category}`" 
          class="block-card__metric-link" 
          :class="{ 'disabled': category.talesCounter === 0 }"
          title="Filter Tales"
        >
          <span class="block-card__metric-value">{{ formatCounts(category.talesCounter) }}</span>
          <span class="block-card__metric-label">Tales&rarr;</span>
        </RouterLink>

           <button 
              type="button" 
              class="btn btn--primary btn--is-outscribe"
              @click="modalStore.push('CreateTale', 'Create Tale', { category: category.category })"
              title="OutScribe a new tale"
            >
            OutScribe
            </button>

    </div>

  </article>
  
</div>
 
<footer class="block-footer">
  <button 
            type="button"
          >
            See All Categories
  </button>
</footer>

</div>

<div class="sidebar-block">
  <header class="block-header">Top Countries</header>

 <div class="block-contents">
  
  <article 
    v-for="country in homepageStore.countries" 
        :key="country.country" 
    class="block-card"
  >

 <h3 class="block-card__title">
    <span class="hash">#</span>{{ CountryDescriptions[country.country] }}
  </h3>

    <div class="block-card__actions">
    
          
    <RouterLink 
          :to="`/tales?country=${country.country}`" 
          class="block-card__metric-link" 
          :class="{ 'disabled': country.talesCounter === 0 }"
          title="Filter Tales"
        >
          <span class="block-card__metric-value">{{ formatCounts(country.talesCounter) }}</span>
          <span class="block-card__metric-label">Tales&rarr;</span>
        </RouterLink>
      
   <button 
            type="button"
            class="btn btn--primary btn--is-outscribe" 
            @click="modalStore.push('CreateTale', 'Create Tale', { country: country.country })"
          >
            OutScribe
          </button>

    </div>

  </article>

</div>

  
<footer class="block-footer">
  <button 
            type="button"
          >
            See All Countries
          </button>
</footer>
 
</div>

<div class="sidebar-block">
   <header class="block-header block-header--writers">
    Writers
  
    <div class="block-header-selector">
      <button :class="{ 'active': isRecent }" @click="isRecent = true">Recent</button>
       <button :class="{ 'active': !isRecent }" @click="isRecent = false">Popular</button>
    </div>
  
  </header>

  <div class="block-contents">

    <template v-if="isRecent">

  <article 
    v-for="writer in homepageStore.newWriters" 
       :key="writer.creator.accountId" 
  :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
  :class="{ 'is-disabled': getEngagementMetadata(writer.creator.engagement).isFavoriteDisabled }"
  @click="!getEngagementMetadata(writer.creator.engagement).isFavoriteDisabled && engage.favorite(writer.creator.engagement)"
    class="block-card"
  >

 <h3 class="block-card__title at">
    {{ writer.creator.username }}
  </h3>

    <div class="block-card__actions">
       <RouterLink 
          :to="`/tales?username=${writer.creator.username}`" 
          class="block-card__metric-link" 
          :class="{ 'disabled': writer.creator.talesCount === 0 }"
          title="Filter Tales"
        >
          <span class="block-card__metric-value">{{ formatCounts(writer.creator.talesCount) }}</span>
          <span class="block-card__metric-label">Tales&rarr;</span>
        </RouterLink>
        <button 
        type="button" 
        class="btn btn--primary btn--is-outscribe"
        :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
        @click="engage.favorite(writer.creator.engagement)"
      >
       {{ getEngagementMetadata(writer.creator.engagement).favoriteAltText }}
      </button>

    </div>

  </article>
  
    </template>

    <template v-else>

 <article 
  v-for="writer in homepageStore.prolificWriters" 
  :key="writer.creator.accountId" 
  :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
  :class="{ 'is-disabled': getEngagementMetadata(writer.creator.engagement).isFavoriteDisabled }"
  @click="!getEngagementMetadata(writer.creator.engagement).isFavoriteDisabled && engage.favorite(writer.creator.engagement)"
  class="block-card"
>

 <h3 class="block-card__title at">
    {{ writer.creator.username }}
  </h3>

    <div class="block-card__actions">
       <RouterLink 
          :to="`/tales?username=${writer.creator.username}`" 
          class="block-card__metric-link" 
          :class="{ 'disabled': writer.creator.talesCount === 0 }"
          title="Filter Tales"
        >
          <span class="block-card__metric-value">{{ formatCounts(writer.creator.talesCount) }}</span>
          <span class="block-card__metric-label">Tales&rarr;</span>
        </RouterLink>
        <button 
        type="button" 
        class="btn btn--primary"
        :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
        @click="engage.favorite(writer.creator.engagement)"
      >
        {{ getEngagementMetadata(writer.creator.engagement).favoriteAltText }}
      </button>
   
    </div>

  </article>
  
    </template>


</div>
 
<footer class="block-footer">
  <button 
            type="button"
          >
            See All Writers
          </button>
</footer>
</div>

</aside>

</div>

<div class="publishing-roadmap">

<div class="publishing-roadmap__contents">
  
  <div class="publishing-roadmap__header">
  <h3 class="publishing-roadmap__title">From Guest to OutScriber</h3>
  <p class="publishing-roadmap__subtitle">
    Start   <button type="button" @click="handleCreateDraftClick">OutScribing</button> in quick, simple steps.
  </p>
  
</div>

  <div class="publishing-roadmap__grid">
    
    <!-- Step 1: Sign Up (Red / Start) -->
    <div class="publishing-roadmap__card publishing-roadmap__card--step1">
      <span class="publishing-roadmap__number">01</span>
      <div class="publishing-roadmap__content">
        <h4>Sign Up</h4>
        <p>Easily verify your identity via Google, Microsoft, Apple, or an email security token.</p>
      </div>
    </div>

    <!-- Step 2: Verify Account (Orange) -->
    <div class="publishing-roadmap__card publishing-roadmap__card--step2">
      <span class="publishing-roadmap__number">02</span>
      <div class="publishing-roadmap__content">
        <h4>Choose Handle</h4>
        <p>Choose your unique OutScribed username and secure password to access your account.</p>
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
        <p>Launch your tale to the network and start inviting others to experience your world!</p>
      </div>
    </div>

  </div>

  
<!-- Third Line CTA with Direct Action Button -->
    <div class="publishing-roadmap__footer">
      <span>Ready?</span>
      <button 
        type="button" 
        class="btn btn--secondary btn--prominent"
        @click="handleCreateDraftClick"
      >
        Start here
      </button>
    </div>
    
</div>

</div>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.hero-wrapper {
  width: 100%;
  height: auto;
  position:relative;
  justify-content:center;
  display: flex;
  align-items: center;
  margin-top: -1px;
  background-color: @link-color;
  padding: 1rem;
  margin-bottom: 1rem;
   min-height: 400px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 85%;
    height: 85%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(
      circle, 
      rgba(119, 113, 214, 0.5) 0%, 
      rgba(54, 46, 189, 0.5) 45%, 
      rgba(28, 20, 167, 0) 75%
    );
    // Tighter blur for small screens so the light core stays visible
    filter: blur(40px);
    will-change: transform, filter;

    @media (min-width: 768px) {
      width: 70%;
      height: 70%;
      filter: blur(70px); // Softens on larger desktop displays
    }
  }

}

.hero {
  position: relative;
  height: auto;
  z-index: 1;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align:center;
  
   max-width: 100%;
   color: @white-color;

   
    @media @smallDevice{
      width: 500px;
    }

    @media @largeDevice{
      width: 550px;
    }
 
  
   @media @smallDevice {
         padding: 2rem 0;
    }

     @media  @largeDevice {
        
         padding: 2rem 0;
    }

  // Element: Logo and line divider header
  &__brand {
    display: flex;
    align-items: center;
    justify-content: flex-start;
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
    margin-bottom: 0.75rem;
    //text-shadow: 0 0.5px 1px rgba(0, 0, 0, 0.4);
 text-align:center;
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
   
    font-weight: 900;
    text-transform: uppercase;
  border-top: 2px solid @white-color;
      border-bottom: 2px solid @white-color;
    margin: 1rem 0;
    padding: 1rem 0;

     @media @phone{
      font-size: 1.8rem;
      line-height: 2rem;
    }

     @media @phablet{
      font-size: 2.2rem;
      line-height: 2.4rem;
    }

    @media @largeDevice{
      font-size: 2.8rem;
      line-height: 3rem;
    }

    //color: @link-color;
    //text-shadow: 0 0.5px 1px rgba(0, 0, 0, 0.4);
    &-highlight{
      display:block;
    }

  }

  &__explainer {
    font-weight: 500;
    font-size: 1.12rem;
      
  }

  &__cta {
    display: flex;
    justify-content: center;
    column-gap: 0.5rem;
    width: auto;
  }

  &__cta-action {
   
   height: 3rem;
   display: flex;
   align-items:center;
   
   padding: 0 1rem;
   border-radius: 6px;
font-weight: 900;
   text-transform: uppercase;
font-size: clamp(1.1rem, 1.2vw + 1rem, 1.4rem);

   &--faq{
background-color:@white-color;
   color:@logo-red;
   &:hover{
    background-color:@logo-red;
   color:@white-color;
   }
   }

   
   &--join{
    
background-color:@logo-red;
   color:@white-color;
   
   
   &:hover{
    background-color: @white-color;
    color:@logo-red;
    
   }
   }
  
  }

}

.publishing-roadmap {
  display: flex;
  flex-direction: column;
  //background-color: var(--light-background-color);
  //border-top: 1px solid var(--border-color);
  //border-bottom: 1px solid var(--border-color);
  //border-radius: 12px;
  padding: 2rem 0;
  //margin: 0 auto 2rem auto;
  //max-width: 750px; // Constrained 750px viewing width
  //box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);

  &__contents{
width: @max-width;
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
    //text-transform: uppercase;
  }

  &__subtitle {
    font-size: 0.95rem;
    color: var(--text-color);
    font-style: italic;
    margin-bottom: 1rem;

    & button{
      border-bottom: 1px dotted var(--text-color);

      &:hover{
        border-bottom: none;
      }
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
     gap: 0.5rem;

     @media @smallDevice {
     grid-template-columns: 1fr;
    }

     @media @tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @media @laptop {
      grid-template-columns: repeat(3, 1fr);
    }

     @media @desktop {
      grid-template-columns: repeat(3, 1fr);
     
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

.content-card {
  width: 100%;
  height: auto;
  //padding: 1.5rem 0;
  
  &__media-link {
   display: block;
   width: 100%;
    height: 250px;
    margin-bottom: 1rem;
    background-color: var(--light-background-color);
    overflow: hidden;
    border-radius: 4px;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }
  
  &__meta{
    display: flex;
    align-items: center;
    //justify-content:center;
    column-gap: 0.5rem;
    z-index: 10;
    margin-bottom: 1rem;
    }

  // --- Card Content Body ---
  &__body {
    display: flex;
    flex-direction: column;
  }

    &__title {
      //text-align: center;
     
     
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
      font-weight:normal;

      @media @smallDevice{
        &--small {
              font-size: clamp(1.4rem, 5vw, 1.8rem);
          line-height: 1.2;
        }
      }

        @media @largeDevice{
        &--small {
                font-size: clamp(1.3rem, 5vw, 1.6rem);
                line-height: 1.1;
        }
      }

       &--large {
         font-size: clamp(1.4rem, 5vw, 1.8rem);
          line-height: 1.2;
      }

     
    }
     
    &__summary {
      
      margin-bottom: 1rem;
      //text-align: center;
      color: var(--muted-text-color);

        @media @smallDevice{
        &--small {
          font-size: clamp(0.95rem, 5vw, 1.1rem);
         line-height: 1.4;
        }
      }

        @media @largeDevice{
        &--small {
        font-size: clamp(0.9rem, 5vw, 1rem);
         line-height: 1.2;  
          font-size: clamp(0.95rem, 5vw, 1.1rem);
         line-height: 1.4;
      }
      }

        &--large {
        font-size: clamp(0.95rem, 5vw, 1.1rem);
         line-height: 1.4;
      }

    
    }


  // --- Metrics ---
  &__stats {
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    //justify-content:center;
    gap: 0.25rem 0.75rem;
    //font-size: 0.9rem;
    
  }

  &__stat {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;

    span {
      font-weight: 600;
    }
  }


&__taxonomy {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    //justify-content:center;
    margin-bottom: 1rem;
}
       
  &__taxonomy-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    background-color: var(--light-background-color);
    border: 1px solid var(--border-color);
    color: var(--muted-text-color);
    //color:@link-color;
    border-radius: 99999px;
    font-size: 0.9rem;
    font-weight: 600;

     &:hover {
          background-color: var(--light-background-color);
        }
      }

  // --- Footer Actions ---
  &__footer {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    justify-content:space-between;
  }

  &__save-btn {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
    height: 40px;
  }
}

.main-contents {
  width: @max-width;
  max-width: calc(100% - 20px);
  margin: 2rem auto;

  @media @smallDevice{
    
  }

  @media @largeDevice{
    display: flex;
  }

}

.tale-contents {
  
  @media @smallDevice{
   width: 100%;
  }

  @media @tablet{
     border-right: 1px solid var(--border-color);
      padding-right: 1rem;
  width: 64%;
  }
   @media @laptop{
     border-right: 1px solid var(--border-color);
      padding-right: 1rem;
  width: 70%;
  }

  @media @desktop{
     border-right: 1px solid var(--border-color);
      padding-right: 1rem;
    width: 77%;
  }
 


  // --- PILL TALES GRID ---
  .pill-tales-grid {
    display: grid;
    gap: 10px;
   
  @media @smallDevice{
    grid-template-columns: repeat(1, 1fr);
  }
    @media @tablet {
      grid-template-columns: repeat(1, 1fr);
    }

    @media @laptop {
      grid-template-columns: repeat(2, 1fr);
    }

    @media @desktop {
      grid-template-columns: repeat(3, 1fr); // 3 Columns (~300px each inside 940px)
    }

    .pill-card {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 2rem;

      

      @media @smallDevice{
      width: 100%;
      max-width: @min-width;
      margin: 0 auto;
&:last-child{
        border-bottom: none;
        
      }

  }


    @media @tablet {
      width: 100%;
      max-width: @min-width;
      margin: 0 auto;
    }

      .pill-image-wrap {
        width: 100%;
        aspect-ratio: 4/3;
        height: auto; // Fixed 240px height
        background-color: var(--light-background-color);
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 0.75rem;

       

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.25s ease;
        }
      }

      &:hover .pill-image-wrap img {
        transform: scale(1.03);
      }
    }
  }
}

// ------------------------------------
// 2. SIDEBAR (300px)
// ------------------------------------

.sidebar {

 
    @media @smallDevice{
     width: 100%;
     padding-top: 1rem;
     margin-top: 1rem;
     //border-top: 1px solid var(--border-color);
  }

     @media @tablet {
      width:36%;
       padding-left: 1rem;
    }

  
   @media @laptop{
  width: 30%;
   padding-left: 1rem;
  }

  @media @desktop{
      width: 23%;
       padding-left: 1rem;

  }

  .sidebar-block {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.5rem;
    margin-bottom: 1.5rem;

    @media @smallDevice{
     width: @min-width;
     max-width: 100%;
     margin-right: auto;
      margin-left: auto;
  }

    .block-header {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color);
      
      &--writers {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .block-header-selector {
          display: flex;
          gap: 0.5rem;

          button {
            background: none;
            border: none;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            color: var(--muted-text-color);
            transition: color 0.2s ease;
            text-decoration: underline;

            &.active {
              color: var(--link-color);
              text-decoration: none;
               pointer-events: none;
            }

            &:hover:not(.active) {
              color: var(--text-color);
              text-decoration: none;
             
            }
          }
        }
      }
    }

    .block-footer{
      text-align: center;
      margin-top: 1rem;
      padding: 1rem 0;
      border-top: 1px solid var(--border-color);
    }
  }
}

.focus-tale-container {
  width: 100%;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  //max-width: 1300px;
  //margin: 2rem auto;
  //padding: 1rem;
  //background-color:#f2f2fb;
}

.focus-tale-wrapper {
 
  //flex-direction: column-reverse; /* Rule 4: Mobile view defaults to image on top */
  //background: #ffffff;
  //border: 1px solid #e5e7eb;
  //border-radius: 12px;
  //overflow: hidden;
  //box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
 

  /* Desktop View (768px and up) */
  display: flex;

  @media @smallDevice{
  max-width: @mid-width;
  margin: 0 auto;
   row-gap: 1rem;
    flex-direction:column-reverse;
  }

  @media @tablet{
  max-width: @mid-width;
  margin: 0 auto;
   row-gap: 1rem;
    flex-direction:column-reverse;
  }

  @media @laptop{
  max-width: @mid-width;
  margin: 0 auto;
  row-gap: 1rem;
    flex-direction:column-reverse;
  }

  @media @desktop{
  column-gap: 1rem;
    justify-content: space-between;
  }
 

  /* --- Text Wrapper --- */
  .focus-text-wrapper {
   
    //padding: 2rem;
    display: flex;
    //flex-direction: column;
    justify-content: center;
    //align-items:center;
    //background-color: var(--background-color);

      @media @smallDevice{
  width: 100%;
  }

     @media @tablet{
  width: 100%;
  }
     @media @laptop{
  width: 100%;
  }
    @media @desktop{
   width: 32%;
  }

  }

  /* --- Image Wrapper --- */
  .focus-image-wrapper {
    
    overflow: hidden;
    position: relative;
//background-color: var(--background-color);
//padding: 1rem;

 @media @smallDevice{
  width: 100%;
  }

 @media @tablet{
  width: 100%;
  }

 @media @laptop{
  width: 100%;
  }

 @media @desktop{
  width: 68%;
  }
   

    img {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }
  }

  &:hover .focus-image-wrapper img {
    transform: scale(1.02);
  }
}


.block-card {

  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);

  &:last-child{
    margin-bottom: 0;
     padding-bottom: 0;
    border-bottom: none;
  }

  &__title {
    font-size: 1.25rem;
  margin-bottom: 0.75rem;
  font-weight: 600;

  & span.hash{
    font-size: 0.9rem;
    font-weight: normal;
  }
  }

  &__metrics {
    display: flex;
    gap: 0.75rem;
    
  }

  &__metric-link {
   display: inline-flex;
    align-items: center;
    column-gap: 0.25rem;

  }

  &__metric-value {
    font-weight: 700;
  }

  &__metric-label {
    font-weight: 400;
  }

  &__actions{
display: flex;
justify-content:space-between;
column-gap: 1rem;
  }

}

.trending-container{
  width: @max-width;
  max-width: calc(100% - 20px);
  margin: 1rem auto 2rem auto;
 
 
}

.trending-container-title{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 0.75rem;
color: @red-color;
 

  & h2{
    font-size: 1.1rem;
  
     //color: var(--muted-text-color);
     //text-transform: uppercase;
     font-weight: 700;
  }
}

.tag-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
   
 
}
       
.tag-link {
    display: inline-flex;
    align-items: center;
    column-gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--light-background-color);
    border: 1px solid var(--border-color);
    color: var(--muted-text-color);
    //color:@link-color;
    border-radius: 99999px;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 6rem;
 //flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 2rem;
  display: inline-flex;

     &:hover {
          background-color: var(--background-color);
          color:@link-color;
        }
}

</style>
