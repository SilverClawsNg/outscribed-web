<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { APIError } from '@/api/apiTypes'
import { useHomeStore } from '../stores/HomeStore'; 
import { type TaleListDto } from '@/features/tales/types/TalesTypes';

// Sub-components & Stores
import { useModalStore } from '@/stores/modalStore'
import { mediaHelper } from '@/utils/mediaHelper'
import { CategoryClasses, CategoryDescriptions, CategorySummaries, CountryDescriptions, CountryFlags } from '@/utils/descriptors'
import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import SvgIcons from '@/components/SvgIcons.vue';
import { useLoginHint } from '@/utils/authHelper'
import { curateHomepageTales } from '@/utils/curateHomepageTales';
import TaleDetailComponent from '@/features/tales/components/TaleDetailComponent.vue';
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

    <div class="homepage-hero__wrapper">

    <div class="homepage-hero__container">
      
      <h1 class="homepage-hero__title">
        The reality you know is just one version.
      </h1>

      <div class="homepage-hero__image">
        <p></p>
        <img src="@/assets/images/icon.png" />
        <p></p>
      </div>
      
      <h2 class="homepage-hero__explainer">
        Blending logic and artistic freedoms, our stories re-imagine the past, 
        reframe the present, and sculpt futures.
      </h2>

      <div class="homepage-hero__cta-group">
        <RouterLink class="homepage-hero__cta homepage-hero__cta--about" to="/faqs">
          About Us
        </RouterLink>
        <button class="homepage-hero__cta homepage-hero__cta--join" @click="handleJoinClick">
          Join
        </button>
      </div>
    </div>
    </div>

  </div>

  <div class="trending-section">

    <div class="trending-section__wrapper">

    <div class="trending-section__header">
      <SvgIcons name="trending" :size="80" />
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

  <div class="homepage-layout" v-if="homepageLayout.focus">

    <!-- ==========================================
         MAIN LEFT REGION (75% on Desktop)
         ========================================== -->
    <div class="homepage-layout__main">

      <!-- 1. FOCUS TALE (Must have image) -->
      <article class="tale-hero">
      
    <div class="tale-hero__content">

       <TaleTextComponent 
              :tale="homepageLayout.focus" 
              type="focus" 
            />

        </div>

        <div v-if="homepageLayout.focus.photo" class="tale-hero__media">
          <img :src="mediaHelper.getUrl(homepageLayout.focus.photo, 'tales', 'full')" :alt="homepageLayout.focus.title" />
        </div>

      </article>

      <!-- 3. NONES STRIP (3 items - Enforces All-or-Nothing images Symmetry) -->
      <div class="tale-strip">

      <article 
    v-for="tale in homepageLayout.nones" 
    :key="tale.taleId" 
    class="tale-strip__card"
  >
    <!-- Renders image only if ALL nones have images; otherwise hidden for uniform text layout -->
    <div v-if="tale.photo" class="tale-strip__media">
      <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
    </div>

      <div class="tale-strip__content">

      <TaleTextComponent 
              :tale="tale" 
              type="pill" 
            />

        </div>


      </article>
      </div>

      <!-- ANCHOR REGION (Sub-Focus + Sub-Focus Sidebars) -->
      <div class="tale-anchor">

        <!-- 4. SUB-FOCUS (Must have image) -->
        <article v-if="homepageLayout.subfocus" class="tale-subfocus">

          <div class="tale-subfocus__media">
            <img :src="mediaHelper.getUrl(homepageLayout.subfocus.photo, 'tales', 'full')" :alt="homepageLayout.subfocus.title" />
          </div>

            <div class="tale-subfocus__content">

            <TaleTextComponent 
              :tale="homepageLayout.subfocus" 
              type="focus" 
            />

        </div>
         
            

        </article>

        <!-- 5. SUB-FOCUS SIDEBARS (2 items) -->
        <div class="tale-subside-group">
          <article 
            v-for="tale in homepageLayout.subside" 
            :key="tale.taleId" 
            class="tale-subside"
          >
            <div v-if="tale.photo" class="tale-subside__media">
              <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
            </div>

              <div class="tale-subside__content">

           <TaleTextComponent 
              :tale="tale" 
              type="pill" 
            />

        </div>

          
          </article>
        </div>

      </div>

    </div>

    <!-- ==========================================
         RIGHT SIDEBAR REGION (25% on Desktop - 3 items)
         ========================================== -->
    <aside class="homepage-layout__sidebar">
      <article 
        v-for="tale in homepageLayout.sidebar" 
        :key="tale.taleId" 
        class="tale-sidebar"
      >
        <div v-if="tale.photo" class="tale-sidebar__media">
          <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
        </div>

        <div class="tale-sidebar__content">

           <TaleTextComponent 
              :tale="tale" 
              type="pill" 
            />

        </div>
        
      </article>

    </aside>

  </div>
  
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
                Agree to platform's legal & structural statements with a single check.
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
                Move over to the <strong>Editor</strong> to write your story.
              </li>
              <li>
                Complete story's basic information, reality check, and optional photo & tags.
              </li>
            </ul>          </div>

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
  background-color: @link-color;
  padding: 1rem;
  margin-bottom: 1rem;
  color:@white-color;
  background-image: url("@/assets/images/patterns-background.png");
  background-position-x: right;
  background-position-y: bottom;
  background-repeat: no-repeat;
  background-position: contain;
  
  @media @phone{
background-size: 40%;
  }

  &__wrapper{
    width: @max-width;
    max-width: calc(100% - 20px);
    justify-content: center;
    display: flex;
    align-items: center;
    margin: 0 auto;
  }
 
  &__container {
    position: relative;
    height: auto;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
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
    margin: 0.5rem 0;
    width:100%;

    & p{ 
      flex-grow: 1;
      height: 2px;
      background-color: @white-color;
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
    text-transform: uppercase;
    text-align: center;

    @media @phone {
      font-size: 1.8rem;
      line-height: 2rem;
    }
    @media @phablet {
      font-size: 2.2rem;
      line-height: 2.4rem;
    }
    @media @largeDevice {
      font-size: 2.8rem;
      line-height: 3rem;
    }
  }

  &__explainer {
    font-weight: 500;
    font-size: clamp(1rem, 1.2vw + 1rem, 1.3rem);
    line-height: clamp(1.4rem, 1.2vw + 1rem, 1.5rem);
    margin-bottom: 0.75rem;
    text-align: center;
    margin-bottom: 1rem;
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
    text-transform: capitalize;
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

.homepage-layout {
  margin: 0 auto;
  display: flex;
  gap: 1.5rem;
  max-width: calc(100% - 20px);
  margin-bottom: 3rem;

  /* Device Max-Width Peaks & Container Centralization */
  @media @phone {
    width: @min-width;
    flex-direction: column;
  }

  @media @tablet, @phablet {
    width: @mid-width;
    flex-direction: column;
  }

  @media @laptop, @desktop {
    width: @max-width;
  }

  &__main {
    display: flex;
    flex-direction: column;
    height: auto;

    @media @tablet, @phablet, @phone {
      width: 100%;
      gap: 1.5rem;
    }

    @media @desktop, @laptop {
      width: 75%;
      gap: 4rem; 
    }
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @media @tablet, @phablet, @phone {
      width: 100%;
    }

    @media @desktop, @laptop {
      width: 25%;
    }
  }


}

/* --------------------------------------------------------------------------
   1. TALE HERO (Focus Story - Max-Width Capped at 750px & Centralized)
   -------------------------------------------------------------------------- */

.tale-hero {
  width: 100%;
  display: flex;
  gap: 1.5rem;
  align-items: stretch;

   @media @tablet {
     max-width: @mid-width; /* Card level dimension cap */
  }

   @media @tablet, @phablet, @phone {
    margin: 0 auto;   /* Keeps entire story centralized */
  }

  @media @tablet, @phablet, @phone {
    flex-direction: column-reverse;
  }


  &__media {
    flex: 1;
    aspect-ratio: 750 / 562;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &__content {
    
    width: 100%;

    @media @desktop, @laptop {
      flex: 0 0 311px;
    }
  }
}

/* --------------------------------------------------------------------------
   3. TALE STRIP (Nones - Thumbnail Stories Capped at 450px)
   -------------------------------------------------------------------------- */

.tale-strip {
  width: 100%;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media @tablet, @phablet, @phone {
    flex-direction: column;
  }

   @media @desktop, @laptop{
    margin: 4rem 0;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-width: 0;

    /* Card level dimension cap and centralization */
    width: 100%;
    max-width: @min-width;
    margin: 0 auto;

    @media @tablet, @phablet {
      flex-direction: row;
      max-width: @mid-width; /* Expands symmetrically on tablet when switching to row layout */
    }
  }

  &__media {
    width: 100%;
    aspect-ratio: 450 / 337;
    border-radius: 8px;
    overflow: hidden;

    @media @tablet, @phablet {
      width: 45%;
      height: auto;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }

}

/* --------------------------------------------------------------------------
   ANCHOR REGION (Sub-Focus & Sub-Sidebars)
   -------------------------------------------------------------------------- */

.tale-anchor {
  width: 100%;
  display: flex;
  gap: 1.5rem;

  @media @tablet, @phablet, @phone {
    flex-direction: column;
  }
}

/* 4. SUB-FOCUS (Story Capped at 750px & Centralized) */
.tale-subfocus {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: @mid-width;
  margin: 0 auto;

  @media @desktop, @laptop {
    width: 65%;
  }

  &__media {
    width: 100%;
    aspect-ratio: 750 / 562;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &__content {
    
    width: 100%;
  }

}

/* 5. SUB-SIDEBAR GROUP & CARDS (Story Capped at 450px & Centralized) */
.tale-subside-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  @media @desktop, @laptop {
    width: 35%;
  }
}

.tale-subside {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: @min-width;
  margin: 0 auto;

  @media @tablet, @phablet {
    flex-direction: row;
    max-width: @mid-width;
  }

  &__media {
    width: 100%;
    aspect-ratio: 450 / 337;
    border-radius: 8px;
    overflow: hidden;

    @media @tablet, @phablet {
      width: 45%;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &__content {
    
    width: 100%;

    @media @tablet, @phablet {
      width: 55%;
    }
  }

}

/* 2. SIDEBAR STORIES (Story Capped at 450px & Centralized) */
.tale-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: @min-width;
  margin: 0 auto;

  @media @tablet, @phablet {
    flex-direction: row;
    max-width: @mid-width;
  }

  &__media {
    width: 100%;
    aspect-ratio: 450 / 337;
    border-radius: 8px;
    overflow: hidden;

    @media @tablet, @phablet {
      width: 45%;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &__content {
    
    width: 100%;

    @media @tablet, @phablet {
      width: 55%;
    }

  }
 
}

/* ==========================================================================
   DISCOVERIES
   ================================================================---------- */


   .homepage-writers{
   
    max-width: calc(100% - 20px);
    margin: 0 auto;
    display: flex;
    //gap: 2rem;
    margin-bottom: 3rem;

    @media @phablet, @phone{
  width: @min-width;
  flex-direction: column;

  }


    @media @tablet{
  width: @mid-width;
  }
    
  @media @desktop, @laptop{
  width: @max-width;
  }

  
     &__pills{
      
      gap: 1rem;
      display: grid;

      @media @phone, @phablet{
        
  &:first-child{
    margin-bottom: 1.5px;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);

  }

   &:last-child{
    margin-top: 1.5px;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);

  }
      }

      
  @media @desktop, @laptop, @tablet{
    &:first-child{
      margin-right: 1.5px;
    padding-right: 1rem;
    border-right: 1px solid var(--border-color);

  }

   &:last-child{
    margin-left: 1.5px;
    padding-left: 1rem;
    border-left: 1px solid var(--border-color);

  }
  }
      
      @media @tablet, @phablet{
  width: 100%;
  grid-template-columns: 1fr;

  }
      
    @media @tablet, @phablet{
  width: 100%;
  grid-template-columns: 1fr 1fr;

  }

       @media @desktop, @laptop{
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
  margin: 0 auto;
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