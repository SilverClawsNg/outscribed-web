import {ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useContentCommentsFilterStore } from './ContentCommentsFilterStore.ts'
import { APIError } from '@/api/apiTypes.ts'
import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import type{ActiveContentContext, CommentListDto, GetContentCommentsResponse, 
    GetEngagementIdsResponse, LoadingCommentsResponse} from '../types/EngagementTypes.ts';
import {initializeCommentListEngagement} from '../types/EngagementTypes.ts';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore.ts';
import { useLoginHint } from '@/utils/authHelper'

export const useContentCommentsStore = defineStore('contentComments', () => {

  const isLoggedIn = useLoginHint()

  let feedController: AbortController | null = null;
  let hydrateController: AbortController | null = null;

 // State
  const activeContent = ref<ActiveContentContext | null>(null);

  // 🎯 Transitional handoff reference for opening reply threads
  const activeComment = ref<CommentListDto | null>(null);

  // 🎯 Creation target reference
  const activeCommentToReply = ref<CommentListDto | null>(null);

  const commentsMap = ref<Map<string, CommentListDto>>(new Map());

  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes

// --- GETTERS & HELPERS ---


/** 🎯 Freshness Guard: Checks if target was loaded and is within TTL */
  function isFresh(target?: { expiresAt?: number | null } | null): boolean {
    console.log(`Expires at ${target?.expiresAt}`);
    if (!target?.expiresAt) return false;
    return Date.now() - target.expiresAt < CACHE_TTL_MS;
  }

/* ==========================================================================
   ULID-SORTED COMMENT GETTERS (CONTENT COMMENTS STORE)
   ========================================================================== */

/** 🎯 Unpinned top-level comments sorted by ULID (newest first) */
const topLevelComments = computed(() => {
  if (!activeContent.value) return [];

  const pinnedId = activeContent.value.pinnedComment?.commentId;

  return Array.from(commentsMap.value.values())
    .filter(
      (c) =>
        c.contentId === activeContent.value?.id &&
        c.parentId === null &&
        c.commentId !== pinnedId
    )
    .sort((a, b) => b.commentId.localeCompare(a.commentId));
});

/** 🎯 Direct child replies sorted by ULID (newest first, excluding pinned reply) */
function getRepliesForComment(parentId: string): CommentListDto[] {
  const parentComment = commentsMap.value.get(parentId);
  const pinnedReplyId = parentComment?.pinnedReply?.commentId;

  return Array.from(commentsMap.value.values())
    .filter(
      (c) =>
        c.parentId === parentId &&
        c.commentId !== pinnedReplyId
    )
    .sort((a, b) => b.commentId.localeCompare(a.commentId));
}
  /** 🎯 Child replies derived dynamically for activeComment */
  const activeCommentReplies = computed(() => {
    if (!activeComment.value) return [];
    return Array.from(commentsMap.value.values()).filter(
      (c) => c.parentId === activeComment.value?.commentId
    );
  });


  /** Helper to compute top-to-bottom lineage for ANY comment ID */
  function getAncestorsForComment(commentId: string): CommentListDto[] {
    const ancestors: CommentListDto[] = [];
    let current = commentsMap.value.get(commentId);

    while (current && current.parentId) {
      const parent = commentsMap.value.get(current.parentId);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return ancestors;
  }


  // --- ACTIONS ---

  function setActiveContent(content: ActiveContentContext) {
    if (activeContent.value?.id !== content.id) {
      activeContent.value = content;
      activeComment.value = null;
      commentsMap.value.clear();
    }
  }

  function setActiveComment(comment: CommentListDto | null) {
    activeComment.value = comment;
  }

  function setActiveCommentToReply(comment: CommentListDto | null) {
    activeCommentToReply.value = comment;
  }
// --- FETCH / LOAD COMMENTS ACTION ---

  /** Load Top-Level Comments for activeContent */
  async function loadComments(
    apiPathWithFilters: string, 
    isLoadMore = false
  ): Promise<LoadingCommentsResponse> {
    const target = activeContent.value;
    const response: LoadingCommentsResponse = {
      success: false,
      comments: [],
      hasNext: false,
      pointer: null,
      anchor: null,
      error: null
    };

    if (!target) {
      response.error = new APIError(400, 'Context Missing', 'No active content set.');
      return response;
    }

    // 🎯 CACHE HIT (Initial Page Only)
    if (!isLoadMore && isFresh(target)) {
      response.success = true;
      response.comments = topLevelComments.value;
      response.hasNext = target.hasNext ?? false;
      response.pointer = target.pointer ?? null;
      response.anchor = target.anchor ?? null;
      return response;
    }

    try {
      if (feedController) feedController.abort();
      feedController = new AbortController();

      const outcome = await getAsync<GetContentCommentsResponse>(
        apiPathWithFilters,
        false,
        {} as GetContentCommentsResponse,
        feedController.signal
      );

      if (outcome.isFailure || !outcome.value) {
        response.error = outcome.error || new APIError(500, 'Error', 'Failed to retrieve comments');
        return response;
      }

      // Map incoming batch and add to centralized store map
      const fetchedComments = outcome.value.comments.map((raw) => {
        const comment = initializeCommentListEngagement(raw);
        commentsMap.value.set(comment.commentId, comment);
        return comment;
      });

      // Update Cursor & Timestamp Metadata on Active Content
      target.hasNext = outcome.value.hasNext;
      target.pointer = outcome.value.pointer;
      target.anchor = outcome.value.anchor;
      target.expiresAt = outcome.value.expiresAt;

      // Return full updated slice to caller
      response.success = true;
      response.comments = topLevelComments.value;
      response.hasNext = target.hasNext;
      response.pointer = target.pointer;
      response.anchor = target.anchor;
      return response;

    } catch (err: any) {
      response.error = err?.error || new APIError(500, 'Internal Client Error', err.message);
      return response;
    }
  }

  /** Load Direct Replies for activeComment */
  async function loadReplies(
    apiPathWithFilters: string, 
    isLoadMore = false
  ): Promise<LoadingCommentsResponse> {
    const target = activeComment.value;
    const response: LoadingCommentsResponse = {
      success: false,
      comments: [],
      hasNext: false,
      pointer: null,
      anchor: null,
      error: null
    };

        console.log(`CommentId inside loadReplies is ${activeComment.value?.commentId}`)


    if (!target) {
      response.error = new APIError(400, 'Context Missing', 'No active parent comment set.');
      return response;
    }

    // 🎯 CACHE HIT (Initial Page Only)
    if (!isLoadMore && isFresh(target)) {
      response.success = true;
      response.comments = activeCommentReplies.value;
      response.hasNext = target.hasNext ?? false;
      response.pointer = target.pointer ?? null;
      response.anchor = target.anchor ?? null;
      return response;
    }

    try {
      if (feedController) feedController.abort();
      feedController = new AbortController();

      const outcome = await getAsync<GetContentCommentsResponse>(
        apiPathWithFilters,
        false,
        {} as GetContentCommentsResponse,
        feedController.signal
      );

      if (outcome.isFailure || !outcome.value) {
        response.error = outcome.error || new APIError(500, 'Error', 'Failed to retrieve replies');
        return response;
      }

      // Map incoming batch and populate map
      outcome.value.comments.forEach((raw) => {
        const reply = initializeCommentListEngagement(raw);
        commentsMap.value.set(reply.commentId, reply);
      });

      // Update Cursor & Timestamp Metadata on Parent Comment
      target.hasNext = outcome.value.hasNext;
      target.pointer = outcome.value.pointer;
      target.anchor = outcome.value.anchor;
      target.expiresAt = outcome.value.expiresAt;

      response.success = true;
      response.comments = activeCommentReplies.value;
      response.hasNext = target.hasNext;
      response.pointer = target.pointer;
      response.anchor = target.anchor;
      return response;

    } catch (err: any) {
      response.error = err?.error || new APIError(500, 'Internal Client Error', err.message);
      return response;
    }
  }

  /** Add newly created comment/reply locally */
  function addCreatedComment(newComment: CommentListDto, isReply = false) {
    commentsMap.value.set(newComment.commentId, newComment);

    if (!isReply && activeContent.value) {
      activeContent.value.pinnedComment = newComment;
    } else if (isReply && activeComment.value) {
      activeComment.value.pinnedReply = newComment;
      activeComment.value.hasReplied = true;
    }
  }


























/** Fetch Top-Level Comments */
  async function fetchContentComments(apiPath: string, forceRefresh = false): Promise<boolean> {

    if (!activeContent.value) return false;

    // Use single helper to check both loaded state and freshness
    if (!forceRefresh && isFresh(activeContent.value)) {
      return true;
    }

    try {
      const outcome = await getAsync<GetContentCommentsResponse>(apiPath, false);

      if (outcome.isSuccess && outcome.value?.comments) {

        outcome.value.comments.forEach((raw) => {
          const comment = initializeCommentListEngagement(raw);
          commentsMap.value.set(comment.commentId, comment);
        });

        // 🎯 Sets both loaded state & freshness timestamp simultaneously
        activeContent.value.expiresAt = Date.now();
        return true;
      }
    } catch (err) {
      console.error('[ContentCommentsStore] Error fetching top-level comments:', err);
    }
    return false;
  }

  /** Fetch Child Replies */
  async function fetchCommentReplies(targetComment: CommentListDto, apiPath: string, forceRefresh = false): Promise<boolean> {
    if (!forceRefresh && isFresh(targetComment)) {
      return true;
    }

    try {
      const outcome = await getAsync<GetContentCommentsResponse>(apiPath, false);
      if (outcome.isSuccess && outcome.value?.comments) {
        outcome.value.comments.forEach((raw) => {
          const reply = initializeCommentListEngagement(raw);
          commentsMap.value.set(reply.commentId, reply);
        });

        // 🎯 Sets both loaded state & freshness timestamp simultaneously
        targetComment.expiresAt = Date.now();
        return true;
      }
    } catch (err) {
      console.error('[ContentCommentsStore] Error fetching replies:', err);
    }
    return false;
  }

  // --- Core Actions ---

  /**
   * 1. LoadComments (Initial setup for a Tale or Insight comment list)
   */

  async function loadCommentsx(apiPathWithFilters: string) : Promise<LoadingCommentsResponse>{
  
      // 2. Initialize the default response layout envelope right at the entrance gate
        const response: LoadingCommentsResponse = {
          success: false,
          comments: [],
          hasNext: false,
          pointer: null,
          anchor: null,
          error: null
        };
        
    try {

      feedController = new AbortController();

      const outcome = await getAsync<GetContentCommentsResponse>(apiPathWithFilters, false, {} as GetContentCommentsResponse, 
        feedController.signal);

     if (outcome.isFailure) {
      response.error = outcome.error || null
        return response;
      }
       
      if (outcome.value && outcome.value.comments) {
        response.hasNext = outcome.value.hasNext;
        response.pointer = outcome.value.pointer;
        response.anchor = outcome.value.anchor;

        // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      response.comments = outcome.value.comments.map((item: any) => initializeCommentListEngagement(item));

      console.log('--- Vue State Snapshot inside loading contents store ---', JSON.parse(JSON.stringify(response.comments)));

      } 
      response.success = true
    // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
    return response;

    } catch (err: any) {
    // Fail-safe catch-all wrapper
    response.error = err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.', 'Client.Exception')
    return response;
  }
  }
  /**
   * 2. LoadMoreComments (Infinite scroll continuation pipeline)
   */
  async function loadMoreCommentsx(apiPathWithFilters: string) : Promise<LoadingCommentsResponse> {

      // 2. Initialize the default response layout envelope right at the entrance gate
        const response: LoadingCommentsResponse = {
          success: false,
          comments: [],
          hasNext: false,
          pointer: null,
          anchor: null,
          error: null
        };
        
    try {

  // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();
               
        const outcome = await getAsync<GetContentCommentsResponse>(apiPathWithFilters, false, {} as GetContentCommentsResponse,
            feedController.signal
        )

          if (outcome.isFailure) {
      response.error = outcome.error || null
        return response;
      }

        
    // Consideration 2: Reconcile updates if data was retrieved
        if (outcome.value && outcome.value.comments) {
          // Reconcile updates against incoming block (handles slower message brokers)
          
          // Commit clean data to store state
          response.hasNext = outcome.value.hasNext;
          response.pointer = outcome.value.pointer;

            // 🔄 Map and clean the data stream BEFORE it hits the UI state engine
      response.comments = outcome.value.comments.map((item: any) => initializeCommentListEngagement(item));


        } else{ // stop infinite scrolling by setting has next to false
           response.hasNext = false
           response.pointer ='-1'
        }

         response.success = true
    // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
    return response;

    } catch (err: any) {
    // Fail-safe catch-all wrapper
    response.error = err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.', 'Client.Exception')
    return response;
  } 
  }


  /**
   * 4. HydratePersonals (The "Private Truth" authentication state loop with backoff resilience)
   */
  async function hydratePersonals(currentBatch: CommentListDto[]) {
  
    // 1. Guard Clause: Skip entirely if anonymous or batch package is empty
    if (!isLoggedIn || currentBatch.length === 0) {
      activateEngagementButtons(currentBatch);
      console.log('[HydratePersonals]: Not logged in or empty batch.');
      return;
    }

     const maxRetries = 2; // Loops: 0, 1, 2 (Total 3 attempts)
    const commentIds = currentBatch.map(x => x.commentId);

 for (let i = 0; i <= maxRetries; i++) {

      try {

          // Spawn a fresh controller instance for this specific execution pass
        hydrateController = new AbortController();

       // Replace with your actual Axios/Fetch HTTP abstraction layout instance
        const outcome = await postAsync<GetEngagementIdsResponse>('api/engagements/ids', { contentIds: commentIds }, true,
          hydrateController.signal
        );

        if (outcome.isSuccess) {

          const favSet = new Set<string>(outcome.value?.favoriteIds || []);
          const flagSet = new Set<string>(outcome.value?.flagIds || []);
          const upSet = new Set<string>(outcome.value?.upvoteIds || []);
          const downSet = new Set<string>(outcome.value?.downvoteIds || []);

          currentBatch.forEach(comment => {
          if(comment.engagement){

            comment.engagement.isFavorite = favSet.has(comment.commentId);
            comment.engagement.hasFlagged = flagSet.has(comment.commentId);
            
            if (upSet.has(comment.commentId)) comment.engagement.myVote = 'Upvote';
            else if (downSet.has(comment.commentId)) comment.engagement.myVote = 'Downvote';
            else comment.engagement.myVote = 'None';
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

  function activateEngagementButtons(currentBatch: CommentListDto[]) {

          console.log('[activateEngagementButtons]: Starting engagement activation.');

       
    currentBatch.forEach(comment => {
        if(comment.engagement){
      comment.engagement.isEngagementLoaded = true;
      //console.log(`Activating engagement. ${comment.commentId} and is engaged ${comment.engagement.isEngagementLoaded}`);
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
   activeContent,
    activeComment,
    commentsMap,
    topLevelComments,
    activeCommentToReply,
    setActiveCommentToReply,
    setActiveContent,
    setActiveComment,
    fetchContentComments,
    fetchCommentReplies,
    addCreatedComment,
    getRepliesForComment,
    getAncestorsForComment,
    hydratePersonals,
    loadComments,
    loadReplies,
    //loadMoreComments,
    abort

  };
});