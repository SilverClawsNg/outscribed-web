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
  const pillCategories = categories.slice(1, 6); // Takes up to the next 5 top categories as pills

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
      <SvgIcons name="trending" :size="50" />
      <h2 class="trending-section__title">trending </h2>
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

  <header class="homepage-header">
    <h2 class="homepage-header__title">
      Recent Tales
    </h2>
    <div class="homepage-header__lines">
      <p class="homepage-header__lines--item"></p>
      <p class="homepage-header__lines--item"></p>
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
            <p  class="categories">
            <RouterLink :to="`/tales?category=${homepageLayout.focus.category}`"
             :class="`categories__${CategoryClasses[homepageLayout.focus.category]}`">
              <span>{{ CategoryDescriptions[homepageLayout.focus.category] }}</span>
            </RouterLink>
          </p>
          <h1 class="tale-hero__title">
            <RouterLink :to="`/tale/${homepageLayout.focus.slug}`">{{ homepageLayout.focus.title }}</RouterLink>
          </h1>
          <p class="tale-hero__summary">{{ homepageLayout.focus.summary }}</p>
          <div class="tale-hero__meta">
            <span class="at">{{ homepageLayout.focus.creatorUsername }}</span>
            <span class="divider divider--circle"></span>
            <time>{{ toRelativeTime(homepageLayout.focus.createdAt) }}</time>
            <span class="divider divider--circle"></span>
             <span>{{ homepageLayout.focus.readingTime }} Min Read</span>
            <span class="divider divider--circle"></span>
            <RouterLink :to="`/tales?country=${homepageLayout.focus.country}`">
              <span>{{ CountryFlags(homepageLayout.focus.country) }}</span>
              <span>{{ homepageLayout.focus.country !== 'ZZ' ? homepageLayout.focus.country : 'Global' }}</span>
            </RouterLink>

          </div>
           <footer class="tale-footer">
            <RouterLink  class="tale-footer__read" :to="`/tale/${homepageLayout.focus.slug}`">Read&rarr;</RouterLink>
            <button class="tale-footer__save" @click="engage.favorite(homepageLayout.focus.engagement)">
              <SvgIcons name="bookmark" /> <span>Add to Favorites</span>
            </button>
          </footer>
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
       <p  class="categories">
            <RouterLink :to="`/tales?category=${tale.category}`"
             :class="`categories__${CategoryClasses[tale.category]}`">
              <span>{{ CategoryDescriptions[tale.category] }}</span>
            </RouterLink>
          </p>
      <h3 class="tale-strip__title">
        <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h3>
      <p class="tale-strip__summary">{{ tale.summary }}</p>
        <div class="tale-strip__meta">
            <span class="at">{{ homepageLayout.focus.creatorUsername }}</span>
            <span class="divider divider--circle"></span>
            <time>{{ toRelativeTime(homepageLayout.focus.createdAt) }}</time>
            <span class="divider divider--circle"></span>
             <span>{{ homepageLayout.focus.readingTime }} Min Read</span>
            <span class="divider divider--circle"></span>
            <RouterLink :to="`/tales?country=${homepageLayout.focus.country}`">
              <span>{{ CountryFlags(homepageLayout.focus.country) }}</span>
              <span>{{ homepageLayout.focus.country !== 'ZZ' ? homepageLayout.focus.country : 'Global' }}</span>
            </RouterLink>
          </div>
            <footer class="tale-footer">
            <RouterLink  class="tale-footer__read" :to="`/tale/${tale.slug}`">Read&rarr;</RouterLink>
            <button class="tale-footer__save" @click="engage.favorite(tale.engagement)">
              <SvgIcons name="bookmark" /> <span>Add to Favorites</span>
            </button>
          </footer>
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
              <p  class="categories">
            <RouterLink :to="`/tales?category=${homepageLayout.subfocus.category}`"
             :class="`categories__${CategoryClasses[homepageLayout.subfocus.category]}`">
              <span>{{ CategoryDescriptions[homepageLayout.subfocus.category] }}</span>
            </RouterLink>
          </p>
          <div class="tale-subfocus__content">
            
            <h3 class="tale-subfocus__title">
              <RouterLink :to="`/tale/${homepageLayout.subfocus.slug}`">{{ homepageLayout.subfocus.title }}</RouterLink>
            </h3>
          
          <p class="tale-subfocus__summary">{{ homepageLayout.subfocus.summary }}</p>
          <div class="tale-subfocus__meta">
            <span class="at">{{ homepageLayout.subfocus.creatorUsername }}</span>
            <span class="divider divider--circle"></span>
            <time>{{ toRelativeTime(homepageLayout.subfocus.createdAt) }}</time>
            <span class="divider divider--circle"></span>
             <span>{{ homepageLayout.subfocus.readingTime }} Min Read</span>
            <span class="divider divider--circle"></span>
            <RouterLink :to="`/tales?country=${homepageLayout.subfocus.country}`">
              <span>{{ CountryFlags(homepageLayout.focus.country) }}</span>
              <span>{{ homepageLayout.subfocus.country !== 'ZZ' ? homepageLayout.focus.country : 'Global' }}</span>
            </RouterLink>

          </div>
            <footer class="tale-footer">
            <RouterLink  class="tale-footer__read" :to="`/tale/${homepageLayout.subfocus.slug}`">Read&rarr;</RouterLink>
            <button class="tale-footer__save" @click="engage.favorite(homepageLayout.subfocus.engagement)">
              <SvgIcons name="bookmark" /> <span>Add to Favorites</span>
            </button>
          </footer>
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
               <p  class="categories">
                <RouterLink :to="`/tales?category=${tale.category}`"
                :class="`categories__${CategoryClasses[tale.category]}`">
                  <span>{{ CategoryDescriptions[tale.category] }}</span>
                </RouterLink>
              </p>
              <h4 class="tale-subside__title">
                <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
              </h4>
              <p class="tale-subside__summary">{{ tale.summary }}</p>
                <div class="tale-subside__meta">
            <span class="at">{{ homepageLayout.focus.creatorUsername }}</span>
            <span class="divider divider--circle"></span>
            <time>{{ toRelativeTime(homepageLayout.focus.createdAt) }}</time>
            <span class="divider divider--circle"></span>
             <span>{{ homepageLayout.focus.readingTime }} Min Read</span>
            <span class="divider divider--circle"></span>
            <RouterLink :to="`/tales?country=${homepageLayout.focus.country}`">
              <span>{{ CountryFlags(homepageLayout.focus.country) }}</span>
              <span>{{ homepageLayout.focus.country !== 'ZZ' ? homepageLayout.focus.country : 'Global' }}</span>
            </RouterLink>

          </div>
           <footer class="tale-footer">
            <RouterLink  class="tale-footer__read" :to="`/tale/${tale.slug}`">Read&rarr;</RouterLink>
            <button class="tale-footer__save" @click="engage.favorite(tale.engagement)">
              <SvgIcons name="bookmark" /> <span>Add to Favorites</span>
            </button>
          </footer>
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
           <p  class="categories">
            <RouterLink :to="`/tales?category=${tale.category}`"
             :class="`categories__${CategoryClasses[tale.category]}`">
              <span>{{ CategoryDescriptions[tale.category] }}</span>
            </RouterLink>
          </p>
          <h4 class="tale-sidebar__title">
            <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
          </h4>
           <p class="tale-sidebar__summary">{{ tale.summary }}</p>
        <div class="tale-sidebar__meta">
            <span class="at">{{ homepageLayout.focus.creatorUsername }}</span>
            <span class="divider divider--circle"></span>
            <time>{{ toRelativeTime(homepageLayout.focus.createdAt) }}</time>
            <span class="divider divider--circle"></span>
             <span>{{ homepageLayout.focus.readingTime }} Min Read</span>
            <span class="divider divider--circle"></span>
            <RouterLink :to="`/tales?country=${homepageLayout.focus.country}`">
              <span>{{ CountryFlags(homepageLayout.focus.country) }}</span>
              <span>{{ homepageLayout.focus.country !== 'ZZ' ? homepageLayout.focus.country : 'Global' }}</span>
            </RouterLink>

          </div>
            <footer class="tale-footer">
            <RouterLink  class="tale-footer__read" :to="`/tale/${tale.slug}`">Read&rarr;</RouterLink>
            <button class="tale-footer__save" @click="engage.favorite(tale.engagement)">
              <SvgIcons name="bookmark" /> <span>Add to Favorites</span>
            </button>
          </footer>
        </div>
      </article>
    </aside>

  </div>

  
  <header class="homepage-header">
    <h2 class="homepage-header__title">
      Top Categories
    </h2>
    <div class="homepage-header__lines">
      <p class="homepage-header__lines--item"></p>
      <p class="homepage-header__lines--item"></p>
    </div>
              <RouterLink to="/categories"  class="btn btn--primary">
                Explore Categories
              </RouterLink>
            </header>


  <div class="homepage-discoveries" v-if="categorizedTales.focusCategory">
  
  <!-- 1. FOCUS CATEGORY (Most tales - styled prominently) -->

  <div class="homepage-discoveries__focus">
    
      <article class="discovery-card discovery-card--focus">

          <h3 class="discovery-card__title discovery-card__title--focus">

            <span class="hash">#</span>{{ CategoryDescriptions[categorizedTales.focusCategory.category] }}
            </h3>

            <p class="discovery-card__summary discovery-card__summary--focus">
              {{ CategorySummaries[categorizedTales.focusCategory.category] }}
            </p>

              <div class="discovery-card__actions discovery-card__actions--focus">

                    <button 
                        type="button" 
                        class="btn btn--primary btn--outscribe"
                        @click="modalStore.push('CreateTale', 'Create Tale', { category: categorizedTales.focusCategory.category })"
                        title="OutScribe a new tale"
                      >
                      OutScribe
                      </button>
                       <RouterLink 
                    :to="`/tales?category=${categorizedTales.focusCategory.category}`" 
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': categorizedTales.focusCategory.talesCounter === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(categorizedTales.focusCategory.talesCounter) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

      </article>
 

  </div>

   <div class="homepage-discoveries__pills">

       <article 
          v-for="pill in categorizedTales.pillCategories" 
          :key="pill.category"
          class="discovery-card discovery-card--pill">

          <h3 class="discovery-card__title discovery-card__title--pill">

            <span class="hash">#</span>{{ CategoryDescriptions[pill.category] }}
            </h3>

            <p class="discovery-card__summary discovery-card__summary--pill">
              {{ CategorySummaries[pill.category] }}
            </p>

              <div class="discovery-card__actions discovery-card__actions--pill">
                 
                    <button 
                        type="button" 
                        class="btn btn--primary btn--outscribe"
                        @click="modalStore.push('CreateTale', 'Create Tale', { category: pill.category })"
                        title="OutScribe a new tale"
                      >
                      OutScribe
                      </button>
                        <RouterLink 
                    :to="`/tales?category=${pill.category}`" 
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': pill.talesCounter === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(pill.talesCounter) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

      </article>
    
  </div>

  
 
</div>


 <header class="homepage-header">
    <h2 class="homepage-header__title">
      Top Countries
    </h2>
    <div class="homepage-header__lines">
      <p class="homepage-header__lines--item"></p>
      <p class="homepage-header__lines--item"></p>
    </div>
              <RouterLink to="/countries"  class="btn btn--primary">
                Explore Countries
              </RouterLink>
            </header>

  <div class="homepage-discoveries" v-if="countriesTales.focusCountry">
  
  <!-- 1. FOCUS COUNTRY (Most tales - styled prominently) -->

  <div class="homepage-discoveries__focus">
    
      <article class="discovery-card discovery-card--focus">

          <h3 class="discovery-card__title discovery-card__title--focus">

            <span class="flag">{{ CountryFlags(countriesTales.focusCountry.country) }}</span>{{ CountryDescriptions[countriesTales.focusCountry.country] }}

            </h3>

              <div class="discovery-card__actions discovery-card__actions--focus">

                    <button 
                        type="button" 
                        class="btn btn--primary btn--outscribe"
                        @click="modalStore.push('CreateTale', 'Create Tale', { country: countriesTales.focusCountry.country })"
                        title="OutScribe a new tale"
                      >
                      OutScribe
                      </button>
                       <RouterLink 
                    :to="`/tales?country=${countriesTales.focusCountry.country}`" 
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': countriesTales.focusCountry.talesCounter === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(countriesTales.focusCountry.talesCounter) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

      </article>
 

  </div>

   <div class="homepage-discoveries__pills">

       <article 
          v-for="pill in countriesTales.pillCountries" 
          :key="pill.country"
          class="discovery-card discovery-card--pill">

          <h3 class="discovery-card__title discovery-card__title--pill">

            <span class="flag">{{ CountryFlags(pill.country) }}</span>{{ CountryDescriptions[pill.country] }}
            </h3>

              <div class="discovery-card__actions discovery-card__actions--pill">
                 
                    <button 
                        type="button" 
                        class="btn btn--primary btn--outscribe"
                        @click="modalStore.push('CreateTale', 'Create Tale', { country: pill.country })"
                        title="OutScribe a new tale"
                      >
                      OutScribe
                      </button>
                        <RouterLink 
                    :to="`/tales?country=${pill.country}`" 
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': pill.talesCounter === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(pill.talesCounter) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

      </article>
    
  </div>
 
</div>


  <header class="homepage-header">
    <h2 class="homepage-header__title">
      Top / Recent Writers
    </h2>
    <div class="homepage-header__lines">
      <p class="homepage-header__lines--item"></p>
      <p class="homepage-header__lines--item"></p>
    </div>
              <RouterLink to="/writers"  class="btn btn--primary">
                Explore Writers
              </RouterLink>
            </header>


  <div class="homepage-writers">
  
   <div class="homepage-writers__pills">

       <article 
          v-for="writer in homepageStore.prolificWriters" 
          :key="writer.creator.accountId"
          class="discovery-card discovery-card--pill">

          <h3 class="discovery-card__title discovery-card__title--pill at">
             {{ writer.creator.username }}
            </h3>

              <div class="discovery-card__actions discovery-card__actions--pill">
                 
                    <button 
                      type="button" 
                      class="btn btn--primary btn--is-outscribe"
                      :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                      @click="engage.favorite(writer.creator.engagement)"
                    >
                    {{ getEngagementMetadata(writer.creator.engagement).favoriteAltText }}
                    </button>
                        <RouterLink 
                    :to="`/tales?username=${writer.creator.username}`" 
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': writer.creator.talesCount === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(writer.creator.talesCount) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

      </article>
    
  </div>
  
   <div class="homepage-writers__pills">

       <article 
          v-for="writer in homepageStore.newWriters" 
          :key="writer.creator.accountId"
          class="discovery-card discovery-card--pill">

          <h3 class="discovery-card__title discovery-card__title--pill at">
             {{ writer.creator.username }}
            </h3>

              <div class="discovery-card__actions discovery-card__actions--pill">
                 
                    <button 
                      type="button" 
                      class="btn btn--primary btn--is-outscribe"
                      :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                      @click="engage.favorite(writer.creator.engagement)"
                    >
                    {{ getEngagementMetadata(writer.creator.engagement).favoriteAltText }}
                    </button>
                        <RouterLink 
                    :to="`/tales?username=${writer.creator.username}`" 
                    class="discovery-card__metric-link"
                    :class="{ 'disabled': writer.creator.talesCount === 0 }"
                    title="Filter Tales"
                  >
                    <span class="discovery-card__metric-value">{{ formatCounts(writer.creator.talesCount) }}</span>
                    <span class="discovery-card__metric-label">Tales&rarr;</span>
                  </RouterLink>

              </div>

      </article>
    
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

   .homepage-header{
    width: @max-width;
    max-width: calc(100% - 20px);
    margin: 0 auto 1rem auto;
    padding: 1rem 0;
    display: flex;
    align-items:center;

    &__title{
      text-transform: uppercase;
      font-weight: 600;
    }

    &__lines{
      display: flex;
      flex-direction: column;
      row-gap: 0.2rem;
      justify-content: center;
      flex-grow: 1;
      margin: 0 0.5rem;

      &--item{
        height: 1px;
        background-color: var(--border-color);
        width: 100%;
      }
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
  background-color: @link-color;
  padding: 1rem;
  margin-bottom: 1rem;
  color:@white-color;
 
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
      font-size: 2.6rem;
      line-height: 2.8rem;
    }
  }

  &__explainer {
    font-weight: 500;
    font-size: clamp(1rem, 1.2vw + 1rem, 1.12rem);
    line-height: clamp(1.4rem, 1.2vw + 1rem, 1.5rem);
    margin-bottom: 0.75rem;
    text-align: center;
    margin-bottom: 1rem;
    font-family: Inter, sans-serif;
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
     border-color:@link-alt-color;

      &:hover {
        background-color: darken(#00a0ff, 5%);
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
  margin: 1rem 0 2rem 0;
  padding-bottom:1rem;
  border-bottom:1px solid var(--border-color);
  

  &__wrapper{
  display:flex;
  column-gap: 0.5rem;
   width: @max-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    color: @red-color;
    column-gap: 0.25rem;
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

  & .categories{
    margin-bottom: 0.5rem;
  }

  
  & .tale-footer {
    display: flex;
    justify-content: flex-start;
    align-items:center;
    column-gap: 0.75rem;
    width: 100%;
    margin-top: 1rem;
    font-weight: normal;
     font-size: 0.9rem;
    
  &__read {
     background-color: var(--background-color);
     border:1px solid var(--border-color);
     padding: 0.5rem 0.75rem;
     border-radius: 99999px;
     color: var(--muted-text-color);
     

      &:hover {
        background-color: var(--light-background-color);
        color: @link-color;
      }
    }

    &__save{
      display: flex;
      align-items:center;
      column-gap: 0.15rem;
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

  &__title{
    font-size:2rem;
    line-height: 2.2rem;
    font-weight:700;
    margin-bottom: 0.5rem;

  }

  &__summary{
    color: var(--muted-text-color);
    margin-bottom: 0.5rem;
  }

  &__meta{
    font-size:0.85rem;
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

  &__content {
    
    width: 100%;

    @media @tablet, @phablet {
      width: 55%;
    }
  }
  
     &__title{
    font-size:1.2rem;
    line-height: 1.4rem;
    font-weight:700;
    margin-bottom: 0.5rem;

  }

  &__summary{
    color: var(--muted-text-color);
    margin-bottom: 0.5rem;
  }

  &__meta{
    font-size:0.85rem;
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

   &__title{
    font-size:2rem;
    line-height: 2.2rem;
    font-weight:700;

  }


  &__summary{
    font-family: Inter, sans-serif;
    color: var(--muted-text-color);
    margin-bottom: 0.5rem;
  }

  &__meta{
    font-size:0.85rem;
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

   &__title{
    font-size:1.2rem;
    line-height: 1.4rem;
    font-weight:700;
    margin-bottom: 0.5rem;

  }

  &__summary{
    color: var(--muted-text-color);
    margin-bottom: 0.5rem;
  }

  &__meta{
    font-size:0.85rem;
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
 
     &__title{
    font-size:1.2rem;
    line-height: 1.4rem;
    font-weight:700;
    margin-bottom: 0.5rem;

  }

  &__summary{
    font-family: Inter, sans-serif;
    color: var(--muted-text-color);
    margin-bottom: 0.5rem;
  }

  &__meta{
    font-size:0.85rem;
  }
}

/* ==========================================================================
   DISCOVERIES
   ================================================================---------- */

   .homepage-discoveries{
   
    max-width: calc(100% - 20px);
    margin: 0 auto;
    display: flex;
    gap: 2rem;
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

     &__focus{
      height: auto;
     
       background-color: @link-color;
        border-radius: 21px;
         display: flex;
        flex-direction: column;
        justify-content: flex-start;
         background-image: url("@/assets/images/patterns-background(1).png");
  background-position-x: right;
  background-position-y: bottom;
  background-repeat: no-repeat;
  background-position: contain;
  
    @media @tablet, @phablet, @phone{
  width: 100%;
  }

  @media @desktop, @laptop{
 width: 35%;
  }
     }

     &__pills{
      
      gap: 1rem;
      display: grid;
      
      @media @tablet, @phablet{
  width: 100%;
  grid-template-columns: 1fr;

  }
      
    @media @tablet, @phablet{
  width: 100%;
  grid-template-columns: 1fr 1fr;

  }

       @media @desktop, @laptop{
    width: 65%;
    grid-template-columns: 1fr 1fr;

       }
     }

   }

   .homepage-writers{
   
    max-width: calc(100% - 20px);
    margin: 0 auto;
    display: flex;
    gap: 2rem;
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
   DISCOVERY CARDS
   ================================================================---------- */


    .discovery-card {

      &--focus{
        
        color:@white-color;
        width: 100%;
        height: auto;
        padding: 1rem;
       

      &  .discovery-card__metric-link{
          color:@white-color;
        }
       
      }

    &--pill{
      border: 1px solid var(--border-color);
      width: 100%;
      padding: 1rem 0.5rem;
      border-radius: 12px;
      
      }

  &__title {
   
    margin-bottom: 0.5rem;
    font-weight: 600;

    &--focus{
      font-size: 1.5rem;
    }

     &--pill{
      font-size: 1.1rem;
    }
  & span.hash{
    font-size: 0.9rem;
    font-weight: normal;
  }

  & span.flag{
    margin-right: 0.5rem;
  }
  }

&__summary{
 

    &--focus{
      font-size: 1rem;
    }

  &--pill{
     color: var(--muted-text-color);
     font-size:0.9rem;
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

     &--categories{
    color:@white-color;
  }

  }

  &__metric-value {
    font-weight: 700;
  }

  &__metric-label {
    font-weight: 400;
    
  }

  &__actions{
    display: flex;
    column-gap: 1rem;
     margin-top: 1.5rem;

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