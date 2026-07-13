import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAsync } from '@/api/apiGetServices'
import { APIError } from '@/api/apiTypes.ts'
import { postAsync } from '@/api/apiPostServices';

import {type FaqListDto, type GetFaqListResponse, type VoteRequest} from '../types/SupportTypes.ts';

// Native JS Set wrapper implementation shortcut

export const useFaqListStore = defineStore('faqList', () => {
  

  // State
  const faqs = ref<FaqListDto[]>([]);

  // Loading and Tracking flags matching your C# states

  // 🔒 Keep the controller private/local to this store context
  let feedController: AbortController | null = null;

  // 1. Initial Load Path

 
// 1. Initial Load Path
async function loadFaqs(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {

  try {

      // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

    // Note: Assuming getAsync is part of your API client layer
    const outcome = await getAsync<GetFaqListResponse>(apiPathWithFilters, false, {} as GetFaqListResponse,
      feedController.signal
    );

    // Consideration 1: Check if any error and immediately return to caller
    if (outcome.isFailure) {
      return { success: false, error: outcome.error || null };
    }
    
    // Consideration 2: Reconcile updates if data was retrieved
    if (outcome.isSuccess && outcome.value?.faqs?.length) {

      faqs.value = outcome.value.faqs

    } else {
      // Clear store list if server explicitly returned nothing/null to prevent sfaq state bleed
      faqs.value = [];
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


  async function vote(payload: VoteRequest) {

    try {

      const outcome = await postAsync('/api/insights/country', payload, true);

      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = faqs.value.findIndex(t => t.faqId === payload.faqId);

      if (index !== -1) {
        const faq = faqs.value[index];
        if (faq) {
          faq.hasVoted = true;
        }
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }


  function resetState() {
    faqs.value = [];
  }


   function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
      
  }

  return {
    faqs, loadFaqs, vote, resetState, abort
  };

});
