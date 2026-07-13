import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useEngagementCommentsFilterStore } from './EngagementCommentsFilterStore.ts'
import { APIError } from '@/api/apiTypes.ts'

import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import {initializeCommentPageListEngagement, 
    
    
    type LoadingPageCommentsResponse,
    type GetPageCommentsResponse, type CommentPageListDto, type GetFavoriteIdsResponse
} from '../types/EngagementTypes.ts';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts';
import { useLoginHint } from '@/utils/authHelper'

export const useEngagementCommentsStore = defineStore('engagementComments', () => {

  const filterStore = useEngagementCommentsFilterStore()

  let feedController: AbortController | null = null;
  let hydrateController: AbortController | null = null;

  const isLoggedIn = useLoginHint()

  // State
    const comments = ref<CommentPageListDto[]>([]);

    // 📥 Staging Queue: Holds references until the View explicitly triggers hydration
  const awaitingHydration = ref<CommentPageListDto[]>([]);
    
    // Loading and Tracking flags matching your C# states
    const isFetchingMore = ref<boolean>(false);
    const hasNext = ref<boolean>(false);
    const pointer = ref<string | null>('1');
    const anchor = ref<string | null>(null);
    const baseRoute = ref<string>('api/comments'); 
    const loadMoreError = ref<APIError | null>(null)

    
  // Sets the target insight before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the user doesn't alter 
    // the background list until they actually hit 'Save'
    baseRoute.value = apiUrl;
  }

  /**
   * 1. LoadComments (Initial setup for a Tale or Insight comment list)
   */

  async function loadComments(apiPathWithFilters: string) : Promise<LoadingPageCommentsResponse>{
  
      // 2. Initialize the default response layout envelope right at the entrance gate
        const response: LoadingPageCommentsResponse = {
          success: false,
          comments: [],
          hasNext: false,
          pointer: null,
          anchor: null,
          error: null
        };
        
    try {

      feedController = new AbortController();

      const outcome = await getAsync<GetPageCommentsResponse>(apiPathWithFilters, true, {} as GetPageCommentsResponse, 
        feedController.signal);

     if (outcome.isFailure) {
      response.error = outcome.error || null
        return response;
      }
       
     if (outcome.isSuccess && outcome.value?.comments?.length) {
        response.hasNext = outcome.value.hasNext;
        response.pointer = outcome.value.pointer;
        response.anchor = outcome.value.anchor;

        // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      const freshItems = outcome.value.comments.map((item: any) => initializeCommentPageListEngagement(item));

      comments.value.push(...freshItems);
     awaitingHydration.value.push(...freshItems);

      console.log('--- Vue State Snapshot inside loading contents store ---', JSON.parse(JSON.stringify(response.comments)));

      } 
      response.success = true
    // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
    return response;

    } catch (err: any) {
    // Fail-safe catch-all wrapper
    response.error = err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.', 'Client.Exception')
    return response;
  }
  }


async function loadMoreComments() {
  // 1. Load structural batch into UI array stream
  await executeLoadMoreComments();

  // 2. Clear out the new batch references immediately after the scroll render cycle
  if (isLoggedIn.value) {
    await hydratePersonals(); 
  }
}

  /**
   * 2. LoadMoreComments (Infinite scroll continuation pipeline)
   */
  async function executeLoadMoreComments() : Promise<LoadingPageCommentsResponse> {

      // 2. Initialize the default response layout envelope right at the entrance gate
        const response: LoadingPageCommentsResponse = {
          success: false,
          comments: [],
          hasNext: false,
          pointer: null,
          anchor: null,
          error: null
        };
        
    try {

  // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();
               

      const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)
              
        const outcome = await getAsync<GetPageCommentsResponse>(nextPageUrl, true, {} as GetPageCommentsResponse,
            feedController.signal
        )

          if (outcome.isFailure) {
      response.error = outcome.error || null
        return response;
      }

        
    // Consideration 2: Reconcile updates if data was retrieved
       if (outcome.isSuccess && outcome.value?.comments?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          response.hasNext = outcome.value.hasNext;
          response.pointer = outcome.value.pointer;

            // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      const freshItems = outcome.value.comments.map((item: any) => initializeCommentPageListEngagement(item));

        comments.value.push(...freshItems);
      
      // 📌 Append the new batch to the staging queue
      awaitingHydration.value.push(...freshItems);

        } else{ // stop infinite scrolling by setting has next to false
           response.hasNext = false
           response.pointer ='-1'
        }

         response.success = true
    // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
    return response;

    } catch (err: any) {
    // Fail-safe catch-all wrapper
    response.error = err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.', 'Client.Exception')
    return response;
  } 
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
   * 4. HydratePersonals (The "Private Truth" authentication state loop with backoff resilience)
   */
  async function executeHydration(currentBatch: CommentPageListDto[]) {
  
     const maxRetries = 2; // Loops: 0, 1, 2 (Total 3 attempts)
    const commentIds = currentBatch.map(x => x.commentId);

 for (let i = 0; i <= maxRetries; i++) {

      try {

          // Spawn a fresh controller instance for this specific execution pass
        hydrateController = new AbortController();

       // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await postAsync<GetFavoriteIdsResponse>('api/favorites/ids', { contentIds: commentIds }, true,
          hydrateController.signal
        );

        if (outcome.isSuccess) {

          const favSet = new Set<string>(outcome.value?.favoriteIds || []);

          currentBatch.forEach(comment => {
          if(comment.engagement){

            comment.engagement.isFavorite = favSet.has(comment.commentId);
        
          }

          });

           // Even if the list returned empty, it's a valid definitive response state!
          activateEngagementButtons(currentBatch);
          return;
        }else {
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

  function activateEngagementButtons(currentBatch: CommentPageListDto[]) {

          console.log('[activateEngagementButtons]: Starting engagement activation.');

       
    currentBatch.forEach(comment => {
        if(comment.engagement){
      comment.engagement.isEngagementLoaded = true;
      //console.log(`Activating engagement. ${comment.commentId} and is engaged ${comment.engagement.isEngagementLoaded}`);
        }
    });


// 📋 Flatten and snapshot the live state to see if hydration stuck
  //console.log('--- Vue State Snapshot inside activateEngagementButtons ---', JSON.parse(JSON.stringify(currentBatch)));

  }

  function resetState() {
    comments.value = [];
    pointer.value = '1';
    hasNext.value = false;
     anchor.value = null;
  }

   function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled via feedController.');
    }
   if (hydrateController) {
      hydrateController.abort();
      hydrateController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
  }

  return {
   
    comments, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute,
    hydratePersonals, activateEngagementButtons, setBaseRoute, loadComments, loadMoreComments, resetState, abort
   
  };
});