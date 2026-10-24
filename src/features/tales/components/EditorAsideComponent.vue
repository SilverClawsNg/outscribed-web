<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useTaleDraftStore, type AsideView } from '@/features/tales/stores/TaleDraftStore'; 
import { useRouter, useRoute } from 'vue-router'
import { useTaleDraftFilterStore } from '@/features/tales/stores/TaleDraftFilterStore'; 
import { APIError } from '@/api/apiTypes.ts'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import InfiniteScroller from '@/components/InfiniteScroller.vue'

// --- ASIDE PANEL COMPONENTS ---
import DraftFilterComponent from '@/features/tales/components/DraftFilterComponent.vue'
import DraftDetailComponent from '@/features/tales/components/DraftDetailComponent.vue'
import DraftListComponent from '@/features/tales/components/DraftListComponent.vue'
import CreateDraftComponent from './CreateDraftComponent.vue';

// --- INITIALIZE STORES ---
const taleStore = useTaleDraftStore();
const taleFilterStore = useTaleDraftFilterStore();
const router = useRouter()
const route = useRoute()
const isInitializing = ref(true)

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)

// --- DEFINE PAGE FUNCTIONS ---
const currentPath = encodeURIComponent(route.fullPath)

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = taleFilterStore.rehydrate(route.query);

    console.log(`The route is ${route.query} `)


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

  // 3. Build the targeted API request endpoint string from those validated details
  await loadTalesFromStore();
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

// --- REACTIVE WATCHER: Watches the generated API path string ---
// Whenever filters apply and change the parameters, the built path changes, 
// automatically triggering a fresh fetch without code duplication!
watch(
  () => taleFilterStore.activeApiPath,
  async (newPath, oldPath) => {
    if (newPath === oldPath) return
    await loadTalesFromStore()
  }
)

// inside your HomeView.vue
onUnmounted(() => {
  taleStore.abort();
});


async function loadTalesFromStore() {

  isLoading.value = true
loadingError.value = null

  const cleanApiPath = taleFilterStore.buildApiPath(taleStore.baseRoute);

  // 4. Fetch from store
  const outcome = await taleStore.loadTales(cleanApiPath);

  if (!outcome) {
    loadingError.value = taleStore.loadingError ?? new APIError(500, 'Unknown Error!', 'Unknown error occured while retrieving drafts. Refresh page and try again.');
  }

  // No matter the result, stop loading
  isLoading.value = false;
}

function navigateToAside(section: AsideView) {
  taleStore.setCurrentAsideView(section);
}

</script>

<template>
      
  <!-- Aside Fixed Header -->
<header class="editor-studio__aside-header">
  <div class="editor-studio__aside-header--actions">
    <button 
      type="button" 
      class="btn btn--primary"
      :class="{ 'active': taleStore.currentAsideView === 'list' }"
      @click="navigateToAside('list')"
      title="Back to Drafts"
    >
      Tales
    </button>

    <button 
      type="button" 
      class="btn btn--primary"
      :class="{ 'active': taleStore.currentAsideView === 'filter' }"
      @click="navigateToAside('filter')"
    >
      Filter
    </button>

    <button 
      type="button" 
      class="btn btn--secondary"
      :class="{ 'active': taleStore.currentAsideView === 'create' }"
      @click="navigateToAside('create')"
    >
      OutScribe
    </button>
  </div>
</header>

      <!-- Aside Dynamic Component Body -->
      <div class="editor-studio__aside-body">

        <template v-if="taleStore.currentAsideView === 'list'">

                    
        <template v-if="isLoading">

            <div class="loader" role="status" aria-label="Loading tales">
            <p class="loader__dot"></p>
            </div>

        </template>

        <template v-else-if="loadingError">

            <PageStatusMessage 
            :title="loadingError.title || 'Error Loading Drafts'" 
            :message="loadingError.detail || 'An unexpected error occurred.'"
            icon="broken-chain"
            :is-standalone="true">
            <template v-if="loadingError.status == 401" #actions>
                <button class="btn btn--primary"  @click="redirectToLogin">Login</button>
            </template>
                <template v-else-if="loadingError.definition" #actions>
                <button class="btn btn--secondary"  @click="taleStore.openModal(loadingError)">
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

            <template v-if="taleStore.tales && taleStore.tales.length > 0">

            <InfiniteScroller
                :has-next="taleStore.hasNext"
                :is-fetching="taleStore.isFetchingMore"
                :error="taleStore.loadMoreError"
                @load-more="taleStore.loadMoreTales"
                @retry="taleStore.loadMoreTales">

              <DraftListComponent 
                v-for="tale in taleStore.tales" 
                :key="tale.taleId" 
                :tale="tale" />

            </InfiniteScroller>

            </template>

            <template v-else>
            <PageStatusMessage
            title="No Tale Found!"
            message="We could not find any tale for this account. Tale created offline or in-progress will show up here."
            icon="inbox"
            :is-standalone="true" />
            </template>

        </template>

        </template>

         <template v-else-if="taleStore.currentAsideView === 'filter'">

            <DraftFilterComponent />

        </template>

          <template v-else-if="taleStore.currentAsideView === 'create'">

             <CreateDraftComponent />

        </template>

          <template v-else-if="taleStore.currentAsideView === 'detail'">

             <DraftDetailComponent />

        </template>

          
        
      </div>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

.editor-studio__aside-header {
  flex: 0 0 auto;
  height: 56px;
  padding: 0; /* Remove horizontal padding so items span full width */
  margin-bottom: 1.25rem;
  display: flex;
  align-items: stretch; /* Forces children to match header height */
  position: sticky;
  top: 0;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color);
  z-index: 5;

  &--actions {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: stretch;
    column-gap: 0; /* Remove gap so buttons can form a cohesive segment control if desired */

    /* Force all 3 buttons to take up equal width (33.333%) and 100% height */
    > button {
      flex: 1 1 0;
      width: 100%;
      height: 100%;
      border-radius: 0; /* Square edges or adjust if you prefer subtle rounding */
      border: 1px solid var(--border-color);
      border-top: none;
      border-bottom: none;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      text-transform: uppercase;
      
      /* Optional: clean border splitting between the three buttons */
      &:not(:first-child) {
        border-left: none; 
      }

    }
  }
}

  .editor-studio__aside-body {
    flex: 1;
    overflow-y: auto;
    height: auto;
    padding: 0 0.5rem;
    max-width:@min-width;
    margin:0 auto;
  }


</style>