<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useDraftCommentsStore } from '../stores/DraftCommentsStore'; 
import { useDraftCommentsFilterStore } from '../stores/DraftCommentsFilterStore.ts'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import CommentDraftComponent from '../components/CommentDraftComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import { useLoginHint } from '@/utils/authHelper'

// --- INITIALIZE STORES ---
const commentStore = useDraftCommentsStore();
const commentFilterStore = useDraftCommentsFilterStore();
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

  console.log('🚀 [Comment Drafts View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = commentFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: commentFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // 1. Hydrate the Filter Store using the current active route parameters
  //commentFilterStore.rehydrate(route.query);

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'commentFilterStore'
  const cleanApiPath = commentFilterStore.buildApiPath(commentStore.baseRoute);
  
  // 3. Fetch from store
  const { success, error } = await commentStore.loadComments(cleanApiPath)

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
  commentStore.abort();
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
        <h1>Comment Drafts</h1>
        <button class="btn primary" @click="modalStore.push('CommentDraftFilter', 'Filter Drafts')">Filter</button>
      </div>

      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
      Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('CommentDraftFilter', 'Filter Drafts')">filter</button> link to filter correctly.
      </p>
      
     </div>
    </template>

  <template v-if="commentStore.comments && commentStore.comments.length > 0">

       <InfiniteScroller
        :has-next="commentStore.hasNext"
        :is-fetching="commentStore.isFetchingMore"
        :error="commentStore.loadMoreError"
        @load-more="commentStore.loadMoreComments"
        @retry="commentStore.loadMoreComments">

        <div class="shared__container">

       <CommentDraftComponent 
        v-for="comment in commentStore.comments" 
        :key="comment.commentId" 
        :comment="comment"/>
  </div>
    
       </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="404: Not Found!"
      message="No drafts found. Any draft comments created offline or in-progress will show up here.">
    </PageStatusMessage>
  </template>
  </template>

</template>