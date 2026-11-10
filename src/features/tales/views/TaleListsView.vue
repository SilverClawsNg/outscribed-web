<script setup lang="ts"> 

// --- IMPORTS ---
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
import SvgIcons from '@/components/SvgIcons.vue'
import type { SortType } from '@/utils/enumHelper.ts';
import RegisterBanner from '@/components/RegisterBanner.vue';
import { mediaHelper } from '@/utils/mediaHelper'
import TaleTextComponent from '../components/TaleTextComponent.vue';

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
    return 'api/tales'
  }

 if (!isValidType.value) return ''

  return creatorUsername.value
    ? `api/tales/${creatorUsername.value}/${relationType.value}`
    : `api/tales/my/${relationType.value}`
})

// --- Calculate Page Title ---
const pageTitle = computed(() => {
  if (!relationType.value && !creatorUsername.value) {
    return 'Discover Tales'
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

     isLoading.value = true;
    loadingError.value = null;

    if (!isValidType.value) {
      router.push('/404')
      return
    }

    taleFilterStore.setActiveType(
      'tale',
      isAuthorized.value ? relationType.value : null
    )

    await initPage() // fetch only; apiUrl/pageTitle already correct
  },
  { immediate: true }
)

// --- 2. PAGE INITIALIZATION ---
async function initPage() {
 
  console.log(`🚀 [Tale Lists View]: Fetching for path -> ${apiUrl.value}`)

  // Hydrate and validate filter state
  const { isClean } = taleFilterStore.rehydrate(route.query);

  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    wasCleaned.value = true;
     isLoading.value = true;
    loadingError.value = null;

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

async function setSort(sort: SortType) {
  // 1. Update the store
  taleFilterStore.sort = sort;
   isLoading.value = true;
    loadingError.value = null;

  // 2. Push/Replace the URL query. 
  // This single call updates the browser URL AND automatically triggers your route watcher 
  // (or page reload hook) to fetch the data cleanly without a double-firewall trip.
  await router.replace({
    path: route.path,
    query: taleFilterStore.getAsDictionary()
  });
}

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath.value}`)
}


onUnmounted(() => {
  taleStore.abort();
});


</script>

<template>
  
  <template v-if="isLoading">

  <div class="loader" role="status" aria-label="Loading tales">
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

   
  <header class="page-header page-header--max">
    <h2 class="page-header__title">
      Discover Tales
    </h2>
    <div class="page-header__lines">
      <p class="page-header__lines--item"></p>
      <p class="page-header__lines--item"></p>
    </div>
              <button type="button" @click="modalStore.push('TaleListFilter', 'Filter Lists', type)"  class="btn btn--primary">
                Filter
              </button>
            </header>


       <InfiniteScroller
        :has-next="taleStore.hasNext"
        :is-fetching="taleStore.isFetchingMore"
        :error="taleStore.loadMoreError"
        @load-more="taleStore.loadMoreTales"
        @retry="taleStore.loadMoreTales">

         <div class="content-container">
  <article 
   v-for="tale in taleStore.tales" 
            :key="tale.taleId" 
  class="tale-card">

  <div class="tale-card__media">
    <template  v-if="tale.photo">
<img :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb')" :alt="tale.title" />
    </template>
     <template v-else>
       <div class="tale-card__media--empty">
     <p> <SvgIcons name="nophoto" :size="60" /></p>
    </div>
    </template>
  </div>
   

      <div class="tale-card__content">

      <TaleTextComponent 
              :tale="tale" 
              type="pill" 
            />

        </div>

      </article>

    </div>

       </InfiniteScroller>



       <!-- Fixed Bottom Filter & Sort Footer -->
    <footer class="page-footer-bar">
      <div class="page-footer-bar__inner">
        <!-- Quick Sort: Newest -->
        <button 
          type="button" 
          class="footer-filter-btn" 
          :class="{ active: taleFilterStore.sort === 'MostRecent' }"
          @click="setSort('MostRecent')"
        >
          Newest
        </button>

        <span class="footer-divider">|</span>

        <!-- Quick Sort: Oldest -->
        <button 
          type="button" 
          class="footer-filter-btn" 
          :class="{ active: taleFilterStore.sort === 'LeastRecent' }"
          @click="setSort('LeastRecent')"
        >
          Oldest
        </button>

        <span class="footer-divider">|</span>

        <!-- More Filters Modal Trigger -->
        <button 
          type="button" 
          class="footer-filter-btn footer-filter-btn--more" 
          @click="modalStore.push('TaleListFilter', 'Filter Lists', type)"
        >
         
          More filters
        </button>
      </div>
    </footer>
  </template>

  <template v-else>
    <PageStatusMessage
      title="No Tale Found!"
      message="We did not find any tale matching your search parameters."
      icon="inbox"
      :is-standalone="true">
        <template #actions>
           <button class="btn btn--primary"  @click="modalStore.push('TaleListFilter', 'Filter Lists', type)">
            Refine Search
          </button>
        </template>
    </PageStatusMessage>

  </template>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/discovery-container.less";

/* Secondary Grid: 4 Equal Columns (1fr 1fr 1fr 1fr) */
.content-container {
  max-width: calc(100% - 20px);
  margin: 0 auto;
  display: grid;
  gap: 2rem 1rem;
  position: relative;

  @media @desktop, @laptop{
    grid-template-columns: repeat(4, 1fr);
    width: @max-width;
  }

  @media @tablet {
    grid-template-columns: repeat(2, 1fr);
    width: @mid-width;
  }

   @media @phablet {
    grid-template-columns: repeat(2, 1fr);
    width: @mod-width;
  }

  @media @phone {
    grid-template-columns: 1fr;
     width: @min-width;
  }
}


.tale-strip {
  width: 100%;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media @tablet, @phablet, @phone {
    flex-direction: column;
  }

   @media @desktop, @laptop{
    margin: 4rem 0;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-width: 0;

    /* Card level dimension cap and centralization */
    width: 100%;
    max-width: @min-width;
    margin: 0 auto;

    @media @tablet, @phablet {
      flex-direction: row;
      max-width: @mid-width; /* Expands symmetrically on tablet when switching to row layout */
    }
  }


}



.tale-card {
  width: 100%;
  height: auto;
 
 
  &__media {
    width: 100%;
    aspect-ratio: 450 / 337;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--light-background-color);
    position: relative;
    margin-bottom: 1rem;

    &--empty{
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items:center;
    }

    @media @tablet, @phablet {
      width: 45%;
      height: auto;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  }
}

</style>