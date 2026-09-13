<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, computed, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useWriterListStore } from '../stores/WriterListStore'; 
import { useWriterListFilterStore } from '../stores/WriterListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import WriterListComponent from '../components/WriterListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'

// --- INITIALIZE STORES ---
const writerStore = useWriterListStore();
const writerFilterStore = useWriterListFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)

const currentPath = encodeURIComponent(route.fullPath)

// --- DEFINE PAGE FUNCTIONS ---
function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Writer Lists View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = writerFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: writerFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'writerFilterStore'
  const cleanApiPath = writerFilterStore.buildApiPath(writerStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await writerStore.loadWriters(cleanApiPath)

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
    await writerStore.hydratePersonals(); 
  }
}

// --- MOUNT PAGE ---
onMounted(async () => {
  
  await initPage();
})

// Watch for browser navigation query parameters changing (Handles back/forward buttons cleanly)
watch(() => route.query, () => {
  loadingError.value = null
  initPage();
}, { deep: true });


// inside your HomeView.vue
onUnmounted(() => {
  writerStore.abort();
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
      :message="loadingError.detail || 'An unexpected error occurred.'"
      icon="warning"
      :is-standalone="true">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="redirectToLogin">Login</button>
      </template>
        <template v-else-if="loadingError.definition" #actions>
           <button class="btn primary" @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
    </PageStatusMessage>

  </template>

   <template v-else>

     <header class="page-header shared__container">
      <h1 class="page-header__title">
          Browse Writers
        </h1>
    <button 
        type="button" 
        class="btn primary" @click="modalStore.push('WriterFilter', 'Filter Writers')">Filter</button>
    </header>
     
    <template v-if="wasCleaned">

      <PageStatusMessage 
              title="Invalid Filters Removed!" 
              message="Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the filter button above to filter correctly."
              icon="warning" 
              :is-bordered="true"
            />

    </template>

  <template v-if="writerStore.writers && writerStore.writers.length > 0">

       <InfiniteScroller
        :has-next="writerStore.hasNext"
        :is-fetching="writerStore.isFetchingMore"
        :error="writerStore.loadMoreError"
        @load-more="writerStore.loadMoreWriters"
        @retry="writerStore.loadMoreWriters">

        
  <div class="shared__container min">

      <WriterListComponent 
        v-for="writer in writerStore.writers" 
        :key="writer.creator.accountId" 
        :writer="writer"/>

  </div>

       </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Writer Found!"
      message="We did not find any writer matching your search filters."
      icon="inbox"
      :is-standalone="true"
      />
  </template>
  </template>

</template>