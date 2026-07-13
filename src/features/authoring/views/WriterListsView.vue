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
import { useLoginHint } from '@/utils/authHelper'

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

// --- ROUTE OPTIONS ---
const relationType = computed(() => route.params.relationType as string || '')
const creatorUsername = computed(() => route.params.creatorUsername as string || '')

const currentPath = encodeURIComponent(route.fullPath)
const requiresLogin = ref(false)
const isPersonalRoute = !creatorUsername.value && relationType.value
const isLoggedIn = useLoginHint()
const apiUrl = ref('')
const pageTitle = ref('')

if (isPersonalRoute && !isLoggedIn.value) {
  // 🛡️ Guard execution: Flag login required and stop setup parsing
  requiresLogin.value = true
}else if (!relationType.value && !creatorUsername.value) {
  apiUrl.value = 'api/writers'
  pageTitle.value = 'Browse Writers'
  console.log('[WritersViews]: relationType and creatorUsername null...');
} else {
  const type = relationType.value.toLowerCase()
  if (!['votes', 'upvotes', 'saves'].includes(type)) {
    router.push('/404')
  } else {
    apiUrl.value = creatorUsername.value
      ? `api/writers/${creatorUsername.value}/${type}`
      : `api/writers/my/${type}`

    pageTitle.value = creatorUsername.value
      ? `User's ${relationType.value}`
      : `My ${relationType.value}`
  }
}

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

  // 1. Hydrate the Filter Store using the current active route parameters
  //writerFilterStore.rehydrate(route.query);

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'writerFilterStore'
  const cleanApiPath = writerFilterStore.buildApiPath(apiUrl.value);

  // 2b. Set the base url for loadmore
  writerStore.setBaseRoute(apiUrl.value)

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
  if (success && isLoggedIn.value) {
    await writerStore.hydratePersonals(); 
  }
}

// --- MOUNT PAGE ---
onMounted(async () => {
  
if(requiresLogin.value){
  isLoading.value = true
  return
}

  await initPage();
})

// Watch for browser navigation query parameters changing (Handles back/forward buttons cleanly)
watch(() => route.query, () => {
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

  <template v-else-if="requiresLogin">

 <PageStatusMessage 
      title="401: Unauthorized!" 
      message="This feature is protected and requires a login to continue">
      <template #actions>
        <button class="btn primary" @click=redirectToLogin>Login</button>
      </template>
    </PageStatusMessage>

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
        <h1>{{ pageTitle }}</h1>
        <button class="btn primary" @click="modalStore.push('WriterListFilter', 'Filter Lists')">Filter</button>
      </div>

      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
      Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('WriterListFilter', 'Filter Lists')">filter</button> link to filter correctly.
      </p>
      
     </div>
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
      title="No Content!"
      message="No writers was found matching your search filters.">
    </PageStatusMessage>
  </template>
  </template>

</template>