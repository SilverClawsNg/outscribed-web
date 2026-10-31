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
    
    wasCleaned.value  = true;
     isLoading.value = true;
    loadingError.value = null;

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
<header class="editor-aside-header">

  <div class="editor-aside-header__actions">

    <div class="editor-aside-header__actions-item">

    <button 
      type="button" 
      class="btn btn--primary"
      :class="{ 'active': taleStore.currentAsideView === 'list' }"
      @click="navigateToAside('list')"
      title="Back to Drafts"
    >
      Tales
    </button>

    </div>

    <div class="editor-aside-header__actions-item">
      
    <button 
      type="button" 
      class="btn btn--primary"
      :class="{ 'active': taleStore.currentAsideView === 'filter' }"
      @click="navigateToAside('filter')"
    >
      Filter
    </button>

    </div>

     <div class="editor-aside-header__actions-item">
      
    <button 
      type="button" 
      class="btn btn--secondary"
      :class="{ 'active': taleStore.currentAsideView === 'create' }"
      @click="navigateToAside('create')"
    >
      OutScribe
    </button>
    
    </div>

  </div>
</header>

      <!-- Aside Dynamic Component Body -->
      <div class="editor-aside-body">

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
            message="We could not find any tale matching your search parameters. If you are new here, create a tale else refine your search."
            icon="inbox"
            :is-standalone="true">
                <template #actions>
                <button class="btn btn--primary"  @click="taleStore.currentAsideView = 'create'">
                    Create
                </button>
                 <button class="btn btn--secondary"  @click="taleStore.currentAsideView = 'filter'">
                    Filter
                </button>
                </template>
                </PageStatusMessage>
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

.editor-aside-header {
  flex: 0 0 auto;
  height: 56px;
  padding: 0; /* Remove horizontal padding so items span full width */
  margin-bottom: 1.25rem;
  display: flex;
  align-items: stretch; /* Forces children to match header height */
  position: sticky;
  top: 0;
  //border-bottom: 1px solid @link-color;
   box-shadow: var(--box-shadow);
  background-color: var(--background-color);
  z-index: 5;

  &__actions {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: stretch;
    padding: 0 0.25rem;
   
  }
   column-gap: 0; /* Remove gap so buttons can form a cohesive segment control if desired */

&__actions-item{

      flex: 1 1 0;
      width: 100%;
      height: 100%;
      padding: 0.25rem;
display: flex;
align-items: center;
      & .btn{
        width: 100%;
      }
   
}

   
}

  .editor-aside-body {
    flex: 1;
    overflow-y: auto;
    height: auto;
    padding: 0 0.5rem;
    max-width:@min-width;
    margin:0 auto;
  }


</style>