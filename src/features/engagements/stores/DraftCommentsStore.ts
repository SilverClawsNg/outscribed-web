import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAsync } from '@/api/apiGetServices';
import { postAsync } from '@/api/apiPostServices';
import { APIError } from '@/api/apiTypes.ts';
import { useDraftCommentsFilterStore } from './DraftCommentsFilterStore.ts';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts';
import { useContentCommentsStore } from '../stores/ContentCommentsStore.ts';

import type { 
  CommentListDto, GetContentCommentsResponse, CreateCommentRequest, CommentCreatedResponse,
  UpdateDetailRequest, ConfirmRequest, UpdateAddendumRequest, ActiveContentContext, ReplyCommentRequest
} from '../types/EngagementTypes';

import {initializeCommentListEngagement} from '../types/EngagementTypes.ts';
class HashSetOrSet extends Set<string> {}

export const useDraftCommentsStore = defineStore('draftComments', () => {
  
  // State
  const comments = ref<CommentListDto[]>([]);
  const activeComment = ref<CommentListDto | null>(null);
  const authStore = useAuthStore();
  const filterStore = useDraftCommentsFilterStore();
  const contentStore = useContentCommentsStore();

  // Loading and Tracking flags
  const isFetchingMore = ref<boolean>(false);
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | null>('1');
  const anchor = ref<string | null>(null);
  const baseRoute = 'api/comments/drafts'; 
  const loadMoreError = ref<APIError | null>(null);

  // Keys for LocalStorage references
  const NEW_DRAFT_PREFIX = 'comment:draft:new:';
  const UPDATE_DRAFT_PREFIX = 'comment:draft:update:';

  let feedController: AbortController | null = null;

  // --- Local Storage Utility Helpers ---
  const getLocalStorageKeys = (prefix: string): string[] => {
    return Object.keys(localStorage).filter(key => key.startsWith(prefix));
  };

  const getLocalStorageItems = (prefix: string): CommentListDto[] => {
    const items: CommentListDto[] = [];
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
    console.log('🚀 [Comment Draft Store]: Reconciling new drafts...');
    const ghostNewDrafts = getLocalStorageItems(NEW_DRAFT_PREFIX);
    let hasAdded = false;

    for (const ghost of ghostNewDrafts) {
      if (comments.value.some(t => t.commentId === ghost.commentId)) {
        localStorage.removeItem(`${NEW_DRAFT_PREFIX}${ghost.commentId}`);
        console.log('🚀 [Comment Draft Store]: Removing comment from local storage...');
      } else {
        comments.value.push(ghost);
        hasAdded = true;
        console.log('🚀 [Comment Draft Store]: pushing in comment from local storage...');
      }
    }

    if (hasAdded) {
      comments.value.sort((a, b) => new Date(b.commentedAt).getTime() - new Date(a.commentedAt).getTime());
    }
  }

  async function reconcileUpdatedDrafts(incomingItems: CommentListDto[]): Promise<CommentListDto[]> {
    const ghostUpdatedDrafts = getLocalStorageItems(UPDATE_DRAFT_PREFIX);
    const processedItems = [...incomingItems];

    for (const ghost of ghostUpdatedDrafts) {
      const targetIndex = processedItems.findIndex(t => t.commentId === ghost.commentId);
      if (targetIndex !== -1) {
        const serverItem = processedItems[targetIndex];
        if (serverItem) {

             // Convert ANY valid ISO string (whether +00:00 or Z) into pure UTC epoch milliseconds:
          const ghostMs = Date.parse(ghost.lastUpdatedAt); 
          const serverMs = Date.parse(serverItem.lastUpdatedAt);

          // Date.parse() returns NaN if invalid, otherwise pure UTC milliseconds
          if (!isNaN(ghostMs) && !isNaN(serverMs)) {
            if (ghostMs > (serverMs + 2000)) {
              // Keep ghost
              processedItems[targetIndex] = ghost;
            } else {
              // Delete ghost
               localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${ghost.commentId}`);
            }
          }

        }
      }
    }
    return processedItems;
  }

  function setActiveComment(comment: any) {
    activeComment.value = { ...comment };
  }
  
  function clearActiveComment() {
    activeComment.value = null;
  }

  async function syncActiveCommentChanges() {
    if (!activeComment.value) return;
    const index = comments.value.findIndex(t => t.commentId === activeComment.value?.commentId);
    if (index !== -1) {
      comments.value[index] = { ...activeComment.value };
    }
    activeComment.value = null;
  }

  // --- Store Actions ---
  async function loadComments(apiPathWithFilters: string): Promise<{ success: boolean; error: APIError | null }> {
    try {
      feedController = new AbortController();
      const outcome = await getAsync<GetContentCommentsResponse>(apiPathWithFilters, true, {} as GetContentCommentsResponse, feedController.signal);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }
      
      if (outcome.isSuccess && outcome.value?.comments?.length) {
        const verifiedComments = await reconcileUpdatedDrafts(outcome.value.comments);

  // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      comments.value = verifiedComments.map((item: any) => initializeCommentListEngagement(item));

        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        anchor.value = outcome.value.anchor;
      } else {
        comments.value = [];
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

  async function loadMoreComments() {
    if (isFetchingMore.value || !hasNext.value) return;
    isFetchingMore.value = true;

    try {
      feedController = new AbortController();
      const nextPageUrl = filterStore.buildApiPath(baseRoute, pointer.value, anchor.value);
      const outcome = await getAsync<GetContentCommentsResponse>(nextPageUrl, true, {} as GetContentCommentsResponse, feedController.signal);

      if (outcome.isFailure) {
        if (outcome.error) {
          loadMoreError.value = outcome.error;
        } else {
          loadMoreError.value = new APIError(500, 'Unknown Error!', 'Unknown error occurred while retrieving drafts. Refresh page and try again.');
        }
        return;
      }

      if (outcome.isSuccess && outcome.value?.comments?.length) {
        hasNext.value = outcome.value.hasNext;
        pointer.value = outcome.value.pointer;
        
        const existingIds = new HashSetOrSet(comments.value.map(t => t.commentId));

           // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
                const freshItems = outcome.value.comments
                  .filter((t: any) => !existingIds.has(t.commentId))
                  .map((item: any) => initializeCommentListEngagement(item));
    
        const verifiedItems = await reconcileUpdatedDrafts(freshItems);
        
        comments.value.push(...verifiedItems);


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
  /* ==========================================================================
   CREATE COMMENT
   ========================================================================== */

async function createComment(
  detail: string
): Promise<{ success: boolean; error: APIError | null }> {

  // 🎯 Fetch active target content directly from the central store context
  const activeContent = contentStore.activeContent;

  if (!activeContent) {
    return {
      success: false,
      error: new APIError(400, 'Context Missing', 'No active content selected in store.')
    };
  }

  try {
    const payload: CreateCommentRequest = {
      contentid: activeContent.id,
      contentType: activeContent.contentType,
      detail: detail
    };

    const outcome = await postAsync<CommentCreatedResponse>('/api/commenting/create', payload, true);

    if (outcome.isFailure || !outcome.value) {
      return {
        success: false,
        error: outcome.error || new APIError(500, 'Blank Response', 'Request may have succeeded but server response blank. Refresh page before retrying.')
      };
    }

    // 🎯 Construct lean top-level CommentListDto matching simplified contract
    const newComment: CommentListDto = initializeCommentListEngagement(
      {
        commentId: outcome.value.commentId,
        contentId: activeContent.id,
        contentType: activeContent.contentType,
        parentId: null,
        commentedAt: outcome.value.createdAt,
        lastUpdatedAt: outcome.value.createdAt,
        status: 'Active',
        detail: outcome.value.detail,
        addendum: null,
        commentatorId: authStore.userId,
        commentatorUsername: authStore.username,
        hasEngagement: false,
        pinnedReply: null,
        hasReplied: false,
        hasLoadedReplies: false
      },
      true
    );

    // Mutate parent content engagement counters directly in store context
    if (activeContent.engagement) {
      Object.assign(activeContent.engagement, {
        commentsCount: outcome.value.commentsCount,
        upvotesCount: outcome.value.upvotesCount,
        downvotesCount: outcome.value.downvotesCount,
        favoritesCount: outcome.value.favoritesCount,
        flagsCount: outcome.value.flagsCount,
        sharesCount: outcome.value.sharesCount,
        viewsCount: outcome.value.viewsCount
      });
    }

    // 🎯 Register comment and update activeContent.pinnedComment within Centralized Store
    contentStore.addCreatedComment(newComment, false);

    // Save local draft fallback
    localStorage.setItem(`comment:draft:new:${newComment.commentId}`, JSON.stringify(newComment));

    return { success: true, error: null };

  } catch (err: any) {
    return {
      success: false,
      error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.')
    };
  }
}

/* ==========================================================================
   REPLY COMMENT METHOD 
   ========================================================================== */

async function replyComment(detail: string)
: Promise<{ success: boolean; error: APIError | null }> {

  const activeContent = contentStore.activeContent;
 const parentComment = contentStore.activeCommentToReply;

  if (!activeContent || !parentComment) {
    return {
      success: false,
      error: new APIError(400, 'Context Missing', 'Active content or active parent comment is not set in store.')
    };
  }

  try {
    const payload: ReplyCommentRequest = {
      contentid: activeContent.id,
      contentType: activeContent.contentType,
      parentId: parentComment.commentId,
      detail: detail
    };

    const outcome = await postAsync<CommentCreatedResponse>('/api/commenting/reply', payload, true);

    if (outcome.isFailure || !outcome.value) {
      return {
        success: false,
        error: outcome.error || new APIError(500, 'Blank Response', 'Server response blank.')
      };
    }

    // Construct new CommentListDto using context properties
    const newReply: CommentListDto = initializeCommentListEngagement(
      {
        commentId: outcome.value.commentId,
        contentId: parentComment.contentId,
        contentType: parentComment.contentType,
        parentId: parentComment.commentId,
        commentedAt: outcome.value.createdAt,
        lastUpdatedAt: outcome.value.createdAt,
        status: 'Active',
        detail: outcome.value.detail,
        addendum: null,
        commentatorId: authStore.userId,
        commentatorUsername: authStore.username,
        hasEngagement: false,
        pinnedReply: null,
        hasReplied: false,
        hasLoadedReplies: false,
        lastLoadedAt: null
      },
      true
    );

    // Register reply and mutate parent in-place within Centralized Store
    contentStore.addCreatedComment(newReply, true);

    // Persist local draft fallback
    localStorage.setItem(`comment:draft:reply:${newReply.commentId}`, JSON.stringify(newReply));

    // Mutate parent content engagement counters directly in store context
    if (parentComment.engagement) {
      Object.assign(parentComment.engagement, {
        commentsCount: outcome.value.commentsCount,
        upvotesCount: outcome.value.upvotesCount,
        downvotesCount: outcome.value.downvotesCount,
        favoritesCount: outcome.value.favoritesCount,
        flagsCount: outcome.value.flagsCount
      });
    }

    return {
      success: true,
      error: null
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.error || new APIError(500, 'Internal Client Error', err.message)
    };
  }
}

  async function updateCommentDetails(payload: UpdateDetailRequest) {
    
    try {
      const outcome = await postAsync<{ detail: string }>('/api/comments/detail', payload, true);
      
      if (outcome.isFailure) {
        return { success: false, error: outcome.error };
      }

      if (!outcome.value || !outcome.value.detail) {
        const error = new APIError(500, 'Blank Response', 'Request may have succeeded but server response blank. Refresh page before retrying', 'Server.Blank_Response');
        return { success: false, error: error };
      } 

      const index = comments.value.findIndex(t => t.commentId === payload.commentId);
      if (index !== -1) {
        const comment = comments.value[index];
        if (comment) {
          comment.detail = outcome.value.detail;
          comment.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`comment:draft:update:${payload.commentId}`, JSON.stringify(comments.value[index]));
      }

      activeComment.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function deleteComment(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/comments/delete', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = comments.value.findIndex(t => t.commentId === payload.commentId);
      if (index !== -1) {
        comments.value.splice(index, 1);
        localStorage.removeItem(`${NEW_DRAFT_PREFIX}${payload.commentId}`);
        localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${payload.commentId}`);
      }

      activeComment.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function archiveComment(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/comments/user/archive', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = comments.value.findIndex(t => t.commentId === payload.commentId);
      if (index !== -1) {
        const comment = comments.value[index];
        if (comment) {
          if (comment.status === 'Active') {
            comment.status = 'ActiveToArchivedByCreator';
          } else if (comment.status === 'CertifiedByAdmin') {
            comment.status = 'CertifiedToArchivedByCreator';
          }
          comment.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`comment:draft:update:${payload.commentId}`, JSON.stringify(comments.value[index]));
      }

      activeComment.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function unArchiveComment(payload: ConfirmRequest) {
    try {
      const outcome = await postAsync('/api/comments/user/unarchive', payload, true);
      if (outcome.isFailure) return { success: false, error: outcome.error };
    
      const index = comments.value.findIndex(t => t.commentId === payload.commentId);
      if (index !== -1) {
        const comment = comments.value[index];
        if (comment) {
          if (comment.status === 'ActiveToArchivedByCreator') {
            comment.status = 'Active';
          } else if (comment.status === 'CertifiedToArchivedByCreator') {
            comment.status = 'CertifiedByAdmin';
          }
          comment.lastUpdatedAt = new Date().toISOString();
        }
        localStorage.setItem(`comment:draft:update:${payload.commentId}`, JSON.stringify(comments.value[index]));
      }

      activeComment.value = null;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
    }
  }

  async function updateCommentAddendum(payload: UpdateAddendumRequest) {
      try {
        const outcome = await postAsync('/api/comments/addendum', payload, true);
        if (outcome.isFailure) return { success: false, error: outcome.error };
  
        const index = comments.value.findIndex(t => t.commentId === payload.commentId);
        if (index !== -1) {
          const comment = comments.value[index];
          if (comment) {
            comment.addendum = payload.addendum;
            comment.lastUpdatedAt = new Date().toISOString();
          }
          localStorage.setItem(`comment:draft:update:${payload.commentId}`, JSON.stringify(comments.value[index]));
        }
        activeComment.value = null;
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') };
      }
  }

  function cleanLocalDraft(commentId: string) {
    localStorage.removeItem(`${NEW_DRAFT_PREFIX}${commentId}`);
    localStorage.removeItem(`${UPDATE_DRAFT_PREFIX}${commentId}`);
  }

  function resetState() {
    comments.value = [];
    activeComment.value = null;
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
    comments, activeComment, isFetchingMore, loadMoreError, hasNext, pointer, baseRoute,
    createComment, replyComment, setActiveComment, loadComments, loadMoreComments, updateCommentDetails, deleteComment, 
    archiveComment, unArchiveComment, updateCommentAddendum, clearActiveComment, cleanLocalDraft, resetState, abort
  };
});