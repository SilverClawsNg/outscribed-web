// @/stores/useUserProfileStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAsync} from '@/api/apiGetServices'
import { postAsync} from '@/api/apiPostServices'

import {type GetFavoriteIdResponse } from '@/features/engagements/types/EngagementTypes.ts'

import { APIError } from '@/api/apiTypes'
import { type GetUserProfileResponse, initializeUserEngagement } from '../types/IdentityTypes'
import { useLoginHint } from '@/utils/authHelper'

export const useUserProfileStore = defineStore('userProfile', () => {

const profile = ref<GetUserProfileResponse | null>(null)
 const isLoggedIn = useLoginHint()

 
  // 🔒 Keep the controller private/local to this store context
  let feedController: AbortController | null = null;
 let hydrateController: AbortController | null = null;
    let recordController: AbortController | null = null;

  // --- 👥 SOCIAL CONTACT LOOKUPS ---
  const facebook = computed(() => profile.value?.contacts?.find(c => c.type === 'Facebook')?.title || null)
  const facebookLink = computed(() => `https://facebook.com/${facebook.value || ''}`)
  
  const twitter = computed(() => profile.value?.contacts?.find(c => c.type === 'Twitter')?.title || null)
  const twitterLink = computed(() => `https://twitter.com/${twitter.value || ''}`)
  
  const linkedin = computed(() => profile.value?.contacts?.find(c => c.type === 'LinkedIn')?.title || null)
  const linkedinLink = computed(() => `https://linkedin.com/in/${linkedin.value || ''}`)
  
  const email = computed(() => profile.value?.contacts?.find(c => c.type === 'Email')?.title || null)
  

  // 1. Fetch, Increment Metrics, and Hydrate Relationships
  async function loadProfile(accountId: string) {
   
    try {

         reset()

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

      // Fetch public profile record from your .NET identity slice
      const outcome = await getAsync<GetUserProfileResponse>(`/api/identity/profile/${accountId}`, false, {} as GetUserProfileResponse,
      feedController.signal)

        if (outcome.isFailure) {
      return { success: false, error: outcome.error || null }
    }
    
    // Inside profileStore.ts fallback block
    if (!outcome.value) {
      
      // 🎯 Instantiate your exact class blueprint with matching parameters
      const error = new APIError(
        404,
        'Not Found!',
        'Sorry. We could not find a profile for this user.'
      )
      
          return { success: false, error: error }
    }

      profile.value = outcome.value

      profile.value.user = {
      accountId: profile.value.accountId,
      username: profile.value.username,
      engagement: null
     }

      profile.value.user = initializeUserEngagement(outcome.value.user)

     return { success: true, error: null }
    
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
          const outcome = await getAsync<GetFavoriteIdResponse>(`api/favorites/id/${profile.value?.accountId}`, 
          true, {} as GetFavoriteIdResponse, hydrateController.signal);
  
          if(outcome.isSuccess){
  
             if(outcome.value && profile.value != null){
              profile.value.user.engagement.isFavorite = outcome.value.favoriteId == profile.value?.accountId

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

    if(profile.value !== null){
        profile.value.user.engagement.isEngagementLoaded = true;
    }
       
  }


async function recordView() {

  try {

    // The Fact: 5 seconds is the industry standard for a "True View"
    // Spawn a fresh controller instance for this specific execution pass
    recordController = new AbortController();

    const formData = {
      contentId: profile.value?.accountId
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
  
  // 4. 🧼 Technical Reset Pattern
  function reset() {
    profile.value = null
    console.log('[User Profile Store]: Clean reset executed.')
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
      console.log('[Store]: Requests successfully canceled via hydrateController.');
    }
  }


  return {
    profile,
     facebook,
    twitter,
    linkedin,
    email,
    facebookLink,
    twitterLink,
    linkedinLink,
    recordView,
    hydratePersonals,
    loadProfile,
    reset,
    abort
  }
})