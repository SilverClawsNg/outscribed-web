import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import {type CommentPageListDto } from '@/features/engagements/types/EngagementTypes.ts'
import { type InsightLatestListDto } from '@/features/insights/types/InsightsTypes' // 🎯 Import your clean semantics
import {initializeAccountEngagement } from '@/features/identity/types/IdentityTypes.ts'

import { APIError } from '@/api/apiTypes.ts'
import { useTaleListFilterStore } from './TaleListFilterStore.ts'
import { useLoginHint } from '@/utils/authHelper'

import {type TaleDetailDto, type GetTaleDetailPersonalizeResponse, type GetTalePageEnrichmentResponse, 
  initializeTaleDetailEngagement, hydrateTaleEngagement} from '../types/TalesTypes.ts';

export const useTaleDetailStore = defineStore('taleDetail', () => {
  
  // State
    const tale = ref<TaleDetailDto | null>(null);
    const latestInsights = ref<InsightLatestListDto[]>([]);
    const latestComments = ref<CommentPageListDto[]>([]);

    const isLoggedIn = useLoginHint()
    const hasLoadedEnrichment = ref<boolean>(false);


  // 🔒 Keep the controller private/local to this store context
  let feedController: AbortController | null = null;
 let hydrateController: AbortController | null = null;
 let enrichController: AbortController | null = null;
  let recordController: AbortController | null = null;

  // --- Store Actions ---

// 1. Initial Load Path
async function loadTale(taleId: string): Promise<{ success: boolean; error: APIError | null }> {

  try {

    reset()

      // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

    // Note: Assuming getAsync is part of your API client layer
    const outcome = await getAsync<TaleDetailDto>(`api/tales/${taleId}`, false, {} as TaleDetailDto, feedController.signal);

    // Consideration 1: Check if any error and immediately return to caller
    if (outcome.isFailure) {
      return { success: false, error: outcome.error || null };
    }
    
    // Inside profileStore.ts fallback block
    if (!outcome.value) {
      
      // 🎯 Instantiate your exact class blueprint with matching parameters
      const error = new APIError(
        404,
        'Not Found!',
        'Sorry. Sorry. We could not find the tale you requested. It may have been removed, hidden, or archived.'
      )
      
          return { success: false, error: error }
    }

    // Consideration 2: Reconcile updates if data was retrieved
    if (outcome.value) {

// 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      tale.value = initializeTaleDetailEngagement(outcome.value);
      tale.value.creator = initializeAccountEngagement(outcome.value.creator)

      hydratePersonals()

    } else {
      // Clear store list if server explicitly returned nothing/null to prevent stale state bleed
      tale.value = null;
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

// 1. Initial Load Path
async function loadArchivedTale(taleId: string): Promise<{ success: boolean; error: APIError | null }> {

  try {

      // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

    // Note: Assuming getAsync is part of your API client layer
    const outcome = await getAsync<TaleDetailDto>(`api/tales/archives/${taleId}`, true, {} as TaleDetailDto, feedController.signal);

    // Consideration 1: Check if any error and immediately return to caller
    if (outcome.isFailure) {
      return { success: false, error: outcome.error || null };
    }
    
    // Inside profileStore.ts fallback block
    if (!outcome.value) {
      
      // 🎯 Instantiate your exact class blueprint with matching parameters
      const error = new APIError(
        404,
        'Not Found!',
        'Sorry. Sorry. We could not find the tale you requested. It may have been removed, hidden, or archived.'
      )
      
          return { success: false, error: error }
    }

    // Consideration 2: Reconcile updates if data was retrieved
    if (outcome.value) {

// 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      tale.value = initializeTaleDetailEngagement(outcome.value);
      tale.value.creator = initializeAccountEngagement(outcome.value.creator)


      hydratePersonals()

    } else {
      // Clear store list if server explicitly returned nothing/null to prevent stale state bleed
      tale.value = null;
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

  /**
   * Resilient Hydrator structured directly around ApiResult contracts
   */
  async function hydratePersonals() {

    

    // 1. Guard Clause: Skip entirely if anonymous or batch package is empty
    if (!isLoggedIn.value) {
      activateEngagementButtons();
      console.log('[HydratePersonals]: Not logged in or empty batch.');
      return;
    }

    const maxRetries = 2; // Loops: 0, 1, 2 (Total 3 attempts)

    for (let i = 0; i <= maxRetries; i++) {

      try {

          // Spawn a fresh controller instance for this specific execution pass
        hydrateController = new AbortController();

        // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await getAsync<GetTaleDetailPersonalizeResponse>(`api/tales/personalized/${tale.value?.taleId}/${tale.value?.creator.accountId}`, 
        true, {} as GetTaleDetailPersonalizeResponse, hydrateController.signal);

        if(outcome.isSuccess){

           if(outcome.value && tale.value != null){
           
            tale.value.engagement.isFavorite = outcome.value.isFavorite
            tale.value.engagement.hasFlagged = outcome.value.hasFlagged
            tale.value.engagement.myVote = outcome.value.myVote

            tale.value.creator.engagement.isFavorite = outcome.value.iscreatorFavorite
          }

          // Even if the list returned empty, it's a valid definitive response state!
          activateEngagementButtons();
          return;

        } else {
          // If error metadata is missing, or the status code dictates retrying isn't worthwhile
          if (!outcome.error || !isRetryWorthwhile(outcome.error.status)) {
            activateEngagementButtons();
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
    activateEngagementButtons();
  }

  async function enrichTale() {

 
      try {

          // Spawn a fresh controller instance for this specific execution pass
        enrichController = new AbortController();

        // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await getAsync<GetTalePageEnrichmentResponse>(`api/tales/enrichment/${tale.value?.taleId}`, 
         true, {} as GetTalePageEnrichmentResponse, enrichController.signal);

       if (outcome.isSuccess) {
  console.log('[Enrich Debug] Network success. Data:', outcome.value);

  if (outcome.value && tale.value != null) {
    // 🎯 FIX: Shift from PascalCase to match the lowercase log footprints
    latestInsights.value = outcome.value.insights || []
    latestComments.value = outcome.value.comments || []
    hydrateTaleEngagement(tale.value.engagement, outcome.value.stats);

    // notify ui that enrichment is ready
    hasLoadedEnrichment.value = true
    console.log('[Enrich Debug] Reactivity flags successfully updated.');
  }
  return;
}else {
          console.warn('[Enrich Debug] Assignment bypassed! outcome.value or tale.value was missing.');
        
        }
  return;
      } catch (HttpRequestException) {/* Network drops are always retry-worthy */}


}

async function recordView() {

  try {

    // The Fact: 5 seconds is the industry standard for a "True View"
    // Spawn a fresh controller instance for this specific execution pass
    recordController = new AbortController();

    // Wait the "True View" threshold (5s). If aborted, reject with AbortError.
    await new Promise((resolve, reject) => {

      const timer = setTimeout(resolve, 5000);

      recordController!.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });

    });

    const formData = {
      contentId: tale.value?.taleId
    }

    if(isLoggedIn.value){
       await postAsync(`api/viewing/increment/authenticated`, formData, true, recordController.signal);
    }
    else{
      await postAsync(`api/viewing/increment/anonymous`, formData, false, recordController.signal);
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      // The Fiction: "They read it."
      // The Fact: They left too early. No view recorded.
      console.log('User navigated away before the 5 second read threshold.');
    }
  }

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
  function activateEngagementButtons() {

    if(tale.value !== null){
        tale.value.engagement.isEngagementLoaded = true;
        tale.value.creator.engagement.isEngagementLoaded = true;
    }
       
  }

  function reset() {
    tale.value = null
    latestInsights.value = []
    latestComments.value = []
    abort()
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
      console.log('[Store]: Requests successfully canceled via hydrateController.');
    }
    if (enrichController) {
      enrichController.abort();
      enrichController = null;
      console.log('[Store]: Requests successfully canceled via enrichController.');
    }
     if (recordController) {
      recordController.abort();
      recordController = null;
      console.log('[Store]: Requests successfully canceled via recordController.');
    }
  }

  return {
    tale, hasLoadedEnrichment, latestInsights, latestComments, loadTale, loadArchivedTale, enrichTale, recordView, reset, abort
  };

});
