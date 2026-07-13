import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { type GetFavoriteIdsResponse } from '@/features/engagements/types/EngagementTypes.ts'
import { APIError } from '@/api/apiTypes.ts'
import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import type{UserListDto, GetUserListResponse} from '../types/IdentityTypes.ts';
import {initializeUserListEngagement} from '../types/IdentityTypes.ts';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts';
import { useLoginHint } from '@/utils/authHelper'
import { useUserListFilterStore } from './UserListFilterStore.ts'

class HashSetOrSet extends Set<string> {}

export const useUserListStore = defineStore('userList', () => {

  const isLoggedIn = useLoginHint()
  let feedController: AbortController | null = null;
  let hydrateController: AbortController | null = null;
  const filterStore = useUserListFilterStore()

  const users = ref<UserListDto[]>([]);
  const awaitingHydration = ref<UserListDto[]>([]);
  
  // Loading and Tracking flags matching your C# states
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | null>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('api/users'); 
  const loadMoreError = ref<APIError | null>(null)


  // Sets the target insight before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the user doesn't alter 
    // the background list until they actually hit 'Save'
    baseRoute.value = apiUrl;
  }

  // --- Core Actions ---

  /**
   * 1. LoadUsers (Initial setup for a Tale or User user list)
   */

// 1. Initial Load Path
async function loadUsers(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

  try {

      // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

    // Note: Assuming getAsync is part of your API client layer
    const outcome = await getAsync<GetUserListResponse>(apiPathWithFilters, true, {} as GetUserListResponse,
      feedController.signal
    );

    // Consideration 1: Check if any error and immediately return to caller
    if (outcome.isFailure) {
      return { success: false, error: outcome.error || null };
    }
    
    // Consideration 2: Reconcile updates if data was retrieved
    if (outcome.isSuccess && outcome.value?.users?.length) {

      // Commit clean data to store state
      hasNext.value = outcome.value.hasNext;
      pointer.value = outcome.value.pointer;
      anchor.value = outcome.value.anchor;

// 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      const freshItems = outcome.value.users.map((item: any) => initializeUserListEngagement(item));

       users.value = freshItems;
     awaitingHydration.value = freshItems;

       // Post-Load: Background Personal Engagement Hydration

    } else {
      // Clear store list if server explicitly returned nothing/null to prevent suser state bleed
      users.value = [];
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

async function loadMoreUsers() {
  // 1. Load structural batch into UI array stream
  await executeLoadMoreUsers();

  // 2. Clear out the new batch references immediately after the scroll render cycle
  await hydratePersonals(); 
}

  // 2. Infinite Scroll Path (LoadMore)
  async function executeLoadMoreUsers() {

    if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;

    try {

        // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetUserListResponse>(nextPageUrl, true, {} as GetUserListResponse,
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
                    'Unknown error occured while retrieving users. Refresh page and try again.'
                );
            }

            return
        }

    // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.isSuccess && outcome.value?.users?.length) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(users.value.map(t => t.accountId));
        
          // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
        const freshItems = outcome.value.users
          .filter((t: any) => !existingIds.has(t.userId))
          .map((item: any) => initializeUserListEngagement(item));

          users.value.push(...freshItems);
      
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
  async function executeHydration(currentBatch: UserListDto[]) {
  
    // 1. Guard Clause: Skip entirely if anonymous or batch package is empty
    if (!isLoggedIn || currentBatch.length === 0) {
      activateEngagementButtons(currentBatch);
      console.log('[HydratePersonals]: Not logged in or empty batch.');
      return;
    }

     const maxRetries = 2; // Loops: 0, 1, 2 (Total 3 attempts)
     const userIds = currentBatch.map(x => x.accountId);

    for (let i = 0; i <= maxRetries; i++) {

      try {

          // Spawn a fresh controller instance for this specific execution pass
        hydrateController = new AbortController();

       // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await postAsync<GetFavoriteIdsResponse>('api/favorites/ids', { contentIds: userIds }, true,
          hydrateController.signal
        );

        if (outcome.isSuccess) {

          const favSet = new Set<string>(outcome.value?.favoriteIds || []);
          
          currentBatch.forEach(user => {
          if(user.engagement){
            user.engagement.isFavorite = favSet.has(user.accountId);
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

  function activateEngagementButtons(currentBatch: UserListDto[]) {

          console.log('[activateEngagementButtons]: Starting engagement activation.');

       
    currentBatch.forEach(user => {
        if(user.engagement){
      user.engagement.isEngagementLoaded = true;
      //console.log(`Activating engagement. ${user.userId} and is engaged ${user.engagement.isEngagementLoaded}`);
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
    users, isFetchingMore, loadMoreError,hasNext, pointer,
   setBaseRoute,
    hydratePersonals,
    activateEngagementButtons,
    loadUsers,
    loadMoreUsers,
    abort

  };
});