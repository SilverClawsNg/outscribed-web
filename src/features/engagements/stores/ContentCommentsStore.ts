import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useContentCommentsFilterStore } from './ContentCommentsFilterStore.ts'
import { APIError } from '@/api/apiTypes.ts'
import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import type{CommentListDto, GetContentCommentsResponse, GetCommentThreadResponse, 
    GetEngagementIdsResponse, LoadingCommentsResponse, 
    LoadingCommentThreadResponse, SourceContentDto} from '../types/EngagementTypes.ts';
import {initializeCommentListEngagement} from '../types/EngagementTypes.ts';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts';
import { useLoginHint } from '@/utils/authHelper'

export const useContentCommentsStore = defineStore('contentComments', () => {

  const authStore = useAuthStore();
  const commentFilterStore = useContentCommentsFilterStore();
const isLoggedIn = useLoginHint()

  let feedController: AbortController | null = null;
  let hydrateController: AbortController | null = null;

  // --- Core Actions ---

  /**
   * 1. LoadComments (Initial setup for a Tale or Insight comment list)
   */

  async function loadComments(apiPathWithFilters: string) : Promise<LoadingCommentsResponse>{
  
      // 2. Initialize the default response layout envelope right at the entrance gate
        const response: LoadingCommentsResponse = {
          success: false,
          comments: [],
          hasNext: false,
          pointer: null,
          anchor: null,
          error: null
        };
        
    try {

      feedController = new AbortController();

      const outcome = await getAsync<GetContentCommentsResponse>(apiPathWithFilters, false, {} as GetContentCommentsResponse, 
        feedController.signal);

     if (outcome.isFailure) {
      response.error = outcome.error || null
        return response;
      }
       
      if (outcome.value && outcome.value.comments) {
        response.hasNext = outcome.value.hasNext;
        response.pointer = outcome.value.pointer;
        response.anchor = outcome.value.anchor;

        // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      response.comments = outcome.value.comments.map((item: any) => initializeCommentListEngagement(item));

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
  /**
   * 2. LoadMoreComments (Infinite scroll continuation pipeline)
   */
  async function loadMoreComments(apiPathWithFilters: string) : Promise<LoadingCommentsResponse> {

      // 2. Initialize the default response layout envelope right at the entrance gate
        const response: LoadingCommentsResponse = {
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
               
        const outcome = await getAsync<GetContentCommentsResponse>(apiPathWithFilters, false, {} as GetContentCommentsResponse,
            feedController.signal
        )

          if (outcome.isFailure) {
      response.error = outcome.error || null
        return response;
      }

        
    // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.value && outcome.value.comments) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          response.hasNext = outcome.value.hasNext;
          response.pointer = outcome.value.pointer;

            // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      response.comments = outcome.value.comments.map((item: any) => initializeCommentListEngagement(item));


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
   * 4. HydratePersonals (The "Private Truth" authentication state loop with backoff resilience)
   */
  async function hydratePersonals(currentBatch: CommentListDto[]) {
  
    // 1. Guard Clause: Skip entirely if anonymous or batch package is empty
    if (!isLoggedIn || currentBatch.length === 0) {
      activateEngagementButtons(currentBatch);
      console.log('[HydratePersonals]: Not logged in or empty batch.');
      return;
    }

     const maxRetries = 2; // Loops: 0, 1, 2 (Total 3 attempts)
    const commentIds = currentBatch.map(x => x.commentId);

 for (let i = 0; i <= maxRetries; i++) {

      try {

          // Spawn a fresh controller instance for this specific execution pass
        hydrateController = new AbortController();

       // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await postAsync<GetEngagementIdsResponse>('api/engagements/ids', { contentIds: commentIds }, true,
          hydrateController.signal
        );

        if (outcome.isSuccess) {

          const favSet = new Set<string>(outcome.value?.favoriteIds || []);
          const flagSet = new Set<string>(outcome.value?.flagIds || []);
          const upSet = new Set<string>(outcome.value?.upvoteIds || []);
          const downSet = new Set<string>(outcome.value?.downvoteIds || []);

          currentBatch.forEach(comment => {
          if(comment.engagement){

            comment.engagement.isFavorite = favSet.has(comment.commentId);
            comment.engagement.hasFlagged = flagSet.has(comment.commentId);
            
            if (upSet.has(comment.commentId)) comment.engagement.myVote = 'Upvote';
            else if (downSet.has(comment.commentId)) comment.engagement.myVote = 'Downvote';
            else comment.engagement.myVote = 'None';
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

  function activateEngagementButtons(currentBatch: CommentListDto[]) {

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
   
    hydratePersonals,
    loadComments,
    loadMoreComments,
       abort

  };
});