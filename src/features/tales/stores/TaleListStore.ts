import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import {type GetFavoriteIdsResponse } from '@/features/engagements/types/EngagementTypes.ts'
import { APIError } from '@/api/apiTypes.ts'
import { useTaleListFilterStore } from './TaleListFilterStore.ts'
import { useLoginHint } from '@/utils/authHelper'

import {type TaleListDto, type GetTaleListResponse, initializeTaleListEngagement} from '../types/TalesTypes.ts';

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useTaleListStore = defineStore('taleList', () => {
  
  const filterStore = useTaleListFilterStore()
  const isLoggedIn = useLoginHint()

  // State
  const tales = ref<TaleListDto[]>([]);

  // 📥 Staging Queue: Holds references until the View explicitly triggers hydration
  const awaitingHydration = ref<TaleListDto[]>([]);
  
  // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | null>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('api/tales'); 
  const loadMoreError = ref<APIError | null>(null)

  // 🔒 Keep the controller private/local to this store context
let feedController: AbortController | null = null;
 let hydrateController: AbortController | null = null;
  // --- Store Actions ---

  // 1. Initial Load Path
 // Inside useTaleStore

 
  // Sets the target tale before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the user doesn't alter 
    // the background list until they actually hit 'Save'
    baseRoute.value = apiUrl;
  }

// 1. Initial Load Path
async function loadTales(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

  try {

      // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

    // Note: Assuming getAsync is part of your API client layer
    const outcome = await getAsync<GetTaleListResponse>(apiPathWithFilters, false, {} as GetTaleListResponse,
      feedController.signal
    );

    // Consideration 1: Check if any error and immediately return to caller
    if (outcome.isFailure) {
      return { success: false, error: outcome.error || null };
    }
    
    // Consideration 2: Reconcile updates if data was retrieved
    if (outcome.isSuccess && outcome.value?.tales?.length) {

      // Commit clean data to store state
      hasNext.value = outcome.value.hasNext;
      pointer.value = outcome.value.pointer;
      anchor.value = outcome.value.anchor;

// 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      const freshItems = outcome.value.tales.map((item: any) => initializeTaleListEngagement(item));

      tales.value = freshItems;
     awaitingHydration.value = freshItems;

    } else {
      // Clear store list if server explicitly returned nothing/null to prevent stale state bleed
      tales.value = [];
       hasNext.value = false;
      pointer.value = '-1';
    }

    // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
    return { success: true, error: null };

  } catch (err: any) {
    // Fail-safe catch-all wrapper
    return { 
      success: false, 
      error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
    };
  }
}


async function loadMoreTales() {
  // 1. Load structural batch into UI array stream
  await executeLoadMoreTales();

  // 2. Clear out the new batch references immediately after the scroll render cycle
  if (isLoggedIn.value) {
    await hydratePersonals(); 
  }
}


  // 2. Infinite Scroll Path (LoadMore)
  async function executeLoadMoreTales() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetTaleListResponse>(nextPageUrl, false, {} as GetTaleListResponse,
          feedController.signal
        )

    if (outcome.isFailure) {
          if (outcome.error) {
            loadMoreError.value = outcome.error
          }
            else{
                loadMoreError.value = new APIError(
                    500,
                    'Unknown Error!',
                    'Unknown error occured while retrieving tales. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
         if (outcome.isSuccess && outcome.value?.tales?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(tales.value.map(t => t.taleId));
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
          const freshItems = outcome.value.tales
            .filter((t: any) => !existingIds.has(t.taleId))
            .map((item: any) => initializeTaleListEngagement(item));

           tales.value.push(...freshItems);
      
      // 📌 Append the new batch to the staging queue
      awaitingHydration.value.push(...freshItems);

        } else{ // stop infinite scrolling by setting has next to false
          hasNext.value = false
          pointer.value ='-1'
        }
       
        } catch (err) {
            console.error("Handled gracefully:", err)
          }finally {
          isFetchingMore.value = false;
        }

  }
 
  function resetState() {
    tales.value = [];
    pointer.value = '1';
    hasNext.value = false;
     anchor.value = null;
  }

  
  /**
   * 💧 Parameterless Hydration (Self-Draining)
   */
  async function hydratePersonals(): Promise<void> {
    if (awaitingHydration.value.length === 0) return;

    // 🛡️ Lock-free Snapshot: Copy references and clear immediately to 
    // prevent rapid subsequent scroll ticks from causing double-hydration.
    const itemsToHydrate = [...awaitingHydration.value];
    awaitingHydration.value = [];

    // Run the actual network metrics update over the isolated snapshot array
    await executeHydration(itemsToHydrate);
  }


  /**
   * Resilient Hydrator structured directly around ApiResult contracts
   */
  async function executeHydration(currentBatch: TaleListDto[]) {

    // 1. Guard Clause: Skip entirely if anonymous or batch package is empty
    if (!isLoggedIn || currentBatch.length === 0) {
      activateEngagementButtons(currentBatch);
      console.log('[HydratePersonals]: Not logged in or empty batch.');
      return;
    }

    const maxRetries = 2; // Loops: 0, 1, 2 (Total 3 attempts)
    const taleIds = currentBatch.map((x) => x.taleId);

    for (let i = 0; i <= maxRetries; i++) {

      try {

          // Spawn a fresh controller instance for this specific execution pass
        hydrateController = new AbortController();

        // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await postAsync<GetFavoriteIdsResponse>('api/favorites/ids', { contentIds: taleIds }, true,
          hydrateController.signal
        );

        if(outcome.isSuccess){

           if(outcome.value && outcome.value.favoriteIds){
            const favSet = new Set<string>(outcome.value.favoriteIds);

            currentBatch.forEach((tale) => {
              tale.engagement.isFavorite = favSet.has(tale.taleId);
            });
          }

          // Even if the list returned empty, it's a valid definitive response state!
          activateEngagementButtons(currentBatch);
          return;

        } else {
          // If error metadata is missing, or the status code dictates retrying isn't worthwhile
          if (!outcome.error || !isRetryWorthwhile(outcome.error.status)) {
            activateEngagementButtons(currentBatch);
            return;
          }
          
          // Log out retry tracking context internally
          console.warn(`[HydratePersonals]: Attempt ${i + 1} failed with code ${outcome.error.status}. Retrying...`);
        }

      } catch (HttpRequestException) {/* Network drops are always retry-worthy */}

      // ⏱️ Exponential Backoff Calculation: 1000ms * (i + 1) -> 1s, then 2s
      const delayDuration = 1000 * (i + 1);
      await new Promise((resolve) => setTimeout(resolve, delayDuration));
    }

    // 🛡️ All failsafe attempts exhausted. Unlock buttons to prevent locking up the UI experience.
    activateEngagementButtons(currentBatch);
  }

  /**
   * Translates your Blazor 'IsRetryWorthwhile' logic
   */
  function isRetryWorthwhile(statusCode: number): boolean {
    // Retry on server crashes (5xx), explicit Request Timeout (408), or Rate Limiting (429)
    return statusCode >= 500 || statusCode === 408 || statusCode === 429;
  }

  /**
   * Mass unlocks the interactive boundary states across the batch collection
   */
  function activateEngagementButtons(currentBatch: TaleListDto[]) {
    currentBatch.forEach((tale) => {
      tale.engagement.isEngagementLoaded = true;
    });
  }

   function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
      if (hydrateController) {
      hydrateController.abort();
      hydrateController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
  }

  return {
    tales, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute,
    hydratePersonals, activateEngagementButtons, setBaseRoute, loadTales, loadMoreTales, resetState, abort
  };

});
