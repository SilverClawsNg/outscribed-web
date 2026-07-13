import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAsync } from '@/api/apiGetServices';
import { postAsync } from '@/api/apiPostServices';
import { APIError } from '@/api/apiTypes.ts';
import { useTaleDraftFilterStore } from '../stores/TaleDraftFilterStore';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts';

import type { 
  TaleDraftListDto, GetTaleDraftListResponse, CreateRequest, UpdateRequest, CreateResponse,
  UpdateCountryRequest, UpdateSummaryRequest, UpdateDetailRequest, UpdateWatchlistRequest, 
  UpdatePhotoRequest, TagRequest, UntagRequest, ConfirmRequest, UpdateAddendumRequest
} from '../types/TalesTypes.ts';

class HashSetOrSet extends Set<string> {}

export const useTaleDraftStore = defineStore('taleDraft', () => {
  
  // State
  const tales = ref<TaleDraftListDto[]>([]);
  const activeTale = ref<TaleDraftListDto | null>(null);
  const authStore = useAuthStore();
  const filterStore = useTaleDraftFilterStore();

  // Loading and Tracking flags
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | null>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = 'api/tales/drafts'; 
  const loadMoreError = ref<APIError | null>(null);

  // Keys for LocalStorage references
  const NEW_DRAFT_PREFIX = 'tale:draft:new:';
  const UPDATE_DRAFT_PREFIX = 'tale:draft:update:';

  let feedController: AbortController | null = null;

  // --- Local Storage Utility Helpers ---
  const getLocalStorageKeys = (prefix: string): string[] => {
    return Object.keys(localStorage).filter(key => key.startsWith(prefix));
  };

  const getLocalStorageItems = (prefix: string): TaleDraftListDto[] => {
    const items: TaleDraftListDto[] = [];
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
    console.log('🚀 [Tale Draft Store]: Reconciling new drafts...');
    const ghostNewDrafts = getLocalStorageItems(NEW_DRAFT_PREFIX);
    let hasAdded = false;

    for (const ghost of ghostNewDrafts) {
      if (tales.value.some(t => t.taleId === ghost.taleId)) {
        localStorage.removeItem(`${NEW_DRAFT_PREFIX}${ghost.taleId}`);
        console.log('🚀 [Tale Draft Store]: Removing tale from local storage...');
      } else {
        tales.value.push(ghost);
        hasAdded = true;
        console.log('🚀 [Tale Draft Store]: pushing in tale from local storage...');
      }
    }

    if (hasAdded) {
      tales.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async function reconcileUpdatedDrafts(incomingItems: TaleDraftListDto[]): Promise<TaleDraftListDto[]> {
    const ghostUpdatedDrafts = getLocalStorageItems(UPDATE_DRAFT_PREFIX);
    const processedItems = [...incomingItems];

    for (const ghost of ghostUpdatedDrafts) {
      const targetIndex = processedItems.findIndex(t => t.taleId === ghost.taleId);
      if (targetIndex !== -1) {
        const serverItem = processedItems[targetIndex];
        if (serverItem) {
          if (new Date(ghost.lastUpdatedAt) >= new Date(serverItem.lastUpdatedAt)) {
            processedItems[targetIndex] = ghost;
          } else {
            localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${ghost.taleId}`);
          }
        }
      }
    }
    return processedItems;
  }

  function setActiveTale(tale: any) {
    activeTale.value = { ...tale };
  }

  
  function clearActiveTale() {
    activeTale.value = null;
  }


  async function syncActiveTaleChanges() {
    if (!activeTale.value) return;
    const index = tales.value.findIndex(t => t.taleId === activeTale.value?.taleId);
    if (index !== -1) {
      tales.value[index] = { ...activeTale.value };
    }
    activeTale.value = null;
  }

  // --- Store Actions ---

  async function loadTales(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {
    try {
      feedController = new AbortController();
      const outcome = await getAsync<GetTaleDraftListResponse>(apiPathWithFilters, true, {} as GetTaleDraftListResponse, feedController.signal);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      if (outcome.isSuccess && outcome.value?.tales?.length) {
        const verifiedTales = await reconcileUpdatedDrafts(outcome.value.tales);
        tales.value = verifiedTales;
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;
      } else {
        tales.value = [];
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

  async function loadMoreTales() {
    if (isFetchingMore.value || !hasNext.value) return;
    isFetchingMore.value = true;

    try {
      feedController = new AbortController();
      const nextPageUrl = filterStore.buildApiPath(baseRoute, pointer.value, anchor.value);
      const outcome = await getAsync<GetTaleDraftListResponse>(nextPageUrl, true, {} as GetTaleDraftListResponse, feedController.signal);

      if (outcome.isFailure) {
        if (outcome.error) {
          loadMoreError.value = outcome.error;
        } else {
          loadMoreError.value = new APIError(500, 'Unknown Error!', 'Unknown error occurred while retrieving drafts. Refresh page and try again.');
        }
        return;
      }

      if (outcome.isSuccess && outcome.value?.tales?.length) {
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        
        const existingIds = new HashSetOrSet(tales.value.map(t => t.taleId));
        const freshItems = outcome.value.tales.filter(t => !existingIds.has(t.taleId));
    
        const verifiedItems = await reconcileUpdatedDrafts(freshItems);
        tales.value.push(...verifiedItems);
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

  // Unified creation logic matching CreateTaleModal.vue expectation
  async function createTale(payload: CreateRequest) {
    try {
      const outcome = await postAsync<CreateResponse>('/api/tales/create', payload, true);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error };
      }

      if (!outcome.value) {
        const error = new APIError(
          500,
          'Blank Response',
          'Request may have succeeded but server response blank. Refresh page before retrying'
        );
        return { success: false, error: error };
      } 

      const newTaleDraft: TaleDraftListDto = {
        taleId: outcome.value.id,
        createdAt: outcome.value.createdAt,
        lastUpdatedAt: new Date().toISOString(),
        title: payload.title,
        category: payload.category,
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
        tags: [],
        watchlistTitle: null,
        watchlistSummary: null,
        watchlistSource: null,
        watchlistUrl: null
      };
      
      tales.value.unshift(newTaleDraft);
      localStorage.setItem(`tale:draft:new:${outcome.value.id}`, JSON.stringify(newTaleDraft));

      return { success: true, error: null };
    } catch (err: any) {
      return { 
        success: false, 
        error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
      };
    }
  }

  async function updateTaleDetails(payload: UpdateDetailRequest) {
    try {
      const outcome = await postAsync<{ detail: string }>('/api/tales/detail', payload, true);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error };
      }

      if (!outcome.value || !outcome.value.detail) {
        const error = new APIError(500, 'Blank Response', 'Request may have succeeded but server response blank. Refresh page before retrying', 'Server.Blank_Response');
        return { success: false, error: error };
      } 

      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          tale.detail = outcome.value.detail;
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateTaleCountry(payload: UpdateCountryRequest) {
    try {
      const outcome = await postAsync('/api/tales/country', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale && payload.country != '-1') {
          tale.country = payload.country;
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateTaleBasic(payload: UpdateRequest) {
    try {
      const outcome = await postAsync('/api/tales/basic', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale && payload.category != '-1') {
          tale.title = payload.title;
          tale.category = payload.category;
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateTaleSummary(payload: UpdateSummaryRequest) {
    try {
      const outcome = await postAsync('/api/tales/summary', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          tale.summary = payload.summary;
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }
      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateTalePhoto(payload: UpdatePhotoRequest) {
    try {
      const outcome = await postAsync<{ photoUrl: string }>('/api/tales/photo', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      if (!outcome.value || !outcome.value.photoUrl) {
        const error = new APIError(500, 'Blank Response', 'Request may have succeeded but server response blank. Refresh page before retrying', 'Server.Blank_Response');
        return { success: false, error: error };
      } 

      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          tale.photo = outcome.value.photoUrl;
          tale.photoCaption = payload.caption;
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateTaleWatchlist(payload: UpdateWatchlistRequest) {
    try {
      const outcome = await postAsync('/api/tales/watchlist', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          tale.watchlistTitle = payload.title;
          tale.watchlistSummary = payload.summary;
          tale.watchlistUrl = payload.sourceUrl;
          tale.watchlistSource = payload.source;
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function addTaleTag(payload: TagRequest) {
    try {
      const outcome = await postAsync<{ tagId: string }>('/api/tales/tag', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      if (!outcome.value || !outcome.value.tagId) {
        const error = new APIError(500, 'Blank Response', 'Request may have succeeded but server response blank. Refresh page before retrying', 'Server.Blank_Response');
        return { success: false, error: error };
      } 

      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          if (!tale.tags) tale.tags = [];
          tale.tags.unshift({ tagId: outcome.value.tagId, name: payload.name });
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function removeTaleTag(payload: UntagRequest) {
    try {
      const outcome = await postAsync('/api/tales/untag', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale && tale.tags) {
          tale.tags.splice(index, 1);
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function deleteTale(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/tales/delete', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        tales.value.splice(index, 1);
        localStorage.removeItem(`${NEW_DRAFT_PREFIX}${payload.taleId}`);
        localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${payload.taleId}`);
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function launchTale(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/tales/launch', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          tale.status = 'LaunchedByCreator';
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function archiveTale(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/tales/user/archive', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          if (tale.status === 'LaunchedByCreator') {
            tale.status = 'LaunchedToArchivedByCreator';
          } else if (tale.status === 'CertifiedByAdmin') {
            tale.status = 'CertifiedToArchivedByCreator';
          }
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function unArchiveTale(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/tales/user/unarchive', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          if (tale.status === 'LaunchedToArchivedByCreator') {
            tale.status = 'LaunchedByCreator';
          } else if (tale.status === 'CertifiedToArchivedByCreator') {
            tale.status = 'CertifiedByAdmin';
          }
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }

      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateTaleAddendum(payload: UpdateAddendumRequest) {
    try {
      const outcome = await postAsync('/api/tales/addendum', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };

      const index = tales.value.findIndex(t => t.taleId === payload.taleId);
      if (index !== -1) {
        const tale = tales.value[index];
        if (tale) {
          tale.addendum = payload.addendum;
          tale.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`tale:draft:update:${payload.taleId}`, JSON.stringify(tales.value[index]));
      }
      activeTale.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  function cleanLocalDraft(taleId: string) {
    localStorage.removeItem(`${NEW_DRAFT_PREFIX}${taleId}`);
    localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${taleId}`);
  }

  function resetState() {
    tales.value = [];
    activeTale.value = null;
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
    tales, activeTale, isFetchingMore, loadMoreError, hasNext, pointer, baseRoute,
    createTale, setActiveTale, loadTales, loadMoreTales, updateTaleDetails, updateTaleCountry, updateTaleBasic, 
    deleteTale, launchTale, archiveTale, unArchiveTale, addTaleTag, removeTaleTag, updateTaleSummary, updateTalePhoto,
    clearActiveTale, updateTaleAddendum, updateTaleWatchlist, cleanLocalDraft, resetState, abort
  };
});