import {ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { APIError } from '@/api/apiTypes.ts'
import { getAsync } from '@/api/apiGetServices'
import {postAsync } from '@/api/apiPostServices'
import type{ActiveContentContext, CommentListDto, GetContentCommentsResponse, 
    GetEngagementIdsResponse, LoadingCommentsResponse} from '../types/EngagementTypes.ts';
import {initializeCommentListEngagement} from '../types/EngagementTypes.ts';
import { useLoginHint } from '@/utils/authHelper'

export const useContentCommentsStore = defineStore('contentComments', () => {

  const isLoggedIn = useLoginHint()

  let feedController: AbortController | null = null;
  let hydrateController: AbortController | null = null;

 // State
  const activeContent = ref<ActiveContentContext | null>(null);
  const activeComment = ref<CommentListDto | null>(null);
  const activeCommentToReply = ref<CommentListDto | null>(null);
  const commentsMap = ref<Map<string, CommentListDto>>(new Map());

// --- GETTERS & HELPERS ---

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
    addCreatedComment,
    getRepliesForComment,
    getAncestorsForComment,
    hydratePersonals,
    loadComments,
    loadReplies,
    abort

  };
});