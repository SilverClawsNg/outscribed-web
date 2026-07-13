<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useTimelineStore } from '../stores/TimelineStore'; 
import { useTimelineFilterStore } from '../stores/TimelineFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import TimelineComponent from '../components/TimelineComponent.vue' // 🎯 Reusable Component Import
import { useLoginHint } from '@/utils/authHelper'

// --- INITIALIZE STORES ---
const timelineStore = useTimelineStore();
const timelineFilterStore = useTimelineFilterStore();
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

  console.log('🚀 [Timeline View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } =  timelineFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {

    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: timelineFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }


  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'taleFilterStore'
  const cleanApiPath = timelineFilterStore.buildApiPath(timelineStore.baseRoute);
  
  // 3. Fetch from store
  const { success, error } = await timelineStore.loadTimelines(cleanApiPath)

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
  timelineStore.abort();
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
      :title="loadingError.title || 'Error Loading Drafts'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
      <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="redirectToLogin">Login</button>
      </template>
    </PageStatusMessage>

  </template>

  <template v-else>
   
      <div class="shared__page-title">
        <h1>Timelines</h1>
        <button class="btn primary" @click="modalStore.push('TimelineFilter', 'Filter Timelines')">Filter</button>
      </div>

      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
       Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('TimelineFilter', 'Filter Timelines')">filter</button> link to filter correctly.
      </p>
      
     </div>
    </template>

  <template v-if="timelineStore.timelines && timelineStore.timelines.length > 0">

      <InfiniteScroller
      :has-next="timelineStore.hasNext"
      :is-fetching="timelineStore.isFetchingMore"
      :error="timelineStore.loadMoreError"
      @load-more="timelineStore.loadMoreTimelines"
      @retry="timelineStore.loadMoreTimelines">

<div class="shared__container">

      <TimelineComponent 
        v-for="timeline in timelineStore.timelines" 
        :key="timeline.id" 
        :timeline="timeline"/>

  </div>
    
    </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="404: Not Found!"
      message="Sorry. No timelines were found matching your filter requirements.">
    </PageStatusMessage>
  </template>
  </template>

</template>