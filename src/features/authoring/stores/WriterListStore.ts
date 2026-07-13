import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import {type GetFavoriteIdsResponse } from '@/features/engagements/types/EngagementTypes.ts'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts';
import { APIError } from '@/api/apiTypes.ts'
import { useWriterListFilterStore } from './WriterListFilterStore.ts'

import {type WriterListDto, type GetWriterListResponse} from '../types/AuthoringTypes.ts';
import {initializeAccountEngagement } from '@/features/identity/types/IdentityTypes.ts'
import { useLoginHint } from '@/utils/authHelper'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useWriterListStore = defineStore('writerList', () => {
  
  const authStore = useAuthStore();
  const filterStore = useWriterListFilterStore()
  const isLoggedIn = useLoginHint()

  // State
  const writers = ref<WriterListDto[]>([]);

  // 📥 Staging Queue: Holds references until the View explicitly triggers hydration
  const awaitingHydration = ref<WriterListDto[]>([]);
  
  // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | null>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('api/writers'); 
  const loadMoreError = ref<APIError | null>(null)

  // 🔒 Keep the controller private/local to this store context
  let feedController: AbortController | null = null;
 let hydrateController: AbortController | null = null;
  // --- Store Actions ---

  // 1. Initial Load Path
 // Inside useWriterStore

 
  // Sets the target writer before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the user doesn't alter 
    // the background list until they actually hit 'Save'
    baseRoute.value = apiUrl;
  }

// 1. Initial Load Path
async function loadWriters(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

  try {

    reset()

      // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

    // Note: Assuming getAsync is part of your API client layer
    const outcome = await getAsync<GetWriterListResponse>(apiPathWithFilters, true, {} as GetWriterListResponse,
      feedController.signal
    );

    // Consideration 1: Check if any error and immediately return to caller
    if (outcome.isFailure) {
      return { success: false, error: outcome.error || null };
    }
    
    // Consideration 2: Reconcile updates if data was retrieved
    if (outcome.isSuccess && outcome.value?.writers?.length) {

      // Commit clean data to store state
      hasNext.value = outcome.value.hasNext;
      pointer.value = outcome.value.pointer;
      anchor.value = outcome.value.anchor;

const freshItems = outcome.value.writers.map((item: WriterListDto) => {
  // 1. Safely extract the raw nested JSON document reference
  const rawTale = item.latestTaleRaw as Record<string, any> | null;
  
  // 2. Map the database PascalCase fields to your clean frontend camelCase interface
  const mappedLatestTale = rawTale ? {
    taleId: rawTale.TaleId || '',
    createdAt: rawTale.CreatedAt,
    title: rawTale.Title,
    slug: rawTale.Slug,
    summary: rawTale.Summary
  } : null;

  return {
    ...item,
    // 🛡️ Keeps your existing working creator initialization logic untouched
    creator: initializeAccountEngagement(item.creator),
    
    // 🎯 Appends the missing object property required by your v-if condition
    latestTale: mappedLatestTale
  };
});
     writers.value = freshItems;
     awaitingHydration.value = freshItems;

       // Post-Load: Background Personal Engagement Hydration

    } else {
      // Clear store list if server explicitly returned nothing/null to prevent swriter state bleed
      writers.value = [];
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

async function loadMoreWriters() {
  // 1. Load structural batch into UI array stream
  await executeLoadMoreWriters();

  // 2. Clear out the new batch references immediately after the scroll render cycle
  if (isLoggedIn.value) {
    await hydratePersonals(); 
  }
}

  // 2. Infinite Scroll Path (LoadMore)
  async function executeLoadMoreWriters() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetWriterListResponse>(nextPageUrl, true, {} as GetWriterListResponse,
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
                    'Unknown error occured while retrieving writers. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.isSuccess && outcome.value?.writers?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(writers.value.map(t => t.creator.accountId));

          const freshItems = outcome.value.writers
                .filter((t: any) => !existingIds.has(t.creator.accountId))
                .map((item: any) => {
                  // 1. Check if the raw JSON document exists
                  const rawTale = item.latestTaleRaw;
                  
                  // 2. Map the PascalCase JSON fields safely to your frontend camelCase contract
                  const mappedLatestTale = rawTale ? {
                    taleId: rawTale.TaleId || '', // Check your exact property name from DB if needed
                    createdAt: rawTale.CreatedAt,
                    title: rawTale.Title,
                    slug: rawTale.Slug,
                    summary: rawTale.Summary
                  } : null;

    return {
      ...item,
      creator: initializeAccountEngagement(item.creator),
      
      // 🎯 FIX: Explicitly append the clean camelCased object your v-if expects!
      latestTale: mappedLatestTale 
    };
  });

          writers.value.push(...freshItems);
      
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
 
  function reset() {
    writers.value = [];
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
  async function executeHydration(currentBatch: WriterListDto[]) {

    // 1. Guard Clause: Skip entirely if anonymous or batch package is empty
    if (!isLoggedIn.value) {
      activateEngagementButtons(currentBatch);
      console.log('[HydratePersonals]: Not logged in or empty batch.');
      return;
    }

    const maxRetries = 2; // Loops: 0, 1, 2 (Total 3 attempts)
    const writerIds = currentBatch.map((x) => x.creator.accountId);

    for (let i = 0; i <= maxRetries; i++) {

      try {

          // Spawn a fresh controller instance for this specific execution pass
        hydrateController = new AbortController();

        // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await postAsync<GetFavoriteIdsResponse>('api/favorites/ids', { contentIds: writerIds }, true,
          hydrateController.signal
        );

        if(outcome.isSuccess){

           if(outcome.value && outcome.value.favoriteIds){
            const favSet = new Set<string>(outcome.value.favoriteIds);

            currentBatch.forEach((writer) => {
              writer.creator.engagement.isFavorite = favSet.has(writer.creator.accountId);
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
  function activateEngagementButtons(currentBatch: WriterListDto[]) {
    currentBatch.forEach((writer) => {
      writer.creator.engagement.isEngagementLoaded = true;
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
    writers, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute,
    hydratePersonals, activateEngagementButtons, setBaseRoute, loadWriters, loadMoreWriters, reset, abort
  };

});
