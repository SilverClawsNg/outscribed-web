<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, computed, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useTaleListStore } from '../stores/TaleListStore'; 
import { useTaleListFilterStore } from '../stores/TaleListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import TaleListComponent from '../components/TaleListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'

// --- INITIALIZE STORES ---
const taleStore = useTaleListStore();
const taleFilterStore = useTaleListFilterStore();
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
  apiUrl.value = 'api/tales'
  pageTitle.value = 'Browse Tales'
  console.log('[TalesViews]: relationType and creatorUsername null...');
} else {
  const type = relationType.value.toLowerCase()
  if (!['votes', 'upvotes', 'saves'].includes(type)) {
    router.push('/404')
  } else {
    apiUrl.value = creatorUsername.value
      ? `api/tales/${creatorUsername.value}/${type}`
      : `api/tales/my/${type}`

    pageTitle.value = creatorUsername.value
      ? `${creatorUsername.value}'s ${relationType.value}`
      : `My ${relationType.value}`
  }
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Tale Lists View]: Presence verified via hint. Dispatching data fetch...')

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
  const cleanApiPath = taleFilterStore.buildApiPath(apiUrl.value);

  // 2b. Set the base url for loadmore
  taleStore.setBaseRoute(apiUrl.value)

  // 3. Fetch from store
  const { success, error } = await taleStore.loadTales(cleanApiPath)

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
    await taleStore.hydratePersonals(); 
  }
}

// --- DEFINE PAGE FUNCTIONS ---
function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
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
  taleStore.abort();
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
         <h1>Tales</h1>
        <template v-if="pageTitle">
          <p :class="{ at: creatorUsername }">
            {{ pageTitle }}
          </p>
        </template>
        <button class="btn primary" @click="modalStore.push('TaleListFilter', 'Filter Lists')">Filter</button>
      </div>

      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
      Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('TaleListFilter', 'Filter Lists')">filter</button> link to filter correctly.
      </p>
      
     </div>
    </template>

  <template v-if="taleStore.tales && taleStore.tales.length > 0">

       <InfiniteScroller
        :has-next="taleStore.hasNext"
        :is-fetching="taleStore.isFetchingMore"
        :error="taleStore.loadMoreError"
        @load-more="taleStore.loadMoreTales"
        @retry="taleStore.loadMoreTales">

        
  <div class="shared__container">

      <TaleListComponent 
        v-for="tale in taleStore.tales" 
        :key="tale.taleId" 
        :tale="tale"/>

  </div>

       </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Content!"
      message="No tales was found matching your search filters.">
    </PageStatusMessage>
  </template>

  </template>

</template>