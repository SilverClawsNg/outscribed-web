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
    <div class="hero__text">
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
        <RouterLink class="btn primary hero__action" to="/faqs">Learn More</RouterLink>
        <RouterLink class="btn contrast hero__action" to="/register">Join Us</RouterLink>
      </div>
    </div>

    <div class="hero__image-container">
      <figure class="hero__image">
        <img 
          src="@/assets/images/hero-background.png" 
          alt="OutScribed Hero Background" 
          class="hero__img"
        />
      </figure>
    </div>
  </section>
</div>

   <template v-if="isLoading">

    <div class="loader-container">
      <p class="loader"></p>
    </div>

  </template>

   <template v-else-if="loadingError">

     <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'"
      icon="warning"
      :is-standalone="true">
        <template v-if="loadingError.definition" #actions>
           <button class="btn primary" @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
    </PageStatusMessage>

  </template>

  <template v-else>

    <header class="page-header shared__container">
      <h1>Recent Tales</h1>
      <RouterLink to="/tales" class="btn primary" title="Recent Tales"><span>View All</span></RouterLink>
    </header>
    
       <template v-if="homepageStore.tales && homepageStore.tales.length > 0">

         <div class="shared__container">

            <TaleListComponent 
        v-for="tale in homepageStore.tales" 
        :key="tale.taleId" 
        :tale="tale" 
      />

        </div>

  </template>

    <template v-else>

     <PageStatusMessage 
              title="No Tale Found!" 
              message="We could not retrieve any recent tale."
              icon="broken-chain" 
              :is-bordered="true"
            />

  </template>

   <header class="page-header shared__container">
      <h1>Recent Insights</h1>
      <RouterLink to="/insights" class="btn primary" title="Recent Insights"><span>View All</span></RouterLink>
    </header>
    
       <template v-if="homepageStore.insights && homepageStore.insights.length > 0">

         <div class="shared__container">

            <InsightListComponent 
        v-for="insight in homepageStore.insights" 
        :key="insight.insightId" 
        :insight="insight"
      />

        </div>
    
  </template>

    <template v-else>

        <PageStatusMessage 
              title="No Insight Found!" 
              message="We could not retrieve any recent insight."
              icon="broken-chain" 
              :is-bordered="true"
            />
      </template>

   <div class="shared__page-title">
        <h1>Trending This Week</h1>
      </div>

       <template v-if="homepageStore.trendingThisWeek && homepageStore.trendingThisWeek.length > 0">

         <div class="shared__container">

            <TagComponent 
        v-for="tag in homepageStore.trendingThisWeek" 
        :key="tag.tagId" 
        :tag="tag" 
      />

        </div>
    
  </template>

    <template v-else>

        <PageStatusMessage 
              title="No Tag Found!" 
              message="We could not retrieve trending tags for this week."
              icon="broken-chain" 
              :is-bordered="true"
            />

  </template>

  <div class="shared__page-title">
        <h1>Trending This Month</h1>
      </div>

       <template v-if="homepageStore.trendingThisMonth && homepageStore.trendingThisMonth.length > 0">

         <div class="shared__container">

            <TagComponent 
        v-for="tag in homepageStore.trendingThisMonth" 
        :key="tag.tagId" 
        :tag="tag" 
      />

        </div>
    
  </template>

    <template v-else>

      <PageStatusMessage 
              title="No Tag Found!" 
              message="We could not retrieve trending tags for this month."
              icon="broken-chain" 
              :is-bordered="true"
            />

  </template>

  <div class="shared__page-title">
        <h1>Trending This Year</h1>
      </div>

       <template v-if="homepageStore.trendingThisYear && homepageStore.trendingThisYear.length > 0">

         <div class="shared__container">

            <TagComponent 
        v-for="tag in homepageStore.trendingThisYear" 
        :key="tag.tagId" 
        :tag="tag" 
      />

        </div>
    
  </template>

    <template v-else>

    <PageStatusMessage 
              title="No Tag Found!" 
              message="We could not retrieve trending tags for this year."
              icon="broken-chain" 
              :is-bordered="true"
            />

  </template>
    
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/hero.less";
</style>
