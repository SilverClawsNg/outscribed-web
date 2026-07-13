<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, computed, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useInsightListStore } from '../stores/InsightListStore'; 
import { useInsightListFilterStore } from '../stores/InsightListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import InsightListComponent from '../components/InsightListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'

// --- INITIALIZE STORES ---
const insightStore = useInsightListStore();
const insightFilterStore = useInsightListFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)

// --- ROUTE OPTIONS ---
const relationType = computed(() => route.params.relationType as string || '')
const creatorUsername = computed(() => route.params.creatorUsername as string || '')

const currentPath = encodeURIComponent(route.fullPath)


const apiUrl = ref('')
const pageTitle = ref('')

if (!relationType.value && !creatorUsername.value) {
  apiUrl.value = 'api/insights'
  pageTitle.value = 'Browse Insights'
  console.log('[InsightsViews]: relationType and creatorUsername null...');
} else {
  const type = relationType.value.toLowerCase()
  if (!['votes', 'upvotes', 'saves'].includes(type)) {
    router.push('/404')
  } else {
    apiUrl.value = creatorUsername.value
      ? `api/insights/${creatorUsername.value}/${type}`
      : `api/insights/my/${type}`

    pageTitle.value = creatorUsername.value
      ? `${creatorUsername.value}'s ${relationType.value}`
      : `My ${relationType.value}`
  }
}

// --- DEFINE PAGE FUNCTIONS ---
function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Insight Lists View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = insightFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: insightFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // 1. Hydrate the Filter Store using the current active route parameters
  //insightFilterStore.rehydrate(route.query);

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'insightFilterStore'
  const cleanApiPath = insightFilterStore.buildApiPath(apiUrl.value);

  // 2b. Set the base url for loadmore
  insightStore.setBaseRoute(apiUrl.value)

  // 3. Fetch from store
  const { success, error } = await insightStore.loadInsights(cleanApiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving drafts. Refresh page and try again.'
      );
  }
  }

  // No matter the result, stop loading
  isLoading.value = false

  // 3. ⏳ Late-Binding Personal Layer Hydration (Runs seamlessly in background)
  if (success) {
    await insightStore.hydratePersonals(); 
  }
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

// Watch for browser navigation query parameters changing (Handles back/forward buttons cleanly)
watch(() => route.query, () => {
  initPage();
}, { deep: true });


// inside your HomeView.vue
onUnmounted(() => {
  insightStore.abort();
});

</script>

<template>
  
  <template v-if="isLoading">

    <div class="loader-container">
      <p class="loader"></p>
    </div>

  </template>

  <template v-else-if="loadingError">

    <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="redirectToLogin">Login</button>
      </template>
    </PageStatusMessage>

  </template>


   <template v-else>
   
      <div class="shared__page-title">
        <h1>Insights</h1>
      <template v-if="pageTitle">
          <p :class="{ at: creatorUsername }">
            {{ pageTitle }}
          </p>
        </template>
        <button class="btn primary" @click="modalStore.push('InsightListFilter', 'Filter Lists')">Filter</button>
      </div>

      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
      Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('InsightListFilter', 'Filter Lists')">filter</button> link to filter correctly.
      </p>
      
     </div>
    </template>

  <template v-if="insightStore.insights && insightStore.insights.length > 0">

       <InfiniteScroller
        :has-next="insightStore.hasNext"
        :is-fetching="insightStore.isFetchingMore"
        :error="insightStore.loadMoreError"
        @load-more="insightStore.loadMoreInsights"
        @retry="insightStore.loadMoreInsights">

        
  <div class="shared__container">

      <InsightListComponent 
        v-for="insight in insightStore.insights" 
        :key="insight.insightId" 
        :insight="insight"/>

  </div>

       </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Content!"
      message="No insights was found matching your search filters.">
    </PageStatusMessage>
  </template>
  </template>

</template>