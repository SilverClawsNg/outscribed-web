<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useTagStore } from '../stores/TagStore.ts'; 
import { useTagFilterStore } from '../stores/TagFilterStore.ts'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import TagComponent from '../components/TagComponent.vue'
import SvgIcons from '@/components/SvgIcons.vue'
import type { TagSortType } from '@/utils/enumHelper.ts';

// --- INITIALIZE STORES ---
const tagStore = useTagStore();
const tagFilterStore = useTagFilterStore();
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

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Writer Lists View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = tagFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true;
     isLoading.value = true;
    loadingError.value = null;

    await router.replace({
      path: route.path,
      query: tagFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'tagFilterStore'
  const cleanApiPath = tagFilterStore.buildApiPath(tagStore.baseRoute);

  // 3. Fetch from store
  const { success, error } = await tagStore.loadtags(cleanApiPath)

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

// --- Watch Route Changes ---
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath === oldPath) return

     isLoading.value = true;
    loadingError.value = null;

    await initPage() // fetch only; apiUrl/pageTitle already correct
  },
  { immediate: true }
)

async function setSort(sort: TagSortType) {
  // 1. Update the store
  tagFilterStore.sort = sort;
   isLoading.value = true;
    loadingError.value = null;

  // 2. Push/Replace the URL query. 
  // This single call updates the browser URL AND automatically triggers your route watcher 
  // (or page reload hook) to fetch the data cleanly without a double-firewall trip.
  await router.replace({
    path: route.path,
    query: tagFilterStore.getAsDictionary()
  });
}


// inside your HomeView.vue
onUnmounted(() => {
  tagStore.abort();
});

</script>

<template>

  <template v-if="isLoading">

   <div class="loader" role="status" aria-label="Loading tag">
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
        <h1 class="page-header__title">Browse Trending Tags</h1>
        <p class="page-header__subtitle">
          For every trending global or local topic, there is at least an OutScribed story.
        </p>
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
    
  <template v-if="tagStore.tags && tagStore.tags.length > 0">

      <InfiniteScroller
      :has-next="tagStore.hasNext"
      :is-fetching="tagStore.isFetchingMore"
      :error="tagStore.loadMoreError"
      @load-more="tagStore.loadmoretags"
      @retry="tagStore.loadmoretags">

 <div class="grid-container">

      <TagComponent 
        v-for="tag in tagStore.tags" 
        :key="tag.tagId" 
        :tag="tag"/>

  </div>
    
    </InfiniteScroller>

      <!-- Fixed Bottom Filter & Sort Footer -->
    <footer class="page-footer-bar">
      <div class="page-footer-bar__inner">
        <!-- Quick Sort: Newest -->
        <button 
          type="button" 
          class="footer-filter-btn link-background" 
          :class="{ active: tagFilterStore.sort === 'MostPopular' }"
          @click="setSort('MostPopular')"
        >
          Popular
        </button>

        <span class="footer-divider">|</span>

        <!-- Quick Sort: Oldest -->
        <button 
          type="button" 
          class="footer-filter-btn link-background" 
          :class="{ active: tagFilterStore.sort === 'MostRecent' }"
          @click="setSort('MostRecent')"
        >
          Newest
        </button>

        <span class="footer-divider">|</span>

        <!-- More Filters Modal Trigger -->
        <button 
          type="button" 
          class="footer-filter-btn footer-filter-btn--more" 
          @click="modalStore.push('TagFilter', 'Filter Tags')"
        >
         
          More filters
        </button>
      </div>
    </footer>

  </template>

  <template v-else>
   <div class="container">
      <PageStatusMessage 
               title="No Tag Found!"
      message="Sorry. No tags were found matching your filter requirements."
              icon="inbox" 
              :is-bordered="true"
            />
  
   </div>
  </template>
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/grid-container.less";
</style>