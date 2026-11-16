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

 <header class="editorial-masthead">
  <div 
    class="editorial-masthead__grid"
    :class="{ 'editorial-masthead__grid--no-trending': homepageStore.tags.length === 0 }"
  >
    <!-- 1. CENTRALIZED TITLE -->
    <h1 class="editorial-masthead__title">
      The reality you know is <span class="editorial-masthead__highlight">just one version.</span>
    </h1>

    <!-- 2. LEFT TRACK (Explainer with Balanced Kicker Title) -->
    <div class="editorial-masthead__left-track">
     
      <p class="editorial-masthead__explainer">
        Blending logic and artistic freedoms, our stories re-imagine the past, 
        reframe the present, and sculpt futures.
      </p>
      
      <div class="editorial-masthead__cta-group">
        <button class="btn btn--secondary btn--outscribe" @click="handleJoinClick">
          Join Us
        </button>
        <RouterLink class="btn btn--primary" to="/faqs">
          More About Us
        </RouterLink>
      </div>
    </div>

    <!-- 3. RIGHT TRACK (Trending Today Pulse) -->
    <aside 
      v-if="homepageStore.tags.length > 0" 
      class="editorial-masthead__trending"
      aria-label="Trending Topics"
    >
      <div class="editorial-masthead__subheader">
        <span class="editorial-masthead__pulse-dot"></span>
        <h2 class="editorial-masthead__subtitle">Trending today</h2>
      </div>

      <div class="editorial-masthead__tags">
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
  <div class="editorial-masthead__footer">
    <div class="editorial-masthead__divider">
      <span class="editorial-masthead__rule"></span>
      <img src="@/assets/images/icon.png" alt="" aria-hidden="true" />
      <span class="editorial-masthead__rule"></span>
    </div>
 <h2 class="editorial-masthead__byline">
        The Facts, The Fiction, <br /> & Everything In-Betwen
      </h2>
  </div>
</header>
 
  <template v-if="homepageStore.tales.length > 0">

<div class="home-layout" v-if="homepageLayout.focus">

<!-- LEVEL 1: Focus Hero (Left) + Vertical Roadmap Steps (Right) -->
<section class="home-layout__level home-layout__level--focus">
  
  <!-- LEFT: FOCUS TALE -->
  <article class="card card--focus">
    <div class="card__media" v-if="homepageLayout.focus.photo">
      <RouterLink :to="`/tale/${homepageLayout.focus.slug}`">
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
    </div>
  </aside>

</section>


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



  <!-- LEVEL 2: Nones Strip (4 Equal Cards) -->
  <section class="home-layout__level home-layout__level--nons">
    <article 
      v-for="tale in homepageLayout.nones" 
      :key="tale.taleId" 
      class="card card--none"
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
  </section>

  <!-- LEVEL 3: Subfocus (Left 2 Cols) + 2x2 Supporting Cards (Right 2 Cols) -->
  <section class="home-layout__level home-layout__level--subfocus">
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

    <div class="home-layout__subside-grid" v-if="homepageLayout.subside.length">
      <article 
        v-for="tale in homepageLayout.subside" 
        :key="tale.taleId" 
        class="card card--subside"
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

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/discovery-container.less";

@gutter-pct: (20 / 1300) * 100%;  // 1.53846% (20px at 1300px)
@focus-pct: (750 / 1300) * 100%;   // 57.6923% (750px at 1300px)
@roadmap-pct: (530 / 1300) * 100%; // 40.7692% (530px at 1300px)

@max-width: 1300px;
@gutter-pct: (20 / 1300) * 100%;  
@focus-pct: (750 / 1300) * 100%;   
@roadmap-pct: (530 / 1300) * 100%; 

.editorial-masthead {
  width: 100%;
  max-width: @max-width;
  margin: 0 auto 3.5rem auto;
  padding: 2rem 0 0 0;
  background-color: var(--background-color);

  @media (max-width: 1320px) {
    padding-left: 10px;
    padding-right: 10px;
  }

  /* =============================================================
   * GRID CHOREOGRAPHY
   * ============================================================= */
  &__grid {
    display: grid;
    width: 100%;

    // SMALL DEVICES (< 992px): Title -> Left Track -> Trending (Last)
    grid-template-columns: 1fr;
    grid-template-areas:
      "title"
      "left"
      "trending";
    row-gap: 1.5rem;
    justify-items: center;
    text-align: center;
    max-width: 750px;
    margin: 0 auto;

    // LARGE DEVICES (>= 992px): Title -> (Left Track + Trending side-by-side)
    @media (min-width: 992px) {
      max-width: 100%;
      grid-template-columns: @focus-pct @roadmap-pct;
      column-gap: @gutter-pct;
      row-gap: 1.75rem;
      grid-template-areas:
        "title    title"
        "left     trending";
      align-items: start; // Aligns top of both columns cleanly
    }

    &--no-trending {
      @media (min-width: 992px) {
        grid-template-columns: 1fr;
        grid-template-areas:
          "title"
          "left";
      }
    }
  }

  &__title {
    grid-area: title;
    margin: 0 0 0.5rem 0;
     text-align: left;
    justify-self: flex-start;
    font-weight: 400;
    //text-transform:lowercase;
    letter-spacing: -0.02em;
    color: var(--text-color);
    //max-width: 22ch;

    @media @phone {
      font-size: 1.85rem;
      line-height: 2.15rem;
      max-width: 22ch;
       //text-align: center;
    //justify-self: center;
    max-width: 80%;
    }
    @media @phablet, @tablet {
      font-size: 2.35rem;
      line-height: 2.65rem;
    }
    @media @largeDevice {
      font-size: 2.95rem;
      line-height: 3.2rem;
       text-align: left;
    justify-self: flex-start;
    }
  }

  
  &__subheader {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: @red-color;
    flex-shrink: 0;
  }

  &__subtitle {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: capitalize;
    color: @logo-red;
  }


  &__highlight {
    color: @link-color;
    font-weight: 600;
  }

  /* =============================================================
   * LEFT TRACK (Balanced with a matching header and inline CTAs)
   * ============================================================= */
  &__left-track {
    grid-area: left;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    

    @media (min-width: 992px) {
      align-items: flex-start;
      text-align: left;
    }
  }

  &__track-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__explainer-title {
   font-size: clamp(1rem, 0.35vw + 0.95rem, 1.15rem);
    line-height: 1.6;
    font-weight: 600;
    color: var(--text-color); // Or muted color to match trending header size/weight rhythm

    @media @phablet, @tablet {
      & span{
        display: inline-block;
      }

    }
  }

  &__explainer {
    margin: 0 0 0.5rem 0;
    font-weight: 400;
    font-size: clamp(1rem, 0.35vw + 0.95rem, 1.15rem);
    line-height: 1.6;
    color: var(--muted-text-color);
    max-width: 54ch;
    text-align: left;

    @media (min-width: 992px) {
      text-align: left;
    }
  }

  &__cta-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
justify-content: flex-start;
    @media (min-width: 992px) {
      justify-content: flex-start;
    }
  }

  /* =============================================================
   * RIGHT TRACK (Trending Today Pulse)
   * ============================================================= */
  &__trending {
    grid-area: trending;
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-color);
align-items: flex-start;
    @media (min-width: 992px) {
      align-items: flex-start;
      padding-top: 0;
      padding-left: 1.25rem;
      border-top: none;
      border-left: 1px solid var(--border-color);
    }
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

    @media (max-width: 991px) {
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
    color: var(--muted-text-color);
  }
}
/* =============================================================
 * REFINED TAG PILLS
 * ============================================================= */
.tag-pill {
  display: inline-flex;
  align-items: center;
  column-gap: 0.3rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--border-color);
  color: var(--muted-text-color);
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6rem;
  height: 1.9rem;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background-color: var(--light-background-color);
    border-color: var(--text-color);
    color: @link-color;
  }

  &--more {
    border-style: dashed;
    color: var(--text-color);
  }

  &__symbol {
    font-size: 0.82rem;
    font-weight: 400;
    opacity: 0.75;
  }

  &__metric {
    font-weight: 700;
    font-size: 0.8rem;
  }
}

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
  font-weight: 400;
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

@max-width: 1300px;
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
    grid-template-columns: repeat(4, 1fr); // 310px tracks at 1300px
    column-gap: @gutter-pct;
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

 @max-width: 1300px;
@gutter-pct: (20 / 1300) * 100%; // 1.5384615%
@focus-pct: (750 / 1300) * 100%;  // 57.6923077%
@roadmap-pct: (530 / 1300) * 100%; // 40.7692308%

/* =============================================================
 * LEVEL 1: Fluid 750px Focus + 530px Roadmap -> 750px Column <= 991px
 * ============================================================= */
.home-layout__level--focus {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  gap: @gutter-pct; // 20px at 1300px, scales smoothly down to ~15px at 992px
  width: 100%;

  /* At 991px and below: Stack into a centered 750px max-width column */
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: center;
    max-width: 750px;
    margin: 0 auto 2rem auto;
    gap: 1.5rem;
  }

  .card--focus {
    flex: 0 0 @focus-pct; // Exact 750px at 1300px; shrinks proportionally to ~572px at 992px
    min-width: 0;
    display: block;
    position: relative;

    @media (max-width: 991px) {
      flex: none;
      width: 100%; // Holds 750px from 991px down to 750px, then shrinks fluidly with viewport
    }

   .card__media {
      position: relative;
      width: 100%;
      height: 100%;
      aspect-ratio: 750 / 562;
      border-radius: 6px;
      overflow: hidden;

      @media (max-width: 991px) {
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
      color: #ffffff;
      //pointer-events: none;

      a, button {
        pointer-events: auto;
      }

      --text-color: #ffffff;
      --muted-text-color: #ffffff;
      --background-color: transparent;

      &--wrapper{
        max-width: @mod-width;
      }
    }

  @media (max-width: 599px) {
      .card__overlay-content {
        position: static;
        padding: 1rem 0 0;
        background: var(--background-color);
        color: var(--text-color);
        --text-color: inherit;
        --muted-text-color: inherit;
        --background-color: inherit
      }
    }
  }
}

/* =============================================================
 * RIGHT-HAND / STACKED ROADMAP
 * ============================================================= */
.roadmap-section--hero {
  flex: 1 1 @roadmap-pct; // Takes remaining 530px at 1300px, shrinking proportionally alongside Focus
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
  
  @media (max-width: 991px) {
    flex: none;
    width: 100%; // Matches the 750px Focus card width cleanly when stacked
  }

  .roadmap-section {
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
    color: var(--text-color);
    margin: 0 0 0.3rem 0;
    display: flex;
    align-items: center;
    column-gap: 0.4rem;

    svg {
      stroke: @logo-red;
      stroke-width: 2;
    }
  }

  &__subtitle {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
    color: var(--muted-text-color);

    button {
      border-bottom: 2px dotted var(--border-color);
      font-style: italic;
      color: var(--text-color);

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
      color: var(--text-color);
    }

    &__content {
      list-style: square;
      margin: 0 0 0 1rem;
      padding: 0;

      li {
        font-size: 0.875rem;
        color: var(--muted-text-color);
        line-height: 1.4;
        margin-bottom: 0.2rem;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .roadmap-section__footer {
    text-align: left;
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
   PATHWAY
   ================================================================---------- */


</style>