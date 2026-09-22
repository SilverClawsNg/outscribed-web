import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAsync } from '@/api/apiGetServices'

import { APIError } from '@/api/apiTypes.ts'
import type {GetCountriesResponse} from '../types/GlobalTypes.ts';


export const useCountryStore = defineStore('countryStore', () => {

    // State
           const countriesMetrics = ref<GetCountriesResponse | null>(null); 

      // 🔒 Keep the controller private/local to this store context
      let feedController: AbortController | null = null;

    // 1. Initial Load Path
    async function loadcountries(): Promise<{ success: boolean; error: any | null }> {
    
      try {

// Spawn a fresh controller instance for this specific execution pass
    feedController = new AbortController();

        // Note: Assuming getAsync is part of your API client layer
        const outcome = await getAsync<GetCountriesResponse>('api/countries/metrics', false, {} as GetCountriesResponse, 
          feedController.signal);
    
        // Consideration 1: Check if any error and immediately return to caller
        if (outcome.isFailure) {
          return { success: false, error: outcome.error || null };
        }

        if (outcome.value) {
        // Ensure data mappings are assigned cleanly to reactive state trackers
        countriesMetrics.value = outcome.value || null;

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
    

   function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
    
  }

      return {countriesMetrics,
        loadcountries, abort
  };

});