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

// 1. Setup Services & State
const homepageStore = useHomeStore();

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
    <div class="hero">
      <div class="hero__text">
        <h3>The Facts, The Fiction, <span>& Everything In-Between</span></h3>
        <h1>We tell stories from <span class="highlight">alternate realities.</span></h1>
        <h2>
          Blending logic & artistic freedom, our writers attempt to re-imagine the past, reframe the present, and sculpt the future.
        </h2>

        <div class="hero__cta">
          <RouterLink class="btn primary" to="/faqs">Learn More</RouterLink>
          <RouterLink class="btn contrast" to="/register">Join Us</RouterLink>
        </div>
      </div>

      <div class="hero__image-container">
        <div class="hero__image">
          <img src="@/assets/images/hero-background.png" alt="OutScribed Hero Background" />
        </div>
      </div>
    </div>
  </div>

   <template v-if="isLoading">

    <div class="loader-container">
      <p class="loader"></p>
    </div>

  </template>

  <template v-else-if="loadingError">

    <PageStatusMessage 
      :title="loadingError.title || 'Error Occured!'" 
      :message="loadingError.detail || 'An unknown error loading homepage contents'">
    </PageStatusMessage>
    
  </template>

  <template v-else>

      <div class="shared__page-title">
        <h1>Recent Tales</h1>
      <RouterLink class="btn primary" to="/tales" title="Tales">View All</RouterLink>
      </div>

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
      title= 'No content!'
      message='Sorry. We could not find any tale'>
    </PageStatusMessage>

  </template>
    
      <div class="shared__page-title">
        <h1>Recent Insights</h1>
      <RouterLink class="btn primary" to="/insights" title="Insights">View All</RouterLink>
      </div>

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
      title= 'No content!'
      message='Sorry. We could not find any insight'>
    </PageStatusMessage>

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
      title= 'No tags!'
      message='Sorry. We could not find any tags'>
    </PageStatusMessage>

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
      title= 'No tags!'
      message='Sorry. We could not find any tags'>
    </PageStatusMessage>

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
      title= 'No tags!'
      message='Sorry. We could not find any tags'>
    </PageStatusMessage>

  </template>
    
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/hero.less";
</style>