<script setup lang="ts"> 
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useTaleListStore } from '../stores/TaleListStore'; 
import { useTaleListFilterStore } from '../stores/TaleListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import TaleListComponent from '../components/TaleListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import { EngagementTypes, type RelationType } from '@/utils/anchorStorage';

// --- INITIALIZE STORES & ROUTER ---
const taleStore = useTaleListStore();
const taleFilterStore = useTaleListFilterStore();
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
    apiUrl.value = 'api/tales'
    pageTitle.value = 'Browse Tales'
    isAuthorized.value = false
    taleFilterStore.setActiveType('tale', null) // Public Feed
  } else {
    type.value = relationType.toLowerCase()

    if (!EngagementTypes.includes(type.value as RelationType)) {
      router.push('/404')
      return
    }

    // Is private list if viewing /my/... instead of /creatorUsername/...
    isAuthorized.value = !creatorUsername

    apiUrl.value = creatorUsername
      ? `api/tales/${creatorUsername}/${type.value}`
      : `api/tales/my/${type.value}`

    pageTitle.value = creatorUsername
      ? `${creatorUsername}'s ${relationType}`
      : `My ${relationType}`

    // Synchronize active type in filter store based on authorization state
    taleFilterStore.setActiveType('tale', isAuthorized.value ? type.value : null)
  }
}

// --- 2. PAGE INITIALIZATION ---
async function initPage() {
  // Re-sync endpoint URLs & active types before initializing
  resolveRouteConfig()

  console.log(`🚀 [Tale Lists View]: Fetching for path -> ${apiUrl.value}`)

  // Hydrate and validate filter state
  const { isClean } = taleFilterStore.rehydrate(route.query);

  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    wasCleaned.value = true

    await router.replace({
      path: route.path,
      query: taleFilterStore.getAsDictionary()
    })
    return
  }

  // Build clean API path with endpoint URL and active filters
  const cleanApiPath = taleFilterStore.buildApiPath(apiUrl.value);

  // Set the base url for loadmore in list store
  taleStore.setBaseRoute(apiUrl.value)

  // Fetch data
  isLoading.value = true
  const { success, error } = await taleStore.loadTales(cleanApiPath, isAuthorized.value)

  if (!success) {
    loadingError.value = error || new APIError(
      500,
      'Unknown Error!',
      'Unknown error occurred while retrieving tales. Refresh page and try again.'
    );
  }

  isLoading.value = false

  if (success) {
    await taleStore.hydratePersonals(); 
  }
}

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath.value}`)
}

// --- MOUNT & WATCHERS ---
onMounted(async () => {
  await initPage();
  console.log(`✅ [Tale Lists View]: Page initialized for path -> ${apiUrl.value}, path -> ${pageTitle.value}`)
})

// 🛡️ FIX: Watch fullPath instead of route.query so path transitions (/my/votes -> /tales) trigger re-fetch
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
          <p :class="{ at: username }">
            {{ pageTitle }}
          </p>
        </template>
        <button class="btn primary" @click="modalStore.push('TaleListFilter', 'Filter Lists', type)">Filter</button>
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