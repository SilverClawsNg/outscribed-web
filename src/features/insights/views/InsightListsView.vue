<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useInsightListStore } from '../stores/InsightListStore'; 
import { useInsightListFilterStore } from '../stores/InsightListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import InsightListComponent from '../components/InsightListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import { EngagementTypes, type RelationType } from '@/utils/anchorStorage';

// --- INITIALIZE STORES & ROUTER ---
const insightStore = useInsightListStore();
const insightFilterStore = useInsightListFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()

// --- STATE ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)
const type = ref<string>('invalid');

const currentPath = computed(() => encodeURIComponent(route.fullPath))

// --- Reactive Route Params ---
const relationType = computed(() => ((route.params.relationType as string) || '').toLowerCase())
const creatorUsername = computed(() => (route.params.creatorUsername as string) || '')

// --- Determine route validity ---
const isValidType = computed(() => {
  if (!relationType.value) return true // If no relationType is provided, it's the base public feed (valid)
  return EngagementTypes.includes(relationType.value as RelationType)  // Otherwise, it must match your defined engagement types
})

// Authorized ONLY when viewing "My" relational feeds (has relationType, but no creatorUsername)
const isAuthorized = computed(() => Boolean(relationType.value) && !creatorUsername.value)

// --- Calculate API Url ---
const apiUrl = computed(() => {
  if (!relationType.value && !creatorUsername.value) {
    return 'api/insights'
  }

 if (!isValidType.value) return ''

  return creatorUsername.value
    ? `api/insights/${creatorUsername.value}/${relationType.value}`
    : `api/insights/my/${relationType.value}`
})

// --- Calculate Page Title ---
const pageTitle = computed(() => {
  if (!relationType.value && !creatorUsername.value) {
    return 'Browse Insights'
  }
  return creatorUsername.value
    ? `${creatorUsername.value}'s ${relationType.value}`
    : `My ${relationType.value}`
})

// --- Watch Route Changes ---
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath === oldPath) return

    loadingError.value = null

    if (!isValidType.value) {
      router.push('/404')
      return
    }

    insightFilterStore.setActiveType(
      'insight',
      isAuthorized.value ? relationType.value : null
    )

    await initPage() // fetch only; apiUrl/pageTitle already correct
  },
  { immediate: true }
)

// --- 2. PAGE INITIALIZATION ---
async function initPage() {
 
  console.log(`🚀 [Insight Lists View]: Fetching for path -> ${apiUrl.value}`)

  // Hydrate and validate filter state
  const { isClean } = insightFilterStore.rehydrate(route.query);

  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    wasCleaned.value = true

    await router.replace({
      path: route.path,
      query: insightFilterStore.getAsDictionary()
    })
    return
  }

  // Build clean API path with endpoint URL and active filters
  const cleanApiPath = insightFilterStore.buildApiPath(apiUrl.value);

  // Set the base url for loadmore in list store
  insightStore.setBaseRoute(apiUrl.value)

  // Fetch data
  isLoading.value = true
  const { success, error } = await insightStore.loadInsights(cleanApiPath, isAuthorized.value)

  if (!success) {
    loadingError.value = error || new APIError(
      500,
      'Unknown Error!',
      'Unknown error occurred while retrieving insights. Refresh page and try again.'
    );
  }

  isLoading.value = false

  if (success) {
    await insightStore.hydratePersonals(); 
  }
}

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath.value}`)
}

// --- MOUNT & WATCHERS ---
onMounted(async () => {
  await initPage();
})

onUnmounted(() => {
  insightStore.abort();
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

    <header class="page-header">
    <h1 v-if="pageTitle" class="page-header__title" :class="{ 'page-header__title--at': creatorUsername }">
      {{ pageTitle }}
    </h1>

  <!-- Variant 1: Filter Button -->
  <button 
    type="button" 
    class="btn primary" 
    @click="modalStore.push('InsightListFilter', 'Filter Lists', type)"
  >
    <SvgIcons name="filter" />
    <span>Filter</span>
  </button>

</header>
   
      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
      Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('InsightListFilter', 'Filter Lists')">filter</button> link to filter correctly.
      </p>
      
     </div>
    </template>

  <template v-if="insightStore.insights && insightStore.insights.length > 0">

       <InfiniteScroller
        :has-next="insightStore.hasNext"
        :is-fetching="insightStore.isFetchingMore"
        :error="insightStore.loadMoreError"
        @load-more="insightStore.loadMoreInsights"
        @retry="insightStore.loadMoreInsights">

        
  <div class="shared__container">

      <InsightListComponent 
        v-for="insight in insightStore.insights" 
        :key="insight.insightId" 
        :insight="insight"/>

  </div>

       </InfiniteScroller>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Content!"
      message="No insights was found matching your search filters.">
    </PageStatusMessage>
  </template>
  </template>

</template>
