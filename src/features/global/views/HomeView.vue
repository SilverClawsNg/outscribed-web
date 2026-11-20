<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { APIError } from '@/api/apiTypes'
import { useHomeStore } from '../stores/HomeStore'; 

// Sub-components & Stores
import { useModalStore } from '@/stores/modalStore'
import { mediaHelper } from '@/utils/mediaHelper'
import { formatCounts } from '@/utils/stringHelpers'
import { useEngagement } from '@/composables/useEngagement';
import SvgIcons from '@/components/SvgIcons.vue';
import { useLoginHint } from '@/utils/authHelper'
import { curateHomepageTales } from '@/utils/curateHomepageTales';
import CategoryComponent from '../components/CategoryComponent.vue';
import CountryComponent from '../components/CountryComponent.vue';
import WriterComponent from '../components/WriterComponent.vue';
import TaleTextComponent from '@/features/tales/components/TaleTextComponent.vue';

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
  const { success, error } = await homepageStore.loadhomecontents()

  if (!success) {
    if (error) {
      loadingError.value = error
    } else {
      loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occurred while retrieving homepage contents. Refresh page and try again.'
      );
    }
  }

  isLoading.value = false

  if (success) {
    await homepageStore.hydratePersonals(); 
  }
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

onUnmounted(() => {
  homepageStore.abort();
});

const homepageLayout = computed(() => {
  return curateHomepageTales(homepageStore.tales);
});

// Assuming homepageStore.categories is an array of objects like: { name: string, count: number, slug: string }
const categorizedTales = computed(() => {
  const categories = [...homepageStore.categories];
  
  if (categories.length === 0) return { focusCategory: null, pillCategories: [] };

  // Sort descending by count to find the category with the most tales
  categories.sort((a, b) => b.talesCounter - a.talesCounter);

  const focusCategory = categories[0];
  const pillCategories = categories.slice(1, 5); // Takes up to the next 5 top categories as pills

  return { focusCategory, pillCategories };
});

// Assuming homepageStore.categories is an array of objects like: { name: string, count: number, slug: string }
const countriesTales = computed(() => {
  const countries = [...homepageStore.countries];
  
  if (countries.length === 0) return { focusCountry: null, pillCountries: [] };

  // Sort descending by count to find the category with the most tales
  countries.sort((a, b) => b.talesCounter - a.talesCounter);

  const focusCountry = countries[0];
  const pillCountries = countries.slice(1, 6); // Takes up to the next 5 top categories as pills

  return { focusCountry, pillCountries };
});

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
          More About Us
        </RouterLink>
        <button class="btn btn--secondary btn--outscribe" @click="handleJoinClick">
          Join Us
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
 
  <template v-if="homepageStore.tales.length > 0">

<div class="home-layout" v-if="homepageLayout.focus">

<!-- LEVEL 1: Focus Hero (Left) + Vertical Roadmap Steps (Right) -->
<section class="home-layout__level home-layout__level--focus">
  
  <!-- LEFT: FOCUS TALE -->
  <article class="card card--focus">
    <div class="card__media" v-if="homepageLayout.focus.photo">
      <RouterLink class="image" :to="`/tale/${homepageLayout.focus.slug}`">
        <img 
          :src="mediaHelper.getUrl(homepageLayout.focus.photo, 'tales', 'full')" 
          :alt="homepageLayout.focus.title" 
        />
      </RouterLink>
      
      <!-- Bottom-anchored translucent text overlay -->
      <div class="card__overlay-content">
           <div class="card__overlay-content--wrapper">
        <TaleTextComponent :tale="homepageLayout.focus" type="focus" />
      </div>
      </div>
    </div>
  </article>

  <!-- RIGHT: VERTICAL STEPPED ROADMAP -->
  <aside class="roadmap-section roadmap-section--hero">

 <div class="roadmap-section__header">
   <div class="roadmap-section__header-image">
    <img src="@/assets/images/writing-girl.png" alt="" />
  </div>
  <div class="roadmap-section__header-text">
    <h3 class="roadmap-section__title">
      Guest <SvgIcons name="frontarrow" :size="24" /> OutScriber
    </h3>
    <p class="roadmap-section__subtitle">
      As an OutScriber, you get super powers to create and rule your own world. Start 
      <button type="button" @click="handleCreateDraftClick">OutScribing</button> 
      in quick, simple steps.
    </p>
  </div>
 
</div>

    <!-- Vertical column display for maximum text visibility -->
    <div class="roadmap-section__steps">

      <div class="roadmap-card roadmap-card--step1">
        <h4 class="roadmap-card__heading">1. Sign Up</h4>
        <ul class="roadmap-card__content">
          <li>Create an account via Google, Microsoft, Apple, or email token.</li>
          <li>Choose your unique OutScribed handle and password.</li>
          <li>Accept the platform's legal &amp; structural statements in one click.</li>
        </ul>
      </div>

      <div class="roadmap-card roadmap-card--step1">
        <h4 class="roadmap-card__heading">2. Build Story</h4>
        <ul class="roadmap-card__content">
          <li>Start a draft with a title and category.</li>
          <li>Open the <strong>Write Studio</strong> to craft your narrative.</li>
          <li>Complete reality checks, optional photo, and tags.</li>
        </ul>
      </div>

      <div class="roadmap-card roadmap-card--step1">
        <h4 class="roadmap-card__heading">3. Go Live</h4>
        <ul class="roadmap-card__content">
          <li>Preview your story to ensure all Ts are crossed and Is dotted.</li>
          <li>Publish to the world with a single click.</li>
          <li>Invite readers to rate and join discussion threads.</li>
        </ul>
      </div>
    </div>

    <div class="roadmap-section__footer">
      <button 
        type="button" 
        class="btn btn--secondary"
        @click="handleCreateDraftClick"
      >
        Start here
      </button>
        <router-link to="/faqs" class="roadmap-section__faq-link">
          View FAQs
          </router-link>
    </div>
  </aside>

</section>

  <header class="section-header section-header--max">
    <h2 class="section-header__title">
      Recent Tales
    </h2>
    <div class="section-header__lines">
      <p class="section-header__lines--item"></p>
      <p class="section-header__lines--item"></p>
    </div>
    <RouterLink to="/tales"  class="btn btn--primary">
       Explore Tales
    </RouterLink>
  </header>

  <!-- LEVEL 2: Nones Strip (4 Equal Cards) -->
  <section class="home-layout__level home-layout__level--nons">
    <article 
      v-for="tale in homepageLayout.nones" 
      :key="tale.taleId" 
      class="card card--none"
    >
      <div v-if="tale.photo" class="card__media">
        <RouterLink  class="image" :to="`/tale/${tale.slug}`">
          <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
        </RouterLink>
      </div>
      <div class="card__content">
        <TaleTextComponent :tale="tale" type="pill" />
      </div>
    </article>
  </section>

  <!-- LEVEL 3: Subfocus (Left 2 Cols) + 2x2 Supporting Cards (Right 2 Cols) -->
  <section class="home-layout__level home-layout__level--subfocus">
    <article class="card card--subfocus" v-if="homepageLayout.subfocus">
      <div class="card__media" v-if="homepageLayout.subfocus.photo">
        <RouterLink  class="image" :to="`/tale/${homepageLayout.subfocus.slug}`">
          <img :src="mediaHelper.getUrl(homepageLayout.subfocus.photo, 'tales', 'full')" :alt="homepageLayout.subfocus.title" />
        </RouterLink>
      </div>
      <div class="card__content">
        <TaleTextComponent :tale="homepageLayout.subfocus" type="subfocus" />
      </div>
    </article>

    <div class="home-layout__subside-grid" v-if="homepageLayout.subside.length">
      <article 
        v-for="tale in homepageLayout.subside" 
        :key="tale.taleId" 
        class="card card--subside"
      >
        <div v-if="tale.photo" class="card__media">
          <RouterLink  class="image" :to="`/tale/${tale.slug}`">
            <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
          </RouterLink>
        </div>
        <div class="card__content">
          <TaleTextComponent :tale="tale" type="pill" />
        </div>
      </article>
    </div>
  </section>

</div>

  </template>
  
  <header class="section-header section-header--max">
    <h2 class="section-header__title">
      Use Cases
    </h2>
    <div class="section-header__lines">
      <p class="section-header__lines--item"></p>
      <p class="section-header__lines--item"></p>
    </div>
    <RouterLink to="/use-cases"  class="btn btn--primary">
      See All
    </RouterLink>
  </header>

  <p class="use-cases-intro">
    OutScribed focuses on the use of short stories as a means of expression. Here are some practical real-world scenarios where OutScribed stories excel.
  </p>

  <div class="use-cases">
    <div class="use-cases__item">
     <div class="use-cases__avatar">
      <img src="@/assets/images/avatar1.png" />
    </div>
     <div class="use-cases__contents">
       <h2 class="use-cases__title">
      Take a seat at any table
    </h2>
     <div class="use-cases__text">
      <h3>The Situation</h3><p>Claire regularly watches a late-night news panel and often feels that key viewpoints—the ones ordinary people actually care about—never make it into the discussion.</p><h3>The OutScribed Approach</h3><p>She creates a persona on OutScribed and writes short stories that place her right on the panel as an additional guest.</p><h3>Why It Works</h3><p>OutScribed lets Claire pull up a chair to a table she wasn't invited to. By outscribing each episode, she brings in the missing questions, real-world angles, and counterarguments—and gradually builds an audience of readers who share her view or want to hear the other side.</p>    </div>
    </div>
   
  </div>
   <div class="use-cases__item">
     <div class="use-cases__avatar">
      <img src="@/assets/images/avatar2.png" />
    </div>
    <div class="use-cases__contents">
         <h2 class="use-cases__title">
      Simplify Complex Solutions
    </h2>
     <div class="use-cases__text">
    <h3>The Situation</h3><p>John is an electrical engineering professor with practical ideas for fixing Nigeria's power grid, but the everyday citizens who stand to benefit most are unlikely to read a dense technical proposal.</p><h3>The OutScribed Approach</h3><p>On his OutScribed page, he writes a story in which he steps into the shoes of the Minister of Power. Through the daily trade-offs, setbacks, and breakthroughs of the job, he shows how his ideas would play out in the real world.</p><h3>Why It Works</h3><p>OutScribed lets John translate complex engineering into a story anyone can follow without watering down the substance. Instead of handing readers a dry whitepaper, he unpacks technical jargon through human decisions—showing how policies and infrastructure choices actually affect ordinary lives.</p>    </div>
    </div>
   
  </div>
   <div class="use-cases__item">
     <div class="use-cases__avatar">
      <img src="@/assets/images/avatar3.png" />
    </div>
    <div class="use-cases__contents">
        <h2 class="use-cases__title">
      Focus on the Message
    </h2>
     <div class="use-cases__text">
<h3>The Situation</h3><p>Martha wanted to respond to a major political speech—challenging weak points, strengthening others, and raising questions that were left out. Yet in public debates, people often attack the messenger instead of weighing the message.</p><h3>The OutScribed Approach</h3><p>Using her OutScribed page, she wrote a story featuring an alternative version of the politician delivering a revised speech—keeping what worked, fixing what didn't, and weaving in the missing points.</p><h3>Why It Works</h3><p>OutScribed lets Martha place her ideas directly inside the speech rather than attaching them to her own name or background. Readers end up debating the arguments and real-world consequences of the revised speech instead of targeting the writer.</p>
    </div>
    </div>
  
  </div>
  </div>

  <header class="section-header section-header--max">
    <h2 class="section-header__title">
      Top Categories
    </h2>
    <div class="section-header__lines">
      <p class="section-header__lines--item"></p>
      <p class="section-header__lines--item"></p>
    </div>
    <RouterLink to="/categories"  class="btn btn--primary">
      Explore Categories
    </RouterLink>
  </header>

  <div class="discovery-top-container" v-if="categorizedTales.focusCategory">
  
  <div class="discovery-top-container__focus">

    <CategoryComponent 
        :category="categorizedTales.focusCategory" 
        type="focus" 
      />
    
  </div>

   <div class="discovery-top-container__pills">

    <CategoryComponent 
        v-for="category in categorizedTales.pillCategories" 
        :key="category.category"
        :category="category" 
        type="pill" 
      />

  </div>

  </div>

<template v-if="homepageStore.countries.length > 0 || homepageStore.countries.length > 0">

 <header class="section-header section-header--max">
    <h2 class="section-header__title">
      Top Countries
    </h2>
    <div class="section-header__lines">
      <p class="section-header__lines--item"></p>
      <p class="section-header__lines--item"></p>
    </div>
              <RouterLink to="/countries"  class="btn btn--primary">
                Explore Countries
              </RouterLink>
 </header>

  <div class="discovery-top-container" v-if="countriesTales.focusCountry">
  
  <!-- 1. FOCUS COUNTRY (Most tales - styled prominently) -->

  <div class="discovery-top-container__focus">

      <CountryComponent 
        :country="countriesTales.focusCountry" 
        type="focus" 
      />
    
  </div>

   <div class="discovery-top-container__pills">

    <CountryComponent 
        v-for="country in countriesTales.pillCountries" 
        :key="country.country"
        :country="country" 
        type="pill" 
      />

  </div>
 
</div>
</template>
           
  <template v-if="homepageStore.newWriters.length > 0 || homepageStore.prolificWriters.length > 0">
    
  <header class="section-header section-header--max">
    <h2 class="section-header__title">
      Top / Recent Writers
    </h2>
    <div class="section-header__lines">
      <p class="section-header__lines--item"></p>
      <p class="section-header__lines--item"></p>
    </div>
              <RouterLink to="/writers"  class="btn btn--primary">
                Explore Writers
              </RouterLink>
  </header>

  <div class="homepage-writers">
  
   <div class="homepage-writers__pills">

     <WriterComponent 
        v-for="writer in homepageStore.prolificWriters" 
        :key="writer.creator.accountId"
        :writer="writer" 
        type="pill" 
      />

  </div>
  
   <div class="homepage-writers__pills">

     <WriterComponent 
        v-for="writer in homepageStore.newWriters" 
        :key="writer.creator.accountId"
        :writer="writer" 
        type="pill" 
      />

  </div>
 
</div>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/discovery-container.less";

@gutter: (20 / 1300) * 100%;  // 1.53846% (20px at 1300px)
@left-container: (750 / 1300) * 100%;   // 57.6923% (750px at 1300px)
@right-container: (530 / 1300) * 100%; // 40.7692% (530px at 1300px)

.hero {
  max-width: calc(100% - 20px);
  margin: 0 auto;
  padding: 3.5rem 0;
  background-color: var(--background-color);

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


/* ==========================================================================
   3. HOMEPAGE TALES LAYOUT (Card-Level Centralization & Dimension Caps)
   ================================================================---------- */

.home-layout {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;
  max-width: calc(100% - 20px);
  margin: 0 auto;

  
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


  &__level {
    display: grid;
    grid-template-columns: repeat(4, 1fr); // 310px tracks at 1300px
    column-gap: @gutter;
    row-gap: 1.5rem;
    align-items: start;

    @media @phone, @phablet, @tablet {
      grid-template-columns: 1fr;
    }
  }

  /* =============================================================
   * UNIVERSAL CARD RESPONSIVE RULES
   * ============================================================= */
  .card {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    width: 100%;

    /* Tablet & Phablet (600px - 991px): 100% width row split */
    @media @phablet, @tablet {
      flex-direction: row;
      gap: 1.25rem;
      align-items: flex-start;
      max-width: 100%;
    }

    /* Phone (< 600px): Column capped at 450px */
    @media (max-width: 599px) {
      flex-direction: column;
      max-width: 450px;
      margin: 0 auto;
    }

    &__media {
      width: 100%;
      aspect-ratio: 450 / 337;
      overflow: hidden;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
      background-color: var(--light-background-color);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease;
      will-change: transform;

    // Hover State for Interactivity
    &:hover {
      transform: scale(1.03); // Subtle zoom effect indicating it's a link
    }


      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border-radius: 8px;
      }

      @media @phablet, @tablet {
        width: 50%;
      }
    }

    &__content {
      flex: 1 1 auto;
      min-width: 0;
    }
  }

/* =============================================================
 * LEVEL 1: Fluid 750px Focus + 530px Roadmap -> 750px Column <= 991px
 * ============================================================= */
.home-layout__level--focus {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  gap: @gutter; // 20px at 1300px, scales smoothly down to ~15px at 992px
  width: 100%;

  /* At 991px and below: Stack into a centered 750px max-width column */
  @media @phone, @phablet, @tablet {
    flex-direction: column;
    align-items: center;
    max-width: 750px;
    margin: 0 auto;
    gap: 1.5rem;
  }

  .card--focus {
    flex: 0 0 @left-container; // Exact 750px at 1300px; shrinks proportionally to ~572px at 992px
    min-width: 0;
    display: block;
    position: relative;

    @media @phone, @phablet, @tablet {
      flex: none;
      margin-bottom: 3rem;
      width: 100%; // Holds 750px from 991px down to 750px, then shrinks fluidly with viewport
    }

   .card__media {
      position: relative;
      width: 100%;
      height: 100%;
      aspect-ratio: 750 / 562;
      border-radius: 6px;
      overflow: hidden;

      @media @smallDevice {
        height: auto;
      }

      /* Release aspect-ratio & overflow lock on small phones so stacked text expands freely */
      @media (max-width: 599px) {
        aspect-ratio: auto;
        overflow: visible;

        a,
        img {
          aspect-ratio: 750 / 562;
          border-radius: 6px;
          overflow: hidden;
          display: block;
        }
      }
    }

    .card__overlay-content {
      position: absolute;
      inset: auto 0 0 0;
      padding: 2.5rem 1.25rem 1.25rem;
      background: linear-gradient(
        to top,
        rgba(15, 23, 42, 0.92) 0%,
        rgba(15, 23, 42, 0.72) 60%,
        transparent 100%
      );
      //color: #ffffff;
      //pointer-events: none;

      a, button {
        pointer-events: auto;
      }

      @media @phablet, @largeDevice{

      --heading-text-color: @white-color;
      --body-text-color: @white-color;
      --background-color: transparent;

      }

      &--wrapper{
        max-width: @mod-width;
      }
    }

  @media @phone {
      .card__overlay-content {
        position: static;
        padding: 1rem 0 0;
        background: var(--background-color);
        --heading-text-color: inherit;
        --body-text-color: inherit;
        --background-color: inherit
      }
    }
  }
}

/* =============================================================
 * RIGHT-HAND / STACKED ROADMAP
 * ============================================================= */

  .roadmap-section {
    flex: 1 1 @right-container; // Takes remaining 530px at 1300px, shrinking proportionally alongside Focus
  min-width: 0;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 1.5rem 1.5rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
  
  @media @smallDevice {
    flex: none;
    width: 100%; // Matches the 750px Focus card width cleanly when stacked
  }
  &__header {
    position: relative;
    //overflow: hidden;
    display: flex;
    flex-direction: column; // Image first, text second on all screen sizes
    align-items: center;
    gap: 1.5rem;
    text-align: center;

    @media (min-width: 992px) {
      max-width: 750px; // Keeps the column neatly constrained and readable on large screens
      margin-left: auto;
      margin-right: auto;
    }
  }

  &__header-image {
    width: 100%;
    display: flex;
    justify-content: center;

    img {
      display: block;
      margin-top: -3rem;
      width: 100%;
      max-width: 280px; // Control max width so the image doesn't scale too large
      height: auto;
      object-fit: contain;
      position:relative;
      z-index:10;

      @media (min-width: 992px) {
        max-width: 340px; // Slightly larger showcase size on desktop
      }
    }
  }

  &__header-text {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;

    .roadmap-section__subtitle {
      max-width: 60ch; // Optimal reading measure for the paragraph
      margin: 0 auto;
    }
  }
   
  &__title {
    font-size: 1.25rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    margin: 0 0 0.3rem 0;
    display: flex;
    align-items: center;
    column-gap: 0.4rem;

    svg {
      stroke-width: 2;
    }
  }

  &__subtitle {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
    

    button {
      border-bottom: 2px dotted var(--border-color);
      font-style: italic;

      &:hover {
        border-bottom-color: transparent;
      }
    }
  }
}

  .roadmap-section__steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
  }

  .roadmap-card {
    &__heading {
      font-size: 1.05rem;
      text-transform: uppercase;
      font-weight: 900;
      margin: 0 0 0.25rem 0;
    }

    &__content {
      list-style: square;
      margin: 0 0 0 1rem;
      padding: 0;

      li {
        font-size: 0.875rem;
        
        line-height: 1.4;
        margin-bottom: 0.2rem;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .roadmap-section__footer {
    display: flex;
    align-items:center;
    gap: 1rem;
  }

  .roadmap-section__faq-link{
    text-decoration: underline;
    font-weight: normal;

    &:hover{
      text-decoration: none;
    }
  }

  /* =============================================================
   * LEVEL 2: Nones Strip (4 Columns)
   * ============================================================= */
  &__level--nons {
    align-items: stretch;
  }

  /* =============================================================
   * LEVEL 3: Subfocus (640px) + 2x2 Supporting Cards (640px)
   * ============================================================= */
  &__level--subfocus {
    .card--subfocus {
      grid-column: span 2; // 640px

      @media @phone, @phablet, @tablet {
        grid-column: span 1;
        flex-direction: column;
        max-width: 100%;
        gap: 1rem;
      }

      .card__media {
        aspect-ratio: 750 / 562;

        @media @phablet, @tablet {
          width: 100%;
        }
      }
    }
  }

  /* Right half of Level 3: Two levels of two 310px cards */
  &__subside-grid {
    grid-column: span 2; // 640px total (310px + 20px + 310px)
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: (20 / 640) * 100%; // Exact 20px gutter inside the 640px sub-grid
    row-gap: 1.5rem;
    align-items: start;

    @media @phone, @phablet, @tablet {
      grid-column: span 1;
      grid-template-columns: 1fr;
    }
  }
}

/* ==========================================================================
   DISCOVERIES
   ================================================================---------- */

.homepage-writers {
  max-width: calc(100% - 20px);
  margin: 0 auto;
  display: flex;
  margin-bottom: 3rem;

  @media @phone {
    width: @min-width;
    flex-direction:column;
  }

  @media @phablet {
    width: @mod-width;
    flex-direction:column;
  }

  @media @tablet {
    width: @mid-width;
    flex-direction:column;
  }
      
  @media @desktop, @laptop {
    width: @max-width;
  }

  &__pills {
    display: grid;
    gap: 1rem;
    align-items: start; // <--- THIS PREVENTS VERTICAL STRETCHING

    @media @phone, @phablet, @tablet {
      &:first-child {
        margin-bottom: 1.5px; // Fixed potential typo from 1.5px
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
      }

      &:last-child {
        margin-top: 1.5px; // Fixed potential typo from 1.5px
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }
    }
      
    @media @desktop, @laptop {
      &:first-child {
        margin-right: 1.5px;
        padding-right: 1rem;
        border-right: 1px solid var(--border-color);
      }

      &:last-child {
        margin-left: 1.5px;
        padding-left: 1rem;
        border-left: 1px solid var(--border-color);
      }
    }
      
    @media @phone {
      width: 100%;
      grid-template-columns: 1fr;
    }
      
    @media @tablet, @phablet {
      width: 100%;
      grid-template-columns: 1fr 1fr;
    }

    @media @desktop, @laptop {
      width: 50%;
      grid-template-columns: 1fr 1fr;
    }
  }
}
   
/* ==========================================================================
   USE CASES
   ================================================================---------- */

   .use-cases{
      display: flex;
      margin: 0 auto;
      gap: @gutter;
      width: 100%;
      max-width: calc(100% - 20px);
      
      
      @media @desktop, @laptop{
        width: @max-width;
      }

      @media @tablet{
        width: @mid-width;
        flex-direction:column;
        
      }

      @media @phablet{
        width: @mod-width;
        flex-direction:column;
      }

      @media @phone{
        width: @min-width;
        flex-direction:column;
      }


      &__item{
        width: 100%;
        border: 1px solid var(--border-color);
        border-radius: 21px;
        height: auto;
        padding: 0.5rem;

         @media @tablet{
            display:flex;
            margin-bottom:0.5rem;

            &:last-child{
              margin-bottom:none;
            }

          }

           @media @phablet, @phone{
            margin-bottom:0.5rem;

            &:last-child{
              margin-bottom:none;
            }

          }
         
      }

      &__avatar{
        padding: 0.5rem;
        text-align:center;

          @media @tablet{
             width: 150px;
             display: flex;
             align-items:center;
            }

        & img{
          width: 150px;
          max-width:100%;
          height:auto;

          
        }
      }

      &__contents{

          @media @tablet{
             width: calc(100% - 150px);
            }
      }

      &__title{
        margin: 0.5rem 0;
        padding: 1rem 0.75rem;
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        text-align:center;
        text-transform:uppercase;
        font-weight:600;
        

          @media @tablet{
            border-top:none;
            }
      }

      &__text{
        padding: 1rem 0.75rem;

        & h3{
          font-weight: 600;
          margin: 0.5rem 0;
          text-transform: uppercase;
          font-size: 0.9rem;

          &:first-child{
            margin-top: 0;
          }
        }
      }

   }

   
      .use-cases-intro{
        width: @min-width;
        max-width: calc(100% - 20px);
        margin: 0 auto 2.5rem auto;
        font-style: italic;
      }

</style>