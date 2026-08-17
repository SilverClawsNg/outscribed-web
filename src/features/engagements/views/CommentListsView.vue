<script setup lang="ts"> 
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useCommentListStore } from '../stores/CommentListStore'; 
import { useCommentListFilterStore } from '../stores/CommentListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import CommentListComponent from '../components/CommentListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import { EngagementTypes, type RelationType } from '@/utils/anchorStorage';

// --- INITIALIZE STORES & ROUTER ---
const commentStore = useCommentListStore();
const commentFilterStore = useCommentListFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()

// --- STATE ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)
const isAuthorized = ref<boolean>(false)
const type = ref<string>('invalid');

const apiUrl = ref('')
const pageTitle = ref('')

const currentPath = computed(() => encodeURIComponent(route.fullPath))
 const username = ref('')
 

// --- 1. DYNAMIC ROUTE RESOLVER ---
// Evaluated every time the route path or params change
function resolveRouteConfig() {
 const relationType = (route.params.relationType as string) || ''
 const creatorUsername = (route.params.creatorUsername as string) || ''
 username.value = creatorUsername

  if (!relationType && !creatorUsername) {
    apiUrl.value = 'api/comments'
    pageTitle.value = 'Browse Comments'
    isAuthorized.value = false
    commentFilterStore.setActiveType('comment', null) // Public Feed
  } else {
    type.value = relationType.toLowerCase()

    if (!EngagementTypes.includes(type.value as RelationType)) {
      router.push('/404')
      return
    }

    // Is private list if viewing /my/... instead of /creatorUsername/...
    isAuthorized.value = !creatorUsername

    apiUrl.value = creatorUsername
      ? `api/comments/${creatorUsername}/${type.value}`
      : `api/comments/my/${type.value}`

    pageTitle.value = creatorUsername
      ? `${creatorUsername}'s ${relationType}`
      : `My ${relationType}`

    // Synchronize active type in filter store based on authorization state
    commentFilterStore.setActiveType('comment', isAuthorized.value ? type.value : null)
  }
}

// --- 2. PAGE INITIALIZATION ---
async function initPage() {
  // Re-sync endpoint URLs & active types before initializing
  resolveRouteConfig()

  console.log(`🚀 [Comment Lists View]: Fetching for path -> ${apiUrl.value}`)

  // Hydrate and validate filter state
  const { isClean } = commentFilterStore.rehydrate(route.query);

  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    wasCleaned.value = true

    await router.replace({
      path: route.path,
      query: commentFilterStore.getAsDictionary()
    })
    return
  }

  // Build clean API path with endpoint URL and active filters
  const cleanApiPath = commentFilterStore.buildApiPath(apiUrl.value);

  // Set the base url for loadmore in list store
  commentStore.setBaseRoute(apiUrl.value)

  // Fetch data
  isLoading.value = true
  const { success, error } = await commentStore.loadComments(cleanApiPath, isAuthorized.value)

  if (!success) {
    loadingError.value = error || new APIError(
      500,
      'Unknown Error!',
      'Unknown error occurred while retrieving comments. Refresh page and try again.'
    );
  }

  isLoading.value = false

  if (success) {
    await commentStore.hydratePersonals(); 
  }
}

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath.value}`)
}

// --- MOUNT & WATCHERS ---
onMounted(async () => {
  await initPage();
})

// 🛡️ FIX: Watch fullPath instead of route.query so path transitions (/my/votes -> /comments) trigger re-fetch
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath !== oldPath) {
      loadingError.value = null
      await initPage();
    }
  }
);

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
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="redirectToLogin">Login</button>
      </template>
    </PageStatusMessage>

  </template>

   <template v-else>
   
      <div class="shared__page-title">
        <h1>Comments</h1>
        <template v-if="pageTitle">
          <p :class="{ at: username }">
            {{ pageTitle }}
          </p>
        </template>
        <button class="btn primary" @click="modalStore.push('CommentListFilter', 'Filter Lists')">Filter</button>
      </div>

      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
      Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('CommentListFilter', 'Filter Lists')">filter</button> link to filter correctly.
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

      <CommentListComponent 
        v-for="comment in commentStore.comments" 
        :key="comment.commentId" 
        :comment="comment"/>

  </div>

       </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Content!"
      message="No comments was found matching your search filters.">
    </PageStatusMessage>
  </template>
  </template>

</template>