<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, watch, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useWriterListStore } from '../stores/WriterListStore'; 
import { useWriterListFilterStore } from '../stores/WriterListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import WriterListComponent from '../components/WriterListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import SvgIcons from '@/components/SvgIcons.vue'
import type { SortType } from '@/utils/enumHelper.ts';

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
    
    wasCleaned.value  = true;
     isLoading.value = true;
    loadingError.value = null;

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

// --- Watch Route Changes ---
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath === oldPath) return

    loadingError.value = null;
    isLoading.value = true;

    await initPage() // fetch only; apiUrl/pageTitle already correct
  },
  { immediate: true }
)

// inside your HomeView.vue
onUnmounted(() => {
  writerStore.abort();
});

async function setSort(sort: SortType) {
  // 1. Update the store
  writerFilterStore.sort = sort;
   isLoading.value = true;
    loadingError.value = null;

  // 2. Push/Replace the URL query. 
  // This single call updates the browser URL AND automatically triggers your route watcher 
  // (or page reload hook) to fetch the data cleanly without a double-firewall trip.
  await router.replace({
    path: route.path,
    query: writerFilterStore.getAsDictionary()
  });
}

</script>

<template>
  
  <template v-if="isLoading">

   <div class="loader" role="status" aria-label="Loading writers">
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

  <template v-if="writerStore.writers && writerStore.writers.length > 0">

     <header class="header">
        <h1 class="header__title">Meet OutScribed's Writers</h1>
        <p class="header__subtitle">
          Our writers utilize artistic tools such as allegory, satire, etc. and logical trends to re-imagine. reframe, and predict.
          <br /> Begin your own OuScribed journey now. <router-link to="/register">Sign Up</router-link>
        </p>
      </header>

       <InfiniteScroller
        :has-next="writerStore.hasNext"
        :is-fetching="writerStore.isFetchingMore"
        :error="writerStore.loadMoreError"
        @load-more="writerStore.loadMoreWriters"
        @retry="writerStore.loadMoreWriters">

        
  <div class="grid-container">

      <WriterListComponent 
        v-for="writer in writerStore.writers" 
        :key="writer.creator.accountId" 
        :writer="writer"/>

  </div>

       </InfiniteScroller>

       
       <!-- Fixed Bottom Filter & Sort Footer -->
    <footer class="page-footer-bar">
      <div class="page-footer-bar__inner">
        <!-- Quick Sort: Newest -->
        <button 
          type="button" 
          class="footer-filter-btn" 
          :class="{ active: writerFilterStore.sort === '-1' || writerFilterStore.sort === 'MostRecent' }"
          @click="setSort('MostRecent')"
        >
          Newest
        </button>

        <!-- Quick Sort: Oldest -->
        <button 
          type="button" 
          class="footer-filter-btn" 
          :class="{ active: writerFilterStore.sort === 'LeastRecent' }"
          @click="setSort('LeastRecent')"
        >
          Oldest
        </button>

        <!-- More Filters Modal Trigger -->
        <button 
          type="button" 
          class="footer-filter-btn footer-filter-btn--more" 
          @click="modalStore.push('WriterFilter', 'Filter Writers')"
        >
         
          More Filters
        </button>
      </div>
    </footer>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Writer Found!"
      message="We did not find any writer matching your search parameters."
      icon="inbox"
     :is-standalone="true">
        <template #actions>
           <button class="btn btn--primary"  @click="modalStore.push('WriterFilter', 'Filter Writers')">
            Refine Search
          </button>
        </template>
    </PageStatusMessage>
  </template>
  </template>

</template>


<style lang="less" scoped>
@import "@/assets/css/grid-container.less";


  .header {
    text-align: center;
    margin: 2.5rem auto;
    width: @mid-width;
    max-width: calc(100% - 20px);
    

    &__title {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    &__subtitle {
      font-size: 1.05rem;
      max-width: 80%;
      margin: 0 auto;
      line-height: 1.5;

      & a{
        text-decoration: underline;

        &:hover{
          text-decoration: none;
        }
      }
    }
  }

</style>