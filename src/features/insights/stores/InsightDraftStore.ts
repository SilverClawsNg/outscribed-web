import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAsync } from '@/api/apiGetServices';
import { postAsync } from '@/api/apiPostServices';
import { APIError } from '@/api/apiTypes.ts';
import { useInsightDraftFilterStore } from '../stores/InsightDraftFilterStore';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts';

import type { 
  InsightDraftListDto, GetInsightDraftListResponse, CreateRequest, UpdateRequest, CreateResponse,
  UpdateCountryRequest, UpdateSummaryRequest, UpdateDetailRequest, 
  UpdatePhotoRequest, TagRequest, UntagRequest, ConfirmRequest, UpdateAddendumRequest 
} from '../types/InsightsTypes.ts';

class HashSetOrSet extends Set<string> {}

export const useInsightDraftStore = defineStore('insightDraft', () => {
  
  // State
  const insights = ref<InsightDraftListDto[]>([]);
  const activeInsight = ref<InsightDraftListDto | null>(null);
  const authStore = useAuthStore();
      const filterStore = useInsightDraftFilterStore();

  // Loading and Tracking flags
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | null>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = 'api/insights/drafts'; 
  const loadMoreError = ref<APIError | null>(null);

  // Keys for LocalStorage references
  const NEW_DRAFT_PREFIX = 'insight:draft:new:';
  const UPDATE_DRAFT_PREFIX = 'insight:draft:update:';

  let feedController: AbortController | null = null;

  // --- Local Storage Utility Helpers ---
  const getLocalStorageKeys = (prefix: string): string[] => {
    return Object.keys(localStorage).filter(key => key.startsWith(prefix));
  };

  const getLocalStorageItems = (prefix: string): InsightDraftListDto[] => {
    const items: InsightDraftListDto[] = [];
    const keys = getLocalStorageKeys(prefix);
    for (const key of keys) {
      const data = localStorage.getItem(key);
      if (data) {
        try { 
          items.push(JSON.parse(data));
        } catch { /* Ignore malformed JSON */ }
      }
    }
    return items;
  };

  // --- Core Reconciliation Rules ---
  async function reconcileNewDrafts() {
    console.log('🚀 [Insight Draft Store]: Reconciling new drafts...');
    const ghostNewDrafts = getLocalStorageItems(NEW_DRAFT_PREFIX);
    let hasAdded = false;

    for (const ghost of ghostNewDrafts) {
      if (insights.value.some(t => t.insightId === ghost.insightId)) {
        localStorage.removeItem(`${NEW_DRAFT_PREFIX}${ghost.insightId}`);
        console.log('🚀 [Insight Draft Store]: Removing insight from local storage...');
      } else {
        insights.value.push(ghost);
        hasAdded = true;
        console.log('🚀 [Insight Draft Store]: pushing in insight from local storage...');
      }
    }

    if (hasAdded) {
      insights.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async function reconcileUpdatedDrafts(incomingItems: InsightDraftListDto[]): Promise<InsightDraftListDto[]> {
    const ghostUpdatedDrafts = getLocalStorageItems(UPDATE_DRAFT_PREFIX);
    const processedItems = [...incomingItems];

    for (const ghost of ghostUpdatedDrafts) {
      const targetIndex = processedItems.findIndex(t => t.insightId === ghost.insightId);
      if (targetIndex !== -1) {
        const serverItem = processedItems[targetIndex];
        if (serverItem) {
          if (new Date(ghost.lastUpdatedAt) >= new Date(serverItem.lastUpdatedAt)) {
            processedItems[targetIndex] = ghost;
          } else {
            localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${ghost.insightId}`);
          }
        }
      }
    }
    return processedItems;
  }

  function setActiveInsight(insight: any) {
    activeInsight.value = { ...insight };
  }

  
  function clearActiveInsight() {
    activeInsight.value = null;
  }


  async function syncActiveInsightChanges() {
    if (!activeInsight.value) return;
    const index = insights.value.findIndex(t => t.insightId === activeInsight.value?.insightId);
    if (index !== -1) {
      insights.value[index] = { ...activeInsight.value };
    }
    activeInsight.value = null;
  }

  // --- Store Actions ---

  async function loadInsights(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {
    try {
      feedController = new AbortController();
      const outcome = await getAsync<GetInsightDraftListResponse>(apiPathWithFilters, true, {} as GetInsightDraftListResponse, feedController.signal);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      if (outcome.isSuccess && outcome.value?.insights?.length) {
        const verifiedInsights = await reconcileUpdatedDrafts(outcome.value.insights);
        insights.value = verifiedInsights;
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;
      } else {
        insights.value = [];
      }

      await reconcileNewDrafts();
      return { success: true, error: null };
    } catch (err: any) {
      return { 
        success: false, 
        error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
      };
    }
  }

  async function loadMoreInsights() {
    if (isFetchingMore.value || !hasNext.value) return;
    isFetchingMore.value = true;

    try {
      feedController = new AbortController();
      const nextPageUrl = filterStore.buildApiPath(baseRoute, pointer.value, anchor.value);
      const outcome = await getAsync<GetInsightDraftListResponse>(nextPageUrl, true, {} as GetInsightDraftListResponse, feedController.signal);

      if (outcome.isFailure) {
        if (outcome.error) {
          loadMoreError.value = outcome.error;
        } else {
          loadMoreError.value = new APIError(500, 'Unknown Error!', 'Unknown error occurred while retrieving drafts. Refresh page and try again.');
        }
        return;
      }

      if (outcome.isSuccess && outcome.value?.insights?.length) {
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        
        const existingIds = new HashSetOrSet(insights.value.map(t => t.insightId));
        const freshItems = outcome.value.insights.filter(t => !existingIds.has(t.insightId));
    
        const verifiedItems = await reconcileUpdatedDrafts(freshItems);
        insights.value.push(...verifiedItems);


      } else {
        hasNext.value = false;
        pointer.value = '-1';
      }
    } catch (err) {
  console.error("Handled gracefully:", err)
}finally {
      isFetchingMore.value = false;
    }
  }

  // Unified creation logic matching CreateInsightModal.vue expectation
  async function createInsight(payload: CreateRequest) {
    try {
      const outcome = await postAsync<CreateResponse>('/api/insights/create', payload, true);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error };
      }

      if (!outcome.value) {
        const error = new APIError(
          500,
          'Blank Response',
          'Request may have succeeded but server response blank. Refresh page before retrying',
          'Server.Blank_Response'
        );
        return { success: false, error: error };
      } 

      const newInsightDraft: InsightDraftListDto = {
        insightId: outcome.value.id,
        createdAt: outcome.value.createdAt,
        lastUpdatedAt: new Date().toISOString(),
        taleId: payload.taleId,
        title: payload.title,
        category: payload.category != '-1' ? payload.category : 'Miscellaneous',
        creatorId: authStore.userId ?? '00000000000000000000000000',
        slug: outcome.value.slug,
        status: 'Created',
        summary: null,
        addendum: null,
        addendumDate: null,
        detail: null,
        photo: null,
        photoCaption: null,
        hasEngagement: false,
        country: null,
        tags: []
      };
      
      insights.value.unshift(newInsightDraft);
      localStorage.setItem(`insight:draft:new:${outcome.value.id}`, JSON.stringify(newInsightDraft));

      return { success: true, error: null };
    } catch (err: any) {
      return { 
        success: false, 
        error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
      };
    }
  }

  async function updateInsightDetails(payload: UpdateDetailRequest) {
    try {
      const outcome = await postAsync<{ detail: string }>('/api/insights/detail', payload, true);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error };
      }

      if (!outcome.value || !outcome.value.detail) {
        const error = new APIError(500, 'Blank Response', 'Request may have succeeded but server response blank. Refresh page before retrying', 'Server.Blank_Response');
        return { success: false, error: error };
      } 

      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight) {
          insight.detail = outcome.value.detail;
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateInsightCountry(payload: UpdateCountryRequest) {
    try {
      const outcome = await postAsync('/api/insights/country', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight && payload.country != '-1') {
          insight.country = payload.country;
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateInsightBasic(payload: UpdateRequest) {
    try {
      const outcome = await postAsync('/api/insights/basic', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight  && payload.category != '-1') {
          insight.title = payload.title;
          insight.category = payload.category;
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateInsightSummary(payload: UpdateSummaryRequest) {
    try {
      const outcome = await postAsync('/api/insights/summary', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight) {
          insight.summary = payload.summary;
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }
      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateInsightPhoto(payload: UpdatePhotoRequest) {
    try {
      const outcome = await postAsync<{ photoUrl: string }>('/api/insights/photo', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      if (!outcome.value || !outcome.value.photoUrl) {
        const error = new APIError(500, 'Blank Response', 'Request may have succeeded but server response blank. Refresh page before retrying', 'Server.Blank_Response');
        return { success: false, error: error };
      } 

      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight) {
          insight.photo = outcome.value.photoUrl;
          insight.photoCaption = payload.caption;
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function addInsightTag(payload: TagRequest) {
    try {
      const outcome = await postAsync<{ tagId: string }>('/api/insights/tag', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      if (!outcome.value || !outcome.value.tagId) {
        const error = new APIError(500, 'Blank Response', 'Request may have succeeded but server response blank. Refresh page before retrying', 'Server.Blank_Response');
        return { success: false, error: error };
      } 

      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight) {
          if (!insight.tags) insight.tags = [];
          insight.tags.unshift({ tagId: outcome.value.tagId, name: payload.name });
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function removeInsightTag(payload: UntagRequest) {
    try {
      const outcome = await postAsync('/api/insights/untag', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight && insight.tags) {
          insight.tags.splice(index, 1);
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function deleteInsight(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/insights/delete', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        insights.value.splice(index, 1);
        localStorage.removeItem(`${NEW_DRAFT_PREFIX}${payload.insightId}`);
        localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${payload.insightId}`);
      }

      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function launchInsight(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/insights/launch', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight) {
          insight.status = 'LaunchedByCreator';
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function archiveInsight(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/insights/user/archive', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight) {
          if (insight.status === 'LaunchedByCreator') {
            insight.status = 'LaunchedToArchivedByCreator';
          } else if (insight.status === 'CertifiedByAdmin') {
            insight.status = 'CertifiedToArchivedByCreator';
          }
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function unArchiveInsight(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/insights/user/unarchive', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = insights.value.findIndex(t => t.insightId === payload.insightId);
      if (index !== -1) {
        const insight = insights.value[index];
        if (insight) {
          if (insight.status === 'LaunchedToArchivedByCreator') {
            insight.status = 'LaunchedByCreator';
          } else if (insight.status === 'CertifiedToArchivedByCreator') {
            insight.status = 'CertifiedByAdmin';
          }
          insight.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
      }

      activeInsight.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateInsightAddendum(payload: UpdateAddendumRequest) {
      try {
        const outcome = await postAsync('/api/insights/addendum', payload, true);
        if (outcome.isFailure) return { success: false, error: outcome.error };
  
        const index = insights.value.findIndex(t => t.insightId === payload.insightId);
        if (index !== -1) {
          const insight = insights.value[index];
          if (insight) {
            insight.addendum = payload.addendum;
            insight.lastUpdatedAt = new Date().toISOString();
          }
          localStorage.setItem(`insight:draft:update:${payload.insightId}`, JSON.stringify(insights.value[index]));
        }
        activeInsight.value = null;
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
  }

  function cleanLocalDraft(insightId: string) {
    localStorage.removeItem(`${NEW_DRAFT_PREFIX}${insightId}`);
    localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${insightId}`);
  }

  function resetState() {
    insights.value = [];
    activeInsight.value = null;
    pointer.value = '1';
    hasNext.value = false;
    anchor.value = null;
  }

  function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
  }

  // 🎯 Cleaned return footprint exposing "create" precisely
  return {
    insights, activeInsight, isFetchingMore, loadMoreError, hasNext, pointer, baseRoute,
    createInsight, setActiveInsight, loadInsights, loadMoreInsights, updateInsightDetails, updateInsightCountry, updateInsightBasic, 
    deleteInsight, launchInsight, archiveInsight, unArchiveInsight, addInsightTag, removeInsightTag, updateInsightSummary, 
    updateInsightAddendum, updateInsightPhoto, clearActiveInsight, cleanLocalDraft, resetState, abort
  };
});