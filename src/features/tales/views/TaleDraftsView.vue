<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useTaleDraftStore } from '../stores/TaleDraftStore'; 
import { useTaleDraftFilterStore } from '../stores/TaleDraftFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import TaleDraftComponent from '../components/TaleDraftComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import { useLoginHint } from '@/utils/authHelper'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore();
const taleFilterStore = useTaleDraftFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()
const isInitializing = ref(true)
const isLoggedIn = useLoginHint()
const authStore = useAuthStore()

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
  const { success, error } = await taleStore.loadTales(cleanApiPath)

  if (!success) {
       loadingError.value = error ?? new APIError(500, 'Unknown Error!', 'Unknown error occured while retrieving drafts. Refresh page and try again.')
  }

  // No matter the result, stop loading
  isLoading.value = false
}

// --- MOUNT PAGE ---
onMounted(async () => {
  
  //start with initializing set to true so page starts on loading

  if(!isLoggedIn.value){ //if there is no hint, show login form
    isInitializing.value = false 
  }
  else{

      // 1. Force the store to finish its network/hint verification routine completely
      var result = await authStore.verifyAuthoring()

      if(result){
      // 2. Hand control over to the store's computed workflow state
      isInitializing.value = false
      }
  
  }

  await initPage();
})

// Watch for browser navigation query parameters changing (Handles back/forward buttons cleanly)
watch(() => route.query, () => {
  loadingError.value = null
  initPage();
}, { deep: true });


// inside your HomeView.vue
onUnmounted(() => {
  taleStore.abort();
});

</script>

<template>

  <template v-if=isInitializing>
      <p class="shared__loader"></p>
  </template>

  
  <template v-else-if="!isLoggedIn || !authStore.hasAccessToken">

      <PageStatusMessage 
        title="401: Unauthorized!" 
        message="It appears you are not logged in or have been logged out. Login or register to continue."
      >
        <template #actions>
          <button class="btn primary" @click="modalStore.push('CreateTale', 'Create Tale')">Continue</button>
        </template>

      </PageStatusMessage>

    </template>

     <template v-else-if="authStore.writerStatus === 'None'">
      <PageStatusMessage 
        title="401: Unauthorized!" 
        message="Your account is not currently authorized to publish tales. Upgrade now. It is free and easy."
      >
        <template #actions>
          <button class="btn primary" @click="modalStore.push('CreateTale', 'Create Tale')">Continue</button>
        </template>
      </PageStatusMessage>
    </template>
   
  <template v-else-if="isLoading">

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
        <h1>Tale Drafts</h1>
        <button class="btn primary" @click="modalStore.push('TaleDraftFilter', 'Filter Drafts')">Filter</button>
      </div>

      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
      Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('TaleDraftFilter', 'Filter Drafts')">filter</button> link to filter correctly.
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

       <TaleDraftComponent 
        v-for="tale in taleStore.tales" 
        :key="tale.taleId" 
        :tale="tale"/>
  </div>
    

       </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="404: Not Found!"
      message="No drafts found. Any draft tales created offline or in-progress will show up here.">
    </PageStatusMessage>
  </template>
  </template>

</template>