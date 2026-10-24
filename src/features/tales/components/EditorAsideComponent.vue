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
  const cleanApiPath = taleFilterStore.buildApiPath(taleStore.baseRoute);
  
  // 4. Fetch from store
  const outcome = await taleStore.loadTales(cleanApiPath)

  if (!outcome) {
       loadingError.value = taleStore.loadingError ?? new APIError(500, 'Unknown Error!', 'Unknown error occured while retrieving drafts. Refresh page and try again.')
  }

  // No matter the result, stop loading
  isLoading.value = false
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath === oldPath || isInitializing.value) return

    loadingError.value = null

    await initPage()
  }
)

// inside your HomeView.vue
onUnmounted(() => {
  taleStore.abort();
});


function navigateToAside(section: AsideView) {
  taleStore.setCurrentAsideView(section);
}

</script>

<template>
      
      <!-- Aside Fixed Header -->
      <header class="editor-studio__aside-header">

        <h2 class="editor-studio__aside-header--title">
            Editor
          </h2>

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
             @click="navigateToAside('create')">
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
    padding: 0 0.5rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--background-color);

    &--title{
        text-transform:uppercase;
        font-size: 1.1rem;
        font-weight:700;
    }

     &--actions{
        display: flex;
        column-gap: 0.25rem;
        align-items:center;
    
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