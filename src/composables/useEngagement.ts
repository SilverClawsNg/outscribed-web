import { ref, reactive } from 'vue';
import type { VoteType } from '@/utils/enumHelper';
import { 
  createDefaultUiState, 
  type Engageable, 
  type VoteRequest, 
  type FavoriteRequest,
  type EngagementResponse,
  type FlagRequest
} from '@/features/engagements/types/EngagementTypes';
import { useAlert } from '@/composables/useAlert';
import { postAsync } from '@/api/apiPostServices';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'; // Import your modal store
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'; // Import your modal store

// Global task registry tracking running timeouts across component instances
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Holds the pending action closure when unauthenticated
const pendingAction = ref<(() => void | Promise<any>) | null>(null);

const successMessage = ref('');

export function useEngagement() {
  const alert = useAlert();
const authStore = useAuthStore();
  const modalStore = useModalStore();

  /**
   * Helper to ensure authentication before running an engagement operation.
   * If unauthenticated, queues the callback and opens the Auth modal.
   */
  function requireAuth(action: () => void | Promise<any>): boolean {
    console.log("Checking log in...");
    if (!authStore.checkAuthentication()) {
      console.log("Not logged in...");
      pendingAction.value = action;
      modalStore.push('LoginUser', 'Login'); // Opens your Auth/Login modal
      return false;
    }
    console.log("Logged in...");
    return true;
  }

  /**
   * Resumes and clears any action queued prior to authentication.
   * Call this in your Auth success callback or watcher.
   */
  async function resumePendingAction() {
    if (pendingAction.value && authStore.checkAuthentication()) {
      const actionToExecute = pendingAction.value;
      pendingAction.value = null; // Clear queue before execution
      await actionToExecute();
    }
  }

  /**
   * Clears any scheduled API sync tasks for a specific action on a piece of content
   */
  function cancelScheduledJob(key: string) {
    if (activeTimers.has(key)) {
      clearTimeout(activeTimers.get(key)!);
      activeTimers.delete(key);
    }
  }

  /**
   * Main Upvote / Downvote Execution Thread
   */
  async function vote(engageable: Engageable, clickedVote: VoteType) {
    // Intercept unauthenticated users
    if (!requireAuth(() => vote(engageable, clickedVote))) return;

    const ui = engageable.uiState;
    const key = `vote:${engageable.contentId}`;

    if (hasOverVoted(engageable, key)) return;

    const now = Date.now();

    // Snapshot the pristine state on the very first click of a burst cycle
    if (ui.voteClicks === 0) {
      ui.snapshotVote = engageable.myVote;
      ui.snapshotUpvotes = engageable.upvotesCount;
      ui.snapshotDownvotes = engageable.downvotesCount;
      ui.firstVoteClick = clickedVote;
      ui.lastVoteClick = now;
    }

    ui.voteClicks++;
    
    // 1. Apply Optimistic Mutative UI State Instantly
    applyOptimisticVote(engageable, clickedVote);

    const elapsed = ui.lastVoteClick ? now - ui.lastVoteClick : 0;

    // Double Click Quick-Correction Check
    if (ui.voteClicks === 2 && elapsed < 800) {
      ui.nextVoteClick = clickedVote;

      if (ui.firstVoteClick === ui.nextVoteClick) {
        cancelScheduledJob(key);
        return;
      } else {
        cancelScheduledJob(key);
        scheduleVoteDispatch(engageable, key);
        ui.lastVoteClick = now;
        return;
      }
    }

    // Subsequent updates processing
    if (elapsed < 800) {
      cancelScheduledJob(key);
    }
    scheduleVoteDispatch(engageable, key);
    ui.lastVoteClick = now;
  }

  function hasOverVoted(engageable: Engageable, key: string) {
    const ui = engageable.uiState!;

    if (ui.voteClicks < 15) return false;
    
    cancelScheduledJob(key);
    rollbackVote(engageable);
  
    alert.set(
      "Too many clicks detected. Buttons disabled. Refresh and try again",
      'Warning'
    );

    return true;
  }

  function applyOptimisticVote(engageable: Engageable, clicked: VoteType) {
    const previous = engageable.myVote;

    if (previous === clicked) {
      if (previous === 'Upvote') engageable.upvotesCount = Math.max(0, engageable.upvotesCount - 1);
      if (previous === 'Downvote') engageable.downvotesCount = Math.max(0, engageable.downvotesCount - 1);
      engageable.myVote = 'None';
      successMessage.value = `Your vote on this ${engageable.contentType.toLowerCase()} was removed.`;
    }

    if (previous === 'None') {
      if (clicked === 'Upvote') engageable.upvotesCount++;
      if (clicked === 'Downvote') engageable.downvotesCount++;
      engageable.myVote = clicked;
    } else if (previous === 'Upvote' && clicked === 'Downvote') {
      engageable.upvotesCount = Math.max(0, engageable.upvotesCount - 1);
      engageable.downvotesCount++;
      engageable.myVote = 'Downvote';
    } else if (previous === 'Downvote' && clicked === 'Upvote') {
      engageable.downvotesCount = Math.max(0, engageable.downvotesCount - 1);
      engageable.upvotesCount++;
      engageable.myVote = 'Upvote';
    }

    const typeLabel = engageable.contentType.toLowerCase();
    if (engageable.myVote === 'Upvote') {
      successMessage.value = `You upvoted this ${typeLabel} — thanks for your feedback!`;
    } else if (engageable.myVote === 'Downvote') {
      successMessage.value = `You downvoted this ${typeLabel} — your opinion has been recorded.`;
    }
  }

  function rollbackVote(engageable: Engageable) {
    const ui = engageable.uiState;
    if (ui) {
      engageable.myVote = ui.snapshotVote;
      engageable.upvotesCount = ui.snapshotUpvotes;
      engageable.downvotesCount = ui.snapshotDownvotes;
    }
  }

  async function scheduleVoteDispatch(engageable: Engageable, key: string) {
    const timer = setTimeout(async () => {
      const ui = engageable.uiState!;
      
      if (engageable.myVote === ui?.snapshotVote) return;
      if (hasOverVoted(engageable, key)) return;

      try {
        const formData: VoteRequest = {
          contentId: engageable.contentId,
          contentType: engageable.contentType,
          type: engageable.myVote
        };

        const outcome = await postAsync<EngagementResponse>('/api/voting', formData, true);

        if (outcome.isFailure) {
          cancelScheduledJob(key);
          rollbackVote(engageable);
          alert.set("Server error occured. Vote failed. Rolling back.", 'Warning');
        } else {
          ui.voteClicks = 0;
          cancelScheduledJob(key);
          alert.set(successMessage.value, 'Success');

          if (outcome.value) {
            Object.assign(engageable, outcome.value);
            const typeLabel = engageable.contentType.toLowerCase();
            localStorage.removeItem(`${typeLabel}:anchor:votes`);
          }
        }
      } catch (err: any) {
        cancelScheduledJob(key);
        rollbackVote(engageable);
        alert.set("Unknown error occured. Vote failed. Rolling back.", 'Warning');
        ui.voteClicks = 0;
      } 
    }, 800);

    activeTimers.set(key, timer);
  }

  /**
   * Bookmark / Favorite Engagement Execution Pipeline
   */
  async function favorite(engageable: Engageable) {
    // Intercept unauthenticated users
    if (!requireAuth(() => favorite(engageable))) return;

    const ui = engageable.uiState;
    const key = `vote:${engageable.contentId}`;

    if (hasOverFavorited(engageable, key)) return;

    const now = Date.now();

    if (ui.favoriteClicks === 0) {
      ui.snapshotFavorite = engageable.isFavorite;
      ui.snapshotFavorites = engageable.favoritesCount;
      ui.lastFavoriteClick = now;
    }

    ui.favoriteClicks++;

    applyOptimisticFavorite(engageable);

    engageable.favoritesCount += engageable.isFavorite ? 1 : -1;
    if (engageable.favoritesCount < 0) engageable.favoritesCount = 0;

    const elapsed = ui.lastFavoriteClick ? now - ui.lastFavoriteClick : 0;

    if (ui.favoriteClicks === 2 && elapsed < 800) {
      if (engageable.isFavorite === ui.snapshotFavorite) {
        cancelScheduledJob(key);
        return;
      } else {
        cancelScheduledJob(key);
        scheduleFavoriteDispatch(engageable, key);
        ui.lastFavoriteClick = now;
        return;
      }
    }

    if (elapsed < 800) {
      cancelScheduledJob(key);
    }

    scheduleFavoriteDispatch(engageable, key);
    ui.lastFavoriteClick = now;
  }

  function applyOptimisticFavorite(engageable: Engageable) {
    engageable.isFavorite = !engageable.isFavorite;
    const typeLabel = engageable.contentType.toLowerCase(); 

    successMessage.value = engageable.isFavorite
      ? `This ${typeLabel} was added to your favorites!`
      : `This ${typeLabel} was removed from your favorites.`;
  }

  async function scheduleFavoriteDispatch(engageable: Engageable, key: string) {
    const timer = setTimeout(async () => {
      const ui = engageable.uiState!;
      
      if (engageable.isFavorite === ui?.snapshotFavorite) return;
      if (hasOverFavorited(engageable, key)) return;

      try {
        const formData: FavoriteRequest = {
          contentId: engageable.contentId,
          contentType: engageable.contentType
        };

        const endpoint = engageable.isFavorite 
          ? `api/favoriting/add` 
          : `api/favoriting/remove`;

        const outcome = await postAsync<EngagementResponse>(endpoint, formData, true);

        if (outcome.isFailure) {
          cancelScheduledJob(key);
          rollbackFavorite(engageable);
          alert.set("Server error occured. Save failed. Rolling back.", 'Warning');
        } else {
          ui.favoriteClicks = 0;
          cancelScheduledJob(key);
          alert.set(successMessage.value, 'Success');

          if (outcome.value) {
            Object.assign(engageable, outcome.value);
            const typeLabel = engageable.contentType.toLowerCase();
            localStorage.removeItem(`${typeLabel}:anchor:saves`);
          }
        }
      } catch (err: any) {
        cancelScheduledJob(key);
        rollbackFavorite(engageable);
        alert.set("Unknown error occured. Save failed. Rolling back.", 'Warning');
        ui.voteClicks = 0;
      } 
    }, 800);

    activeTimers.set(key, timer);
  }

  function hasOverFavorited(engageable: Engageable, key: string) {
    const ui = engageable.uiState!;

    if (ui.favoriteClicks < 15) return false;
    
    cancelScheduledJob(key);
    rollbackFavorite(engageable);
    alert.set("Too many clicks detected. Buttons disabled. Refresh and try again", 'Warning');

    return true;
  }

  function rollbackFavorite(engageable: Engageable) {
    const ui = engageable.uiState;
    if (ui) {
      engageable.isFavorite = ui.snapshotFavorite;
      engageable.favoritesCount = ui.snapshotFavorites;
    }
  }

  /**
   * Flagging pipeline. Opens the Flag modal if logged in, or Auth modal if unauthenticated.
   */
  async function flag(engageable: Engageable, formData: FlagRequest): Promise<{ success: boolean; error: APIError | null }> {
    // Intercept unauthenticated users
    if (!requireAuth(() => modalStore.push('FlagModal', 'Flag', engageable))) {
      return { success: false, error: null };
    }

    try {
      const outcome = await postAsync<EngagementResponse>('/api/flagging', formData, true);

      if (outcome.isFailure) return { success: false, error: outcome.error };

      if (outcome.value) {
        if (outcome.value.hasFlagged) {
          Object.assign(engageable, outcome.value);
          const typeLabel = engageable.contentType.toLowerCase();
          localStorage.removeItem(`${typeLabel}:anchor:flags`);

          const typeName = (engageable.contentType || formData.contentType || 'content').toLowerCase();
          alert.set(`You flagged this ${typeName}`, 'Success');
        } else {
          alert.set('You have previously reported this comment. Thank you for helping us keep OutScribed a safe and welcoming community', 'Success');
        }

        return { success: true, error: null };
      } else {
        return { 
          success: false, 
          error: new APIError(500, '500: Unknown Server Error', 'An unexpected error occurred.', 'Server.Exception') 
        };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
      };
    }
  }

  return {
    vote,
    favorite,
    flag,
    resumePendingAction,
    hasPendingAction: () => pendingAction.value !== null
  };
}