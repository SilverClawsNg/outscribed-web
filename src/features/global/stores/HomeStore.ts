import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import {type GetFavoriteIdsResponse } from '@/features/engagements/types/EngagementTypes.ts'

import { APIError } from '@/api/apiTypes.ts'
import type {CategoryMetricsDto, GetHomeContentsResponse, TagDetailDto, TagListDto,
  CountryMetricsDto, WriterStatsDto
} from '../types/GlobalTypes.ts';

import {type TaleListDto, initializeTaleListEngagement} from '@/features/tales/types/TalesTypes.ts'
import {type InsightListDto, initializeInsightListEngagement} from '@/features/insights/types/InsightsTypes.ts'
import { useLoginHint } from '@/utils/authHelper'
import {initializeAccountEngagement } from '@/features/identity/types/IdentityTypes.ts'

export const useHomeStore = defineStore('homeStore', () => {

    // State
      const tales = ref<TaleListDto[]>([]); 
      const insights = ref<InsightListDto[]>([]); 
      const tags = ref<TagListDto[]>([]); 
      const categories = ref<CategoryMetricsDto[]>([]); 
      const countries = ref<CountryMetricsDto[]>([]); 
      const prolificWriters = ref<WriterStatsDto[]>([]); 
      const newWriters = ref<WriterStatsDto[]>([]); 

      const isLoggedIn = useLoginHint()
      // 🔒 Keep the controller private/local to this store context
      let feedController: AbortController | null = null;
      let hydrateController: AbortController | null = null;

    // 1. Initial Load Path
    async function loadhomecontents(): Promise<{ success: boolean; error: any | null }> {
    
      console.log('[loadhomecontents]: Loading...');

      try {

// Spawn a fresh controller instance for this specific execution pass
    feedController = new AbortController();

        // Note: Assuming getAsync is part of your API client layer
        const outcome = await getAsync<GetHomeContentsResponse>('api/global/home', false, {} as GetHomeContentsResponse, 
          feedController.signal);
    
        // Consideration 1: Check if any error and immediately return to caller
        if (outcome.isFailure) {
          return { success: false, error: outcome.error || null };
        }

        if (outcome.value) {
        // Ensure data mappings are assigned cleanly to reactive state trackers
        tales.value = outcome.value.tales || [];
        insights.value = outcome.value.insights || [];
        tags.value = outcome.value.tags || [];
        categories.value = outcome.value.categories || [];
        countries.value = outcome.value.countries || [];
        prolificWriters.value = outcome.value.prolificWriters || [];
        newWriters.value = outcome.value.newWriters || [];

        // Map Tales & Insights
        tales.value = (outcome.value.tales || []).map((item: any) => initializeTaleListEngagement(item));
        insights.value = (outcome.value.insights || []).map((item: any) => initializeInsightListEngagement(item));
        
        // Map Prolific Writers (Preserve WriterStatsDto wrapper & initialize nested creator)
          prolificWriters.value = (outcome.value.prolificWriters || []).map((writerStats: WriterStatsDto) => ({
            ...writerStats,
            creator: initializeAccountEngagement(writerStats.creator)
          }));

          // Map New Writers (Preserve WriterStatsDto wrapper & initialize nested creator)
          newWriters.value = (outcome.value.newWriters || []).map((writerStats: WriterStatsDto) => ({
            ...writerStats,
            creator: initializeAccountEngagement(writerStats.creator)
          }));
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

      console.log('[HydratePersonals]: Hydrating...');

    // 🛡️ Fix 1: Access the value inside the storage boundary cleanly without wrapper pollution

    // 🛡️ Fix 2: Check active store lengths directly rather than transient parameters
    if (!isLoggedIn.value || (tales.value.length === 0 && insights.value.length === 0 
      && prolificWriters.value.length === 0  && newWriters.value.length === 0)) {
      activateEngagementButtons();
      console.log('[HydratePersonals]: Anonymous user session or empty state feed. Bypassing personalization.');
      return;
    }

    const maxRetries = 2; // Loops: 0, 1, 2 (Total 3 attempts)
   // Map IDs safely straight out of our active tracked collection variables
    const allIds = [
      ...tales.value.map(t => t.taleId),
      ...insights.value.map(i => i.insightId),
      ...prolificWriters.value.map(i => i.creator.accountId),
      ...newWriters.value.map(i => i.creator.accountId)
    ];

    for (let i = 0; i <= maxRetries; i++) {

      try {

        // Spawn a fresh controller instance for this specific execution pass
        hydrateController = new AbortController();

        // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await postAsync<GetFavoriteIdsResponse>('api/favorites/ids', { contentIds: allIds }, true, hydrateController.signal);

       if (outcome.isSuccess) {
          console.log('[HydratePersonals]: Personalization response matching succeeded.');

          if (outcome.value && outcome.value.favoriteIds) {
            const favSet = new Set<string>(outcome.value.favoriteIds);

            // 🎯 Direct Target: Mutate the tracking targets that the Vue Template is actively listening to
            tales.value.forEach((tale) => {
              tale.engagement.isFavorite = favSet.has(tale.taleId);
            });

            insights.value.forEach((insight) => {
              insight.engagement.isFavorite = favSet.has(insight.insightId);
            });

              prolificWriters.value.forEach((writer) => {
              writer.creator.engagement.isFavorite = favSet.has(writer.creator.accountId);
            });
            
              newWriters.value.forEach((writer) => {
              writer.creator.engagement.isFavorite = favSet.has(writer.creator.accountId);
            });
          }

          activateEngagementButtons();
          return;

        } else {
          if (!outcome.error || !isRetryWorthwhile(outcome.error.status)) {
            activateEngagementButtons();
            return;
          }
          console.warn(`[HydratePersonals]: Attempt ${i + 1} failed with status ${outcome.error.status}. Retrying backoff...`);
        }

      } catch (networkError) 
      {
       console.error(`[HydratePersonals]: Catastrophic link drop on attempt ${i + 1}`, networkError);
      }

          console.warn(`[HydratePersonals]: Attempt ${i + 1} Retrying backoff...`);

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
   * Directly unlocks buttons across active store tracking lists safely
   */
  function activateEngagementButtons() {
    console.log('[HydratePersonals]: Unlocking engagement controls across store models.');
    tales.value.forEach((tale) => {
      tale.engagement.isEngagementLoaded = true;
    });
    insights.value.forEach((insight) => {
      insight.engagement.isEngagementLoaded = true;
    });
     prolificWriters.value.forEach((writer) => {
      writer.creator.engagement.isEngagementLoaded = true;
    });
      newWriters.value.forEach((writer) => {
      writer.creator.engagement.isEngagementLoaded = true;
    });
  }

  
    // 1. Initial Load Path
  async function loadTag(tagId: string): Promise<{tag: TagDetailDto | null, success: boolean; error: APIError | null }> {
  
    try {
  
        // Spawn a fresh controller instance for this specific execution pass
          feedController = new AbortController();
  
      // Note: Assuming getAsync is part of your API client layer
      const outcome = await getAsync<TagDetailDto>(`api/tags/${tagId}`, false, {} as TagDetailDto, feedController.signal);
  
      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return {tag: null, success: false, error: outcome.error || null };
      }
      
      // Inside profileStore.ts fallback block
      if (!outcome.value) {
        
        // 🎯 Instantiate your exact class blueprint with matching parameters
        const error = new APIError(
          404,
          'Not Found!',
          'Sorry. Sorry. We could not find the tag you requested. It may have been removed, hidden, or archived.'
        )
        
            return {tag: null, success: false, error: error }
      }
  
      // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
      return {tag: outcome.value, success: true, error: null };
  
    } catch (err: any) {
      // Fail-safe catch-all wrapper
      return { 
        tag: null,
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
      if (hydrateController) {
      hydrateController.abort();
      hydrateController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
  }

      return {tales,insights, tags, categories, countries, prolificWriters, newWriters,
        loadhomecontents, hydratePersonals, abort, loadTag
  };

});