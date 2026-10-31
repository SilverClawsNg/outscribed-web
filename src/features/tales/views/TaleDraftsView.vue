<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useTaleDraftStore } from '../stores/TaleDraftStore'; 
import { useTaleDraftFilterStore } from '../stores/TaleDraftFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import TaleDraftComponent from '../components/DraftListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import SvgIcons from '@/components/SvgIcons.vue'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore();
const taleFilterStore = useTaleDraftFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()
const isInitializing = ref(true)

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)


// --- CHECK USER'S AUTHENTICATION HINT STATUS ---

// --- DEFINE PAGE FUNCTIONS ---
const currentPath = encodeURIComponent(route.fullPath)

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Tale Drafts View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = taleFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: taleFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // 1. Hydrate the Filter Store using the current active route parameters
  //taleFilterStore.rehydrate(route.query);

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'taleFilterStore'
  const cleanApiPath = taleFilterStore.buildApiPath(taleStore.baseRoute);
  
  // 3. Fetch from store
  const outcome = await taleStore.loadTales(cleanApiPath)

  if (!outcome) {
       loadingError.value = taleStore.loadingError ?? new APIError(500, 'Unknown Error!', 'Unknown error occured while retrieving drafts. Refresh page and try again.')
  }

  // No matter the result, stop loading
  isLoading.value = false
}

// --- MOUNT PAGE ---
onMounted(async () => {
 
  await initPage();
})

watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath === oldPath || isInitializing.value) return

    loadingError.value = null

    await initPage()
  }
)

// inside your HomeView.vue
onUnmounted(() => {
  taleStore.abort();
});

</script>

<template>

  <template v-if="isLoading">

    <div class="loader" role="status" aria-label="Loading tales">
      <p class="loader__dot"></p>
    </div>

  </template>

  <template v-else-if="loadingError">

    <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Drafts'" 
      :message="loadingError.detail || 'An unexpected error occurred.'"
      icon="broken-chain"
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
        <h1>Tale Drafts</h1>
          <button type="button" class="btn btn--secondary"  
      @click="modalStore.push('TaleDraftFilter', 'Filter Drafts')">Filter</button>
    </header>
  

    <template v-if="wasCleaned">

        <PageStatusMessage 
              title="Invalid Filters Removed!" 
              message="Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the filter button above to filter correctly."
              icon="warning" 
              :is-bordered="true"
            />
   
    </template>

    <template v-if="taleStore.tales && taleStore.tales.length > 0">

       <InfiniteScroller
        :has-next="taleStore.hasNext"
        :is-fetching="taleStore.isFetchingMore"
        :error="taleStore.loadMoreError"
        @load-more="taleStore.loadMoreTales"
        @retry="taleStore.loadMoreTales">

         <TaleDraftComponent 
        v-for="tale in taleStore.tales" 
        :key="tale.taleId" 
        :tale="tale"/>

       </InfiniteScroller>

          <button 
          type="button" 
          class="filter-trigger" 
          aria-label="Filter content"
           @click="modalStore.push('TaleDraftFilter', 'Filter Drafts')"
        >
         <SvgIcons name="filter" />
        </button>

    </template>

    <template v-else>
    <PageStatusMessage
      title="No Tale Found!"
      message="We could not find any tale for this account. Tale created offline or in-progress will show up here."
      icon="inbox"
      :is-standalone="true">
    </PageStatusMessage>
    </template>

  </template>

</template>