<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { APIError } from '@/api/apiTypes'
import { useCountryStore } from '../stores/CountryStore.ts'; 

// Import your sub-components (We map these next)
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import TaleListComponent from '@/features/tales/components/TaleListComponent.vue'
import InsightListComponent from '@/features/insights/components/InsightListComponent.vue'
import TagComponent from '../components/TagComponent.vue'
import { useModalStore } from '@/stores/modalStore'
import CategoryComponent from '../components/CategoryComponent.vue';
import CountryComponent from '../components/CountryComponent.vue';
import WriterComponent from '../components/WriterComponent.vue';
import { toLongDate } from '@/utils/dateExtensions'

// 1. Setup Services & State
const countryStore = useCountryStore();
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 1. Fetch from store
  const { success, error } = await countryStore.loadcountries()

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving country metrics. Refresh page and try again.'
      );
  }
  }

  // No matter the result, stop loading
  isLoading.value = false

}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

// inside your HomeView.vue
onUnmounted(() => {
  countryStore.abort();
});

</script>

<template>

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

   <div class="container">
        <h1 class="container__header">Country Leaderboard</h1>
      </div>

         <template v-if="countryStore.countriesMetrics?.countries && countryStore.countriesMetrics.countries.length > 0">

        <div class="container">

           <CountryComponent 
              v-for="(country, index) in countryStore.countriesMetrics.countries" 
              :key="country.country"
              :country="country" 
              :index="index"
            />

          <div class="container__footer">
             <span class="container__divider"></span>
           <time class="container__text">Last Updated - {{ toLongDate(countryStore.countriesMetrics.lastUpdatedAt) }}</time>
             <span class="container__divider"></span>
          </div>

        </div>
    
  </template>

  

    <template v-else>

         <div class="container">

        <PageStatusMessage 
              title="Error Getting Countries!" 
              message="We encountered an error while retreiving countries leaderboard."
              icon="inbox" 
              :is-bordered="true"
            />
        </div>

      </template>
 
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/hero.less";
</style>
