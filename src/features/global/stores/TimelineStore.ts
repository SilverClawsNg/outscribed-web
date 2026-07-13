import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAsync } from '@/api/apiGetServices'
import { APIError } from '@/api/apiTypes.ts'
import type {GetTimelineResponse, TimelineDto} from '../types/GlobalTypes.ts';
import { useTimelineFilterStore } from '../stores/TimelineFilterStore'

// Native JS Set wrapper implementation shortcut
class HashSetOrSet extends Set<string> {}

export const useTimelineStore = defineStore('timeline', () => {

    // State
      const timelines = ref<TimelineDto[]>([]); 
      const baseRoute = 'api/global/timeline'; 

    // Loading and Tracking flags matching your C# states
        const isFetchingMore = ref<boolean>(false);
        const hasNext = ref<boolean>(false);
        const pointer = ref<string | null>('1');
         const anchor = ref<string | null>(null);
        const loadMoreError = ref<APIError | null>(null)

        // 🔒 Keep the controller private/local to this store context
  let feedController: AbortController | null = null;

    // 1. Initial Load Path
    async function loadTimelines(apiPathWithFilters: string): Promise<{ success: boolean; error: any | null }> {
    
      try {

          // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

        // Note: Assuming getAsync is part of your API client layer
        const outcome = await getAsync<GetTimelineResponse>(apiPathWithFilters, true, {} as GetTimelineResponse, feedController.signal);
    
        // Consideration 1: Check if any error and immediately return to caller
        if (outcome.isFailure) {
          return { success: false, error: outcome.error || null };
        }
        
        // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.value && outcome.value.timelines) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          timelines.value = outcome.value.timelines;
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          anchor.value = outcome.value.anchor;
        } else {
          // Clear store list if server explicitly returned nothing/null to prevent stale state bleed
          timelines.value = [];
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
    
    // 2. Infinite Scroll Path (LoadMore)
    async function loadMoreTimelines() {

        if (isFetchingMore.value || !hasNext.value) return;
    
        isFetchingMore.value = true;

        try {

            // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

            const filterStore = useTimelineFilterStore()
            const nextPageUrl = filterStore.buildApiPath('api/global/timeline', pointer.value, anchor.value)
            const outcome = await getAsync<GetTimelineResponse>(nextPageUrl, true, {} as GetTimelineResponse, feedController.signal)
    
        if (outcome.isFailure) {
          if (outcome.error) {
            loadMoreError.value = outcome.error
          }
            else{
                loadMoreError.value = new APIError(
                    500,
                    'Unknown Error!',
                    'Unknown error occured while retrieving timelines. Refresh page and try again.'
                );
            }

            return
        }

           // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.value && outcome.value.timelines) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          
          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(timelines.value.map(t => t.id));
          const freshItems = outcome.value.timelines.filter(t => !existingIds.has(t.id));
    
          // Reconcile and merge
          timelines.value.push(...freshItems);
        } else{ // stop infinite scrolling by setting has next to false
          hasNext.value = false
          pointer.value ='-1'
        }
       
        } finally {
          isFetchingMore.value = false;
        }
      }

       function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
  }
    
      return {baseRoute, timelines, isFetchingMore, loadMoreError, hasNext, pointer,loadTimelines, loadMoreTimelines, abort
  };

});