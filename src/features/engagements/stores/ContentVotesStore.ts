import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { APIError } from '@/api/apiTypes.ts'
import { getAsync } from '@/api/apiGetServices'
import type{GetContentVotesResponse, LoadingVotesResponse, VoteListDto} from '../types/EngagementTypes.ts';
import { useContentVotesFilterStore } from './ContentVotesFilterStore.ts'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useContentVotesStore = defineStore('contentVotes', () => {

    const filterStore = useContentVotesFilterStore()
  
  let feedController: AbortController | null = null;

  // --- Core Actions ---
  const votes = ref<VoteListDto[]>([]);
 const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | null>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = ref<string>('api/tales'); 
  const loadMoreError = ref<APIError | null>(null)

  // Sets the target tale before a modal opens
  function setBaseRoute(apiUrl: any) {
    // We clone it using spread operator so the user doesn't alter 
    // the background list until they actually hit 'Save'
    baseRoute.value = apiUrl;
  }
  /**
   * 1. LoadVotes (Initial setup for a Tale or Insight vote list)
   */

  async function loadVotes(apiPathWithFilters: string) : Promise<{ success: boolean; error: APIError | null }>{
  
    
    try {

      feedController = new AbortController();

      const outcome = await getAsync<GetContentVotesResponse>(apiPathWithFilters, false, {} as GetContentVotesResponse, 
        feedController.signal);

       // Consideration 1: Check if any error and immediately return to caller
    if (outcome.isFailure) {
      return { success: false, error: outcome.error || null };
    }
       
      if (outcome.value && outcome.value.votes) {

      // Commit clean data to store state
      hasNext.value = outcome.value.hasNext;
      pointer.value = outcome.value.pointer;
      anchor.value = outcome.value.anchor;

        // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      votes.value = outcome.value.votes;

      console.log('--- Vue State Snapshot inside loading contents store ---', JSON.parse(JSON.stringify(votes.value)));

      } else {
      // Clear store list if server explicitly returned nothing/null to prevent stale state bleed
      votes.value = [];
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
  /**
   * 2. LoadMoreVotes (Infinite scroll continuation pipeline)
   */
  async function loadMoreVotes() {

     if (isFetchingMore.value || !hasNext.value) return;

    isFetchingMore.value = true;
        
    try {

  // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();
               
                const nextPageUrl = filterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value)

        const outcome = await getAsync<GetContentVotesResponse>(nextPageUrl, false, {} as GetContentVotesResponse,
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
                    'Unknown error occured while retrieving votes. Refresh page and try again.'
                );
            }

            return
        }
        
    // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.value && outcome.value.votes) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;

            // Filter duplicates already caught by state or top navigation creations
                     const existingIds = new HashSetOrSet(votes.value.map(t => t.voteId));
                     // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
                     const freshItems = outcome.value.votes
                       .filter((t: any) => !existingIds.has(t.voteId));
           
                      votes.value.push(...freshItems);


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

   function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled via feedController.');
    }
   
  }

  return {
    votes, isFetchingMore, loadMoreError,hasNext, pointer, baseRoute,
    loadVotes,
    loadMoreVotes,
       abort,
       setBaseRoute

  };
});