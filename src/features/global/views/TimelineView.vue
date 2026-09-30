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
import SvgIcons from '@/components/SvgIcons.vue'

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

  const { isClean } =  timelineFilterStore.rehydrate(route.query);

  if (!isClean) {

    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: timelineFilterStore.getAsDictionary()
    })
   
    return
  }

  const cleanApiPath = timelineFilterStore.buildApiPath(timelineStore.baseRoute);
  
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


// --- Watch Route Changes ---
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath === oldPath) return

    loadingError.value = null

    await initPage() // fetch only; apiUrl/pageTitle already correct
  },
  { immediate: true }
)

// inside your HomeView.vue
onUnmounted(() => {
  timelineStore.abort();
});

</script>

<template>

  <template v-if="isLoading">

   <div class="loader" role="status" aria-label="Loading timeline">
    <p class="loader__dot"></p>
  </div>

  </template>
  
  <template v-else-if="loadingError">

     <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'"
      icon="warning"
      :is-standalone="true">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn btn--primary"  @click="redirectToLogin">Login</button>
      </template>
        <template v-else-if="loadingError.definition" #actions>
           <button class="btn btn--primary"  @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
    </PageStatusMessage>

  </template>

  <template v-else>
   
     <header class="page-header">
        <h1>
              Timelines
            </h1>
        <button class="btn btn--secondary"  @click="modalStore.push('TimelineFilter', 'Filter Timelines')">Filter</button>
    </header>
    
    <template v-if="wasCleaned">
     <div class="container">
          <PageStatusMessage 
              title="Invalid Filters Removed!" 
              message="Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the filter button above to filter correctly."
              icon="warning" 
              :is-bordered="true"
            />
        </div>
    </template>

  <template v-if="timelineStore.timelines && timelineStore.timelines.length > 0">

      <InfiniteScroller
      :has-next="timelineStore.hasNext"
      :is-fetching="timelineStore.isFetchingMore"
      :error="timelineStore.loadMoreError"
      @load-more="timelineStore.loadMoreTimelines"
      @retry="timelineStore.loadMoreTimelines">

<div class="container">

      <TimelineComponent 
        v-for="timeline in timelineStore.timelines" 
        :key="timeline.id" 
        :timeline="timeline"/>

  </div>
    
    </InfiniteScroller>

              <button 
          type="button" 
          class="filter-trigger" 
          aria-label="Filter content"
          @click="modalStore.push('TimelineFilter', 'Filter Timelines')"
        >
         <SvgIcons name="filter" />
        </button>

  </template>

  <template v-else>
    <div class="container">
  <PageStatusMessage
      title="No timeline found!"
      message="Sorry. No timeline was found matching your filter requirements."
        icon="inbox" 
              :is-bordered="true"
            />
    </div>
  </template>
  </template>

</template>