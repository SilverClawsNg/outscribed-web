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

// --- INITIALIZE STORES ---
const tagStore = useTagStore();
const tagFilterStore = useTagFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

const currentPath = encodeURIComponent(route.fullPath)

// --- DEFINE PAGE FUNCTIONS ---
function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'taleFilterStore'
  const apiPath = tagFilterStore.buildApiPath(tagStore.baseRoute);
  
  // 3. Fetch from store
  const { success, error } = await tagStore.loadtags(apiPath)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving tags. Refresh page and try again.'
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
   
        <header class="page-header container">
          <h1 class="page-header__title">
              Tags
            </h1>
       </header>
       
  <template v-if="tagStore.tags && tagStore.tags.length > 0">

      <InfiniteScroller
      :has-next="tagStore.hasNext"
      :is-fetching="tagStore.isFetchingMore"
      :error="tagStore.loadMoreError"
      @load-more="tagStore.loadmoretags"
      @retry="tagStore.loadmoretags">

<div class="container">

      <TagComponent 
        v-for="tag in tagStore.tags" 
        :key="tag.tagId" 
        :tag="tag"/>

  </div>
    
    </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Tag Found!"
      message="Sorry. No tags were found matching your filter requirements.">
    </PageStatusMessage>
  </template>
  </template>

</template>