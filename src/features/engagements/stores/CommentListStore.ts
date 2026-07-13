import { defineStore } from 'pinia';
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

export const useCommentListStore = defineStore('commentList', () => {

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

      const outcome = await getAsync<GetContentCommentsResponse>(apiPathWithFilters, true, {} as GetContentCommentsResponse, 
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
               
        const outcome = await getAsync<GetContentCommentsResponse>(apiPathWithFilters, true, {} as GetContentCommentsResponse,
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
   * 3. LoadThread (Used when clicking external notification paths outside content page context)
   */
  async function loadThread(apiPath: string): Promise<LoadingCommentThreadResponse> {

   
      // 2. Initialize the default response layout envelope right at the entrance gate
        const response: LoadingCommentThreadResponse = {
          success: false,
          ancestors: [],
          source: null,
          focus: null,
          error: null
        };
        

    try {

         // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

     const outcome = await getAsync<GetCommentThreadResponse>(apiPath, true, {} as GetCommentThreadResponse,
            feedController.signal
        )
        
          if (outcome.isFailure) {
      response.error = outcome.error || null
        return response;
      }

        // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.value) {
    
          // Commit clean data to store state
          //activeThread.value = outcome.value;

          
        // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      response.ancestors = outcome.value.ancestors.map((item: any) => initializeCommentListEngagement(item));
      response.focus = initializeCommentListEngagement(outcome.value.focus)
      response.source = outcome.value.source

        // 🎯 Execute the layout assembly loop completely on the client side
            buildAncestorChains(response.source, response.focus, response.ancestors);

                //const batchToHydrate = [activeThread.value.focus, ...activeThread.value.ancestors];

                //await hydratePersonals(batchToHydrate);

                response.success = true

        // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
        return response;

    } 
    
      
    // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
    response.error = new APIError(
        404,
        '404: Not Fount!',
        'We could not find any thread with the provided id.'
      );
    return response;


    }catch (err: any) {
    // Fail-safe catch-all wrapper
    response.error = err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.', 'Client.Exception')
    return response;
  }
  
  }

  /**
 * Walks down a flat list of ancestors chronologically from the root 
 * down to the focus comment, building individual ancestry arrays for each node.
 */
function buildAncestorChains(source: SourceContentDto, focus: CommentListDto, ancestors: CommentListDto[]) {
    
  if (ancestors.length === 0) {
   // If there are zero ancestors, the focus comment is the root
      focus.ancestors = [];
      focus.title = source.title;
    return;
  }

  const sourceTitle = source.title;
  const flatAncestors = ancestors;

  // Step 1: Find the absolute root ancestor (where parentId is null or empty)
  let current = flatAncestors.find(c => !c.parentId);

  if (!current) return;

  const runningChain: CommentListDto[] = [];

  // Step 2: Walk sequentially down the parent -> child tree links
  while (current) {
    // Assign a shallow clone array of the ancestry history up to this point
    current.ancestors = [...runningChain];
    current.title = sourceTitle;

    // Push the current node into the timeline history list for the next iteration
    runningChain.push(current);

    // Find the immediate child whose parentId points to this current comment's ID
    const nextChildId: string = current.commentId;
    current = flatAncestors.find(c => c.parentId === nextChildId);
  }

  // Step 3: Assign the complete history lineage path straight onto the Focus target
  focus.ancestors = [...runningChain];
  focus.title = sourceTitle;
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
    activateEngagementButtons,
    loadComments,
    loadMoreComments,
    loadThread,
       abort

  };
});