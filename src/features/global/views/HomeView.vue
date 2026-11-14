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

  <div class="homepage-hero">

    
    <div class="homepage-hero__container">
      
      
      <h1 class="homepage-hero__title">
        The reality you know is just one version.
      </h1>

      <h2 class="homepage-hero__explainer">
        Blending logic and artistic freedoms, our stories re-imagine the past, 
        reframe the present, and sculpt futures.
      </h2>

      <div class="homepage-hero__cta-group">
        <RouterLink class="btn btn--primary" to="/faqs">
          About Us
        </RouterLink>
        <button class="btn btn--secondary btn--outscribe" @click="handleJoinClick">
          Join Us
        </button>
      </div>
      
    </div>
    
      <div class="homepage-hero__image">
        <p></p>
        <img src="@/assets/images/icon.png" />
         <p></p>
      </div>


  </div>

<template v-if="homepageStore.tags.length > 0">

  <div class="trending-section">

    <div class="trending-section__wrapper">

    <div class="trending-section__header">
      
      <h2 class="trending-section__title">trending today</h2>
    </div>

    <div class="trending-section__tags">
      <RouterLink
        v-for="tag in homepageStore.tags" 
        :key="tag.tagId" 
        :to="`/tales?tag=${tag.slug}`" 
        class="tag-pill"
      >
        <span class="tag-pill__name"><span class="tag-pill__symbol">#</span>{{ tag.name }}</span>
        <span class="divider divider--circle"></span>
        <span class="tag-pill__metric">{{ formatCounts(tag.talesCounter) }}</span>
      </RouterLink>

      <RouterLink to="/tags" class="tag-pill tag-pill--more">
        <span class="tag-pill__name">More...</span>
      </RouterLink>
    </div>
    </div>

  </div>


  </template>

  <template v-if="homepageStore.tales.length > 0">

  <header class="page-header page-header--max">
    <h2 class="page-header__title">
      Recent Tales
    </h2>
    <div class="page-header__lines">
      <p class="page-header__lines--item"></p>
      <p class="page-header__lines--item"></p>
    </div>
              <RouterLink to="/tales"  class="btn btn--primary">
                Explore Tales
              </RouterLink>
  </header>



<div class="home-layout" v-if="homepageLayout.focus">

  <!-- =============================================================
       LEVEL 1: Focus (Item 'a') + Sidebar (Item 'e')
       ============================================================= -->
  <section class="home-layout__level home-layout__level--focus">
    
    <!-- FOCUS CARD (a) - Spans 3 columns -->
    <article class="card card--focus">
      <div class="card__media">
        <RouterLink :to="`/tale/${homepageLayout.focus.slug}`" v-if="homepageLayout.focus.photo">
          <img :src="mediaHelper.getUrl(homepageLayout.focus.photo, 'tales', 'full')" :alt="homepageLayout.focus.title" />
        </RouterLink>
      </div>
      <div class="card__content">
        <TaleTextComponent :tale="homepageLayout.focus" type="focus" />
      </div>
    </article>

    <!-- SIDEBAR CARD (e) - Occupies 4th column -->
    <article class="card card--sidebar" v-if="homepageLayout.sidebar">
      <div v-if="homepageLayout.sidebar.photo" class="card__media">
        <RouterLink :to="`/tale/${homepageLayout.sidebar.slug}`">
          <img :src="mediaHelper.getUrl(homepageLayout.sidebar.photo, 'tales', 'thumb')" :alt="homepageLayout.sidebar.title" />
        </RouterLink>
      </div>
      <div class="card__content">
        <TaleTextComponent :tale="homepageLayout.sidebar" type="pill" />
      </div>
    </article>

  </section>


  <!-- =============================================================
       LEVEL 2: Nones Strip (4 items: b, c, d, f) - All-or-Nothing Symmetry
       ============================================================= -->
  <section class="home-layout__level home-layout__level--nons">
    <article 
      v-for="tale in homepageLayout.nones" 
      :key="tale.taleId" 
      class="card card--none"
    >
      <!-- Media renders only if allNonesHaveImages is true across the entire strip -->
      <div v-if="tale.photo" class="card__media">
        <RouterLink :to="`/tale/${tale.slug}`">
          <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
        </RouterLink>
      </div>
      <div class="card__content">
        <TaleTextComponent :tale="tale" type="pill" />
      </div>
    </article>
  </section>


  <!-- =============================================================
       LEVEL 3: Subfocus (h) + Stacked Cards (i, j) + Side Card (g)
       ============================================================= -->
  <section class="home-layout__level home-layout__level--subfocus">
    
    <!-- SUBFOCUS CARD (h) - Spans 2 columns -->
    <article class="card card--subfocus" v-if="homepageLayout.subfocus">
      <div class="card__media" v-if="homepageLayout.subfocus.photo">
        <RouterLink :to="`/tale/${homepageLayout.subfocus.slug}`">
          <img :src="mediaHelper.getUrl(homepageLayout.subfocus.photo, 'tales', 'full')" :alt="homepageLayout.subfocus.title" />
        </RouterLink>
      </div>
      <div class="card__content">
        <TaleTextComponent :tale="homepageLayout.subfocus" type="focus" />
      </div>
    </article>

    <!-- STACKED SUB-SIDEBARS (i, j) - Occupies 3rd column -->
    <div class="home-layout__stack" v-if="homepageLayout.subside.length">
      <article 
        v-for="tale in homepageLayout.subside" 
        :key="tale.taleId" 
        class="card card--stack-item"
      >
        <div v-if="tale.photo" class="card__media">
          <RouterLink :to="`/tale/${tale.slug}`">
            <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
          </RouterLink>
        </div>
        <div class="card__content">
          <TaleTextComponent :tale="tale" type="pill" />
        </div>
      </article>
    </div>

    <!-- RIGHT SIDE CARD (g) - Occupies 4th column (aligned with Level 1 'e') -->
    <article class="card card--side-card" v-if="homepageLayout.sideCard">
      <div v-if="homepageLayout.sideCard.photo" class="card__media">
        <RouterLink :to="`/tale/${homepageLayout.sideCard.slug}`">
          <img :src="mediaHelper.getUrl(homepageLayout.sideCard.photo, 'tales', 'thumb')" :alt="homepageLayout.sideCard.title" />
        </RouterLink>
      </div>
      <div class="card__content">
        <TaleTextComponent :tale="homepageLayout.sideCard" type="pill" />
      </div>
    </article>

  </section>

</div>






  </template>

  <header class="page-header page-header--max">
    <h2 class="page-header__title">
      Top Categories
    </h2>
    <div class="page-header__lines">
      <p class="page-header__lines--item"></p>
      <p class="page-header__lines--item"></p>
    </div>
    <RouterLink to="/categories"  class="btn btn--primary">
      Explore Categories
    </RouterLink>
  </header>

  <div class="discovery-top-container" v-if="categorizedTales.focusCategory">
  
  <!-- 1. FOCUS CATEGORY (Most tales - styled prominently) -->

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

 <header class="page-header page-header--max">
    <h2 class="page-header__title">
      Top Countries
    </h2>
    <div class="page-header__lines">
      <p class="page-header__lines--item"></p>
      <p class="page-header__lines--item"></p>
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
    
  <header class="page-header page-header--max">
    <h2 class="page-header__title">
      Top / Recent Writers
    </h2>
    <div class="page-header__lines">
      <p class="page-header__lines--item"></p>
      <p class="page-header__lines--item"></p>
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

  <div class="roadmap-section">

    <div class="roadmap-section__image-wrapper">

      <div class="roadmap-section__image">
      <img src="@/assets/images/writing-girl.png" />
     
      </div>

        <div class="roadmap-section__header">
        <h3 class="roadmap-section__title">Guest <SvgIcons name="frontarrow" :size=30 /> OutScriber</h3>
        <p class="roadmap-section__subtitle">
          Share your alternate realities. <br /> Start <button type="button" @click="handleCreateDraftClick">OutScribing</button> in quick, simple steps.
        </p>
      </div>

    </div>

    <div class="roadmap-section__steps">

         <div class="roadmap-card">
            <h4 class="roadmap-card__heading">Sign Up</h4>
            <ul class="roadmap-card__content">
              <li>
                Create a new account via Google, Microsoft, Apple, or an email security token.
              </li>
              <li>
                Choose your unique OutScribed handle and password.
              </li>
              <li>
                Agree to platform's legal & structural statements with a single click.
              </li>
            </ul>
          </div>

          <div class="roadmap-card">
            <h4 class="roadmap-card__heading">Build Story</h4>
            <ul class="roadmap-card__content">
              <li>
                Create a story draft with a title and category.
              </li>
              <li>
                Move over to the <strong>Tales' Editor</strong> to write your story.
              </li>
              <li>
                Complete story's basic information, reality check, and optional photo & tags.
              </li>
            </ul>          
          </div>

         <div class="roadmap-card">
            <h4 class="roadmap-card__heading">Go Live</h4>
             <ul class="roadmap-card__content">
              <li>
                Preview yoru story to ensure all Ts are crossed and Is dotted.
              </li>
              <li>
                Publish your story to the world with a single click.
              </li>
              <li>
                Invite others to read, rate, & join discussion threads via social networks and email.
              </li>
            </ul>
          </div>



    </div>

    <div class="roadmap-section__footer">
        <button 
          type="button" 
          class="btn btn--secondary btn--prominent"
          @click="handleCreateDraftClick"
        >
          Start here
        </button>
    </div>

  </div>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/discovery-container.less";

/* ==========================================================================
   1. HOMEPAGE HERO (Mesh Gradient Header)
   ================================================================---------- */
.homepage-hero {
  width: 100%;
  height: auto;
  position: relative;
 
  margin-top: -1px;
  background-color: var(--background-color);
  //border-bottom: 1px solid var(--border-color);

  padding: 1rem;
  //margin-bottom: 1rem;
  //font-family: 'Palatino Linotype', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;


  &__wrapper{
    width: @max-width;
    max-width: calc(100% - 20px);
    justify-content: center;
    display: flex;
    align-items: center;
    margin: 0 auto;
  }
 
  &__container {
     width: @mid-width;
    max-width: calc(100% - 20px);
    justify-content: center;
    display: flex;
    align-items: center;
    margin: 0 auto;
    position: relative;
    height: auto;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center; 
    row-gap: 1rem;
    //text-align: center;
  
      padding: 2rem 0;

        @media @smallDevice {
          width: 500px;
        }

        @media @largeDevice {
          width: 550px;
        }
  }

  &__image{
    display: flex;
    justify-content: center;
    align-items:center;
    width:100%;
    margin-top:1rem;
    width: @max-width;
     margin: 0 auto;

    & p{ 
      flex-grow: 1;
      height: 1px;
      background-color: var(--border-color);
    }

    & img{
     
      height: auto;
      margin: 0 0.5rem;

      @media @smallDevice {
        width: 2.5rem;
      }
       @media @largeDevice {
        width: 3rem;
      }
    }
  }
  
  &__title {
    font-weight: 600;
    text-transform: capitalize;
    text-align: center;
   



    @media @phone {
      font-size: 1.7rem;
      line-height: 2rem;
    }
    @media @phablet {
      font-size: 2.1rem;
      line-height: 2.4rem;
    }
    @media @largeDevice {
      font-size: 2.8rem;
      line-height: 3rem;
    }
  }

  &__explainer {
    font-weight: 500;
    font-size: clamp(1rem, 1.2vw + 1rem, 1.2rem);
    line-height: clamp(1.3rem, 1.4vw + 1rem, 1.5rem);
    margin-bottom: 0.75rem;
    text-align: center;
  }

  &__cta-group {
    display: flex;
    justify-content: center;
    column-gap: 0.25rem;
    width: 100%;

  }

  &__cta {
    height: 2.5rem;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    font-weight: normal;
    text-transform: uppercase;
    font-size: clamp(0.9rem, 0.95vw + 1rem, 1rem);
    font-weight:700;
    color: @white-color;
    //border: 2px solid @link-alt-color;

    &--join {
     background-color:@link-alt-color;

      &:hover {
        background-color: darken(@link-alt-color, 10%);
        color: @white-color;
      }
    }
   
    &--about {
      background-color:@white-color;
      color:@link-color;

      &:hover {
         background-color: var(--light-background-color);
        color:@link-color;
      }
    }
  }
}

/* ==========================================================================
   2. TRENDING SECTION
   ================================================================---------- */

.trending-section {
  width: 100%;
  margin: 1rem 0 3rem 0;
  //padding-bottom:1rem;
  //border-bottom:1px solid var(--border-color);
  
  &__wrapper{
  display:flex;
  flex-direction:column;
  row-gap: 0.5rem;
   width: @max-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction:column;
    color: @red-color;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  column-gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  //background-color: var(--light-background-color);
  border: 1px solid var(--border-color);
  color: var(--muted-text-color);
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6rem;
  height: 2rem;
  text-decoration: none;

  &:hover {
    background-color: var(--light-background-color);
    color: @link-color;
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

/* ==========================================================================
   3. HOMEPAGE TALES LAYOUT (Card-Level Centralization & Dimension Caps)
   ================================================================---------- */
@gutter-pct: (20 / 1300) * 100%; // 1.5384615%

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
    grid-template-columns: repeat(4, 1fr); // Desktop/Laptop (> 991px)
    column-gap: @gutter-pct;
    row-gap: 1.5rem;
    align-items: start;

    /* Tablet & Phablet (600px - 991px) AND Phone (< 600px): Single 100% Column */
    @media (max-width: 991px) {
      grid-template-columns: 1fr;
    }
  }

  /* =============================================================
   * UNIVERSAL CARD RESPONSIVE BEHAVIOR
   * ============================================================= */
  .card {
    display: flex;
    row-gap: 0.5rem;
    flex-direction: column; // Desktop/Laptop: Image stacked above text
    width: 100%;

    /* Tablet & Phablet (600px - 991px): 100% card width, 50/50 row split */
    @media @phablet, @tablet {
      flex-direction: row;
      column-gap: 1.25rem;
      align-items: flex-start;
      max-width: 100%; // Uncapped 100% width
    }

    /* Phone (< 600px): Stacked column, capped at 450px */
    @media @phone {
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

      /* Tablet & Phablet: Media takes exact 50% of the 100%-wide card */
      @media @phablet, @tablet {
        width: 50%;
      }
    }

    &__content {
      flex: 1 1 auto; // Takes remaining 50% alongside image, or 100% when no image exists
      min-width: 0;
    }
  }

  /* =============================================================
   * LEVEL 1: Focus (640px Image + 20px Gap + 310px Text) + Sidebar (310px)
   * ============================================================= */

  &__level--focus {
    .card--focus {
      grid-column: span 3;
      display: grid;
      grid-template-columns: 640fr 310fr;
      column-gap: (20 / 970) * 100%;
      align-items: start;

      @media (max-width: 991px) {
        grid-column: span 1;
        display: flex;
        flex-direction: column; // Focus stacks image (full width) above text on tablet & phone
        max-width: 100%;
        gap: 1rem;
      }

      .card__media {
        aspect-ratio: 750 / 562;

        @media @phablet, @tablet {
          width: 100%; // Overrides standard 50% tablet media rule so focus stays monumental
        }
      }
    }
  }

  /* =============================================================
   * LEVEL 2: Nones Strip
   * ============================================================= */
  &__level--nons {
    align-items: stretch;
  }

  /* =============================================================
   * LEVEL 3: Subfocus (640px) + Stack (310px) + Side Card (310px)
   * ============================================================= */
  &__level--subfocus {
    .card--subfocus {
      grid-column: span 2;

      @media (max-width: 991px) {
        grid-column: span 1;
        flex-direction: column; // Subfocus also keeps image full-width above text on tablet & phone
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

  &__stack {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
   PATHWAY
   ================================================================---------- */

.roadmap-section{
  width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 1rem auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

   @media @phone{
 width: @min-width;
  }

  &__image-wrapper{
    display: flex;
    justify-content:center;
    align-items: center;
    flex-direction: column;
    row-gap: 0.5rem;
    width: 100%;
  }
  
  &__image{
       width: 300px;
       

    & img{
      width: 100%;
      height: auto;
     

    }
  }

&__header {
    text-align: center;
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: var(--text-color);
    margin-bottom: 0.3rem;
    display: flex;
    align-items:center;
    justify-content:center;
    column-gap: 0.5rem;

    & svg{
      stroke: @logo-red;
      stroke-width: 2;
    }
  }

  &__subtitle {
    color: var(--muted-text-color);

    & button{
      border-bottom: 2px dotted var(--border-color);
      font-style: italic;

      &:hover{
       border-bottom-color: transparent;
      }
    }
  }

  &__steps{
    display: flex;
    column-gap: 0.5rem;
      padding: 1rem 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);

       @media @phone{
 flex-direction: column;

  }
  }

  .roadmap-card{
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    width: 100%;

    &__heading{
      font-size: 1.8rem;
      text-transform: uppercase;
      font-weight: 900;
    }

    &__content{
      list-style:square;
      margin-left: 0.75rem;

      & li{
        font-size: 0.85rem;
        color: var(--muted-text-color);
        margin: 0;
        line-height: 1.4;
      }
    }

  }

  
    &__footer{
    
      text-align: center;
    

    }


}

</style>