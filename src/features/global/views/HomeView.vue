<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { APIError } from '@/api/apiTypes'
import { useHomeStore } from '../stores/HomeStore'; 

// Import your sub-components (We map these next)
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import TaleListComponent from '@/features/tales/components/TaleListComponent.vue'
import InsightListComponent from '@/features/insights/components/InsightListComponent.vue'
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
  <section class="hero">
    
    <header class="hero__brand">
      <span class="hero__divider"></span>
      <img 
        src="@/assets/images/icon.png" 
        alt="OutScribed Logo" 
        class="hero__logo"
        width="100"
        height="100"
      />
      <span class="hero__divider"></span>
    </header>

    <div class="hero__content">
      <h3 class="hero__tagline">
        The Facts, The Fiction, 
        <span class="hero__tagline-break">& Everything In-Between</span>
      </h3>
      
      <h1 class="hero__title">
        We tell stories from <span class="hero__title-highlight">alternate realities.</span>
      </h1>
      
      <h2 class="hero__description">
        Blending logic & artistic freedom, our writers attempt to re-imagine the past, reframe the present, and sculpt the future.
      </h2>

      <div class="hero__cta">
        <RouterLink class="btn btn--primary hero__action" to="/faqs">
          More About OutScribed
        </RouterLink>
        <RouterLink class="btn btn--contrast hero__action" to="/register">
          Become An OutScriber
        </RouterLink>
      </div>
    </div>

  </section>
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

    <header class="page-header container">
      <h1>Recent Tales</h1>
      <RouterLink to="/tales" class="btn btn--primary"  title="Recent Tales"><span>View All</span></RouterLink>
    </header>
    
       <template v-if="homepageStore.tales && homepageStore.tales.length > 0">

         <div class="container">

            <TaleListComponent 
        v-for="tale in homepageStore.tales" 
        :key="tale.taleId" 
        :tale="tale" 
      />

        </div>

  </template>

    <template v-else>

        <div class="container">

     <PageStatusMessage 
              title="No Tale Found!" 
              message="We did not find any recent tale."
              icon="inbox" 
              :is-bordered="true"
            />
        </div>

  </template>

   <header class="page-header container">
      <h1>Recent Insights</h1>
      <RouterLink to="/insights" class="btn btn--primary"  title="Recent Insights"><span>View All</span></RouterLink>
    </header>
    
       <template v-if="homepageStore.insights && homepageStore.insights.length > 0">

         <div class="container">

            <InsightListComponent 
              v-for="insight in homepageStore.insights" 
              :key="insight.insightId" 
              :insight="insight"
            />

        </div>
    
  </template>

    <template v-else>

       <div class="container">

        <PageStatusMessage 
              title="No Insight Found!" 
              message="We did not find any recent insight."
              icon="inbox" 
              :is-bordered="true"
            />
        </div>

      </template>

      
  <div class="container">
        <h1 class="container__header">Categories Leaderboard</h1>
      </div>

         <div class="container">

           <CategoryComponent 
              v-for="(category, index) in homepageStore.categories" 
              :key="category.category"
              :category="category" 
              :index="index"
            />

        </div>

   <div class="container">
        <h1 class="container__header">Trending Recently</h1>
      </div>

       <template v-if="homepageStore.tags && homepageStore.tags.length > 0">

         <div class="container">

            <TagComponent 
              v-for="tag in homepageStore.tags" 
              :key="tag.tagId" 
              :tag="tag" 
            />

        </div>
    
  </template>

    <template v-else>

       <div class="container">

        <PageStatusMessage 
              title="No Tag Found!" 
              message="We did not find any trending tags."
              icon="inbox" 
              :is-bordered="true"
            />
        </div>


  </template>

   <div class="container">
        <h1 class="container__header">Country Leaderboard</h1>
      </div>

        <div class="container">

           <CountryComponent 
              v-for="(country, index) in homepageStore.countries" 
              :key="country.country"
              :country="country" 
              :index="index"
            />

        </div>

   <div class="container">
        <h1 class="container__header">Writer Leaderboard</h1>
      </div>

        <div class="container">

         <template v-for="(writer, index) in homepageStore.prolificWriters" :key="writer?.creator?.accountId || index">
          <WriterComponent 
            v-if="writer?.creator"
            :writer="writer" 
            :index="index"
          />
        </template>

        </div>

   <div class="container">
        <h1 class="container__header">And Introducing...</h1>
      </div>

        <div class="container">

         <!-- New Writers (Unranked - index omitted) -->
        <template v-for="writer in homepageStore.newWriters" :key="writer?.creator?.accountId">
          <WriterComponent 
            v-if="writer?.creator"
            :writer="writer" 
          />
        </template>

        </div>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/hero.less";
</style>
