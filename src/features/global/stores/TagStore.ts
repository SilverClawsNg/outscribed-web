import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAsync } from '@/api/apiGetServices'

import { APIError } from '@/api/apiTypes.ts'
import type {GetTagsResponse, TagListDto} from '../types/GlobalTypes.ts';
import { useTagFilterStore } from '../stores/TagFilterStore'

class HashSetOrSet extends Set<string> {}

export const useTagStore = defineStore('tagStore', () => {

              const filterStore = useTagFilterStore()
  const baseRoute = 'api/tags'; 
    // State
      const tags = ref<TagListDto[]>([]); 
            const isFetchingMore = ref<boolean>(false);
        const hasNext = ref<boolean>(false);
        const pointer = ref<string | null>('1');
         const anchor = ref<string | null>(null);
        const loadMoreError = ref<APIError | null>(null) 

      // 🔒 Keep the controller private/local to this store context
      let feedController: AbortController | null = null;

    // 1. Initial Load Path
    async function loadtags(apiPathWithFilters: string): Promise<{ success: boolean; error: any | null }> {
    
      try {

// Spawn a fresh controller instance for this specific execution pass
    feedController = new AbortController();

        // Note: Assuming getAsync is part of your API client layer
        const outcome = await getAsync<GetTagsResponse>(apiPathWithFilters, false, {} as GetTagsResponse, 
          feedController.signal);
    
        // Consideration 1: Check if any error and immediately return to caller
        if (outcome.isFailure) {
          return { success: false, error: outcome.error || null };
        }

        
        // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.value && outcome.value.tags) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          tags.value = outcome.value.tags;
          hasNext.value = outcome.value.hasNext;
          pointer.value = outcome.value.pointer;
          anchor.value = outcome.value.anchor;

          console.log(`outside anchor is ${anchor.value}`)


        } else {
          // Clear store list if server explicitly returned nothing/null to prevent stale state bleed
          tags.value = [];
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
        async function loadmoretags() {
    
            if (isFetchingMore.value || !hasNext.value) return;
        
            isFetchingMore.value = true;
    
            try {
    
                // Spawn a fresh controller instance for this specific execution pass
            feedController = new AbortController();
    
                const nextPageUrl = filterStore.buildApiPath('api/global/timeline', pointer.value, anchor.value)
                const outcome = await getAsync<GetTagsResponse>(nextPageUrl, true, {} as GetTagsResponse, feedController.signal)
        
            if (outcome.isFailure) {
              if (outcome.error) {
                loadMoreError.value = outcome.error
              }
                else{
                    loadMoreError.value = new APIError(
                        500,
                        'Unknown Error!',
                        'Unknown error occured while retrieving tags. Refresh page and try again.'
                    );
                }
    
                return
            }
    
               // Consideration 2: Reconcile updates if data was retrieved
            if (outcome.value && outcome.value.tags) {
              // Reconcile updates against incoming block (handles slower message brokers)
              
              // Commit clean data to store state
              hasNext.value = outcome.value.hasNext;
              pointer.value = outcome.value.pointer;
              
              // Filter duplicates already caught by state or top navigation creations
              const existingIds = new HashSetOrSet(tags.value.map(t => t.tagId));
              const freshItems = outcome.value.tags.filter(t => !existingIds.has(t.tagId));
        
              // Reconcile and merge
              tags.value.push(...freshItems);
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

      return {tags, baseRoute, isFetchingMore, loadMoreError, hasNext,
        loadtags, loadmoretags, abort
  };

});