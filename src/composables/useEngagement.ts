import { ref } from 'vue';
import type { ReactionType } from '@/utils/enumHelper';
import { 
  type Engageable, 
  type FavoriteRequest,
  type EngagementResponse,
  type FlagRequest,
  type EngagementState,
  type ReactionRequest
} from '@/features/engagements/types/EngagementTypes';
import { useAlert } from '@/composables/useAlert';
import { postAsync } from '@/api/apiPostServices';
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore'; // Import your modal store
import { useAuthenticationStore } from '@/features/authentication/stores/AuthenticationStore'; // Import your modal store

// Global task registry tracking running timeouts across component instances
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Holds the pending action closure when unauthenticated
const pendingAction = ref<(() => void | Promise<any>) | null>(null);

const successMessage = ref('');

export function useEngagement() {
  const alert = useAlert();
  const authStore = useAuthenticationStore();
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
  
// Map reaction type to its counter property on Engageable
const REACTION_COUNTER_MAP: Record<Exclude<ReactionType, 'None'>, keyof Engageable> = {
  Upvote: 'upvotesCount',
  Downvote: 'downvotesCount',
  TransformedPerspective: 'transformedPerspectivesCount',
  ExposesReality: 'exposesRealitiesCount',
  SparksDebate: 'sparksDebatesCount',
  MissedCriticalContext: 'missedCriticalContextsCount',
  LacksRealWorldRelevance: 'lacksRealWorldRelevancesCount'
};

// Map reaction type to its snapshot property on EngagementState
const REACTION_SNAPSHOT_MAP: Record<Exclude<ReactionType, 'None'>, keyof EngagementState> = {
  Upvote: 'snapshotUpvotes',
  Downvote: 'snapshotDownvotes',
  TransformedPerspective: 'snapshotTransformedPerspectives',
  ExposesReality: 'snapshotExposesRealities',
  SparksDebate: 'snapshotSparksDebates',
  MissedCriticalContext: 'snapshotMissedCriticalContexts',
  LacksRealWorldRelevance: 'snapshotLacksRealWorldRelevancess'
};

// User feedback messaging labels
const REACTION_LABEL_MAP: Record<Exclude<ReactionType, 'None'>, string> = {
  Upvote: 'upvoted',
  Downvote: 'downvoted',
  TransformedPerspective: 'marked as "Transformed Perspective"',
  ExposesReality: 'marked as "Exposes Reality"',
  SparksDebate: 'marked as "Sparks Debate"',
  MissedCriticalContext: 'marked as "Missed Critical Context"',
  LacksRealWorldRelevance: 'marked as "Lacks Real-World Relevance"'
};

function decrementCount(engageable: Engageable, reaction: ReactionType) {
  if (reaction === 'None') return;
  const propKey = REACTION_COUNTER_MAP[reaction];
  if (propKey && typeof engageable[propKey] === 'number') {
    (engageable[propKey] as number) = Math.max(0, (engageable[propKey] as number) - 1);
  }
}

function incrementCount(engageable: Engageable, reaction: ReactionType) {
  if (reaction === 'None') return;
  const propKey = REACTION_COUNTER_MAP[reaction];
  if (propKey && typeof engageable[propKey] === 'number') {
    (engageable[propKey] as number)++;
  }
}

function applyOptimisticReaction(engageable: Engageable, clicked: ReactionType) {
  const previous = engageable.myReaction;
  const typeLabel = engageable.contentType.toLowerCase();

  // 1. Deselecting active reaction
  if (previous === clicked) {
    decrementCount(engageable, previous);
    engageable.myReaction = 'None';
    successMessage.value = `Your reaction on this ${typeLabel} was removed.`;
    return;
  }

  // 2. Switching reaction
  if (previous !== 'None') {
    decrementCount(engageable, previous);
  }

  incrementCount(engageable, clicked);
  engageable.myReaction = clicked;

  const actionText = REACTION_LABEL_MAP[clicked as Exclude<ReactionType, 'None'>] || 'reacted to';
  successMessage.value = `You ${actionText} this ${typeLabel} — thanks for your feedback!`;
}

function rollbackReaction(engageable: Engageable) {
  const ui = engageable.uiState;
  if (!ui) return;

  engageable.myReaction = ui.snapshotReaction;

  // Restore all individual reaction counters from snapshot fields
  (Object.keys(REACTION_COUNTER_MAP) as Exclude<ReactionType, 'None'>[]).forEach(reaction => {
    const counterKey = REACTION_COUNTER_MAP[reaction];
    const snapshotKey = REACTION_SNAPSHOT_MAP[reaction];
    
    if (counterKey in engageable && snapshotKey in ui) {
      (engageable[counterKey] as number) = ui[snapshotKey] as number;
    }
  });
}

function hasOverReacted(engageable: Engageable, key: string): boolean {
  const ui = engageable.uiState;

  if (ui.reactionClicks < 15) return false;

  cancelScheduledJob(key);
  rollbackReaction(engageable);

  alert.set('Too many clicks detected. Buttons disabled. Refresh and try again.', 'Warning');
  return true;
}

async function scheduleReactionDispatch(engageable: Engageable, key: string) {
  const timer = setTimeout(async () => {
    const ui = engageable.uiState;

    if (engageable.myReaction === ui?.snapshotReaction) return;
    if (hasOverReacted(engageable, key)) return;

    try {
      const payload: ReactionRequest = {
        contentId: engageable.contentId,
        contentType: engageable.contentType,
        type: engageable.myReaction
      };

      const endpoint = engageable.contentType.toLowerCase() === 'tale'
        ? '/api/reactions/tale'
        : '/api/reactions/comment';

      const outcome = await postAsync<EngagementResponse>(endpoint, payload, true);

      if (outcome.isFailure) {
        cancelScheduledJob(key);
        rollbackReaction(engageable);
        alert.set('Server error occurred. Reaction failed. Rolling back.', 'Warning');
      } else {
        ui.reactionClicks = 0;
        cancelScheduledJob(key);
        alert.set(successMessage.value, 'Success');

        if (outcome.value) {
          Object.assign(engageable, outcome.value);
          const typeLabel = engageable.contentType.toLowerCase();
          localStorage.removeItem(`${typeLabel}:anchor:reactions`);
        }
      }
    } catch (err: any) {
      cancelScheduledJob(key);
      rollbackReaction(engageable);
      alert.set('Unknown error occurred. Reaction failed. Rolling back.', 'Warning');
      ui.reactionClicks = 0;
    }
  }, 800);

  activeTimers.set(key, timer);
}

// Main reaction entry point inside useEngagement
async function react(engageable: Engageable, clickedReaction: ReactionType) {
  if (!requireAuth(() => react(engageable, clickedReaction))) return;

  const ui = engageable.uiState;
  const key = `reaction:${engageable.contentId}`;

  if (hasOverReacted(engageable, key)) return;

  const now = Date.now();

  // Snapshot pristine state on the very first click of a burst cycle
  if (ui.reactionClicks === 0) {
    ui.snapshotReaction = engageable.myReaction;
    ui.snapshotUpvotes = engageable.upvotesCount;
    ui.snapshotDownvotes = engageable.downvotesCount;
    ui.snapshotTransformedPerspectives = engageable.transformedPerspectivesCount;
    ui.snapshotExposesRealities = engageable.exposesRealitiesCount;
    ui.snapshotSparksDebates = engageable.sparksDebatesCount;
    ui.snapshotMissedCriticalContexts = engageable.missedCriticalContextsCount;
    ui.snapshotLacksRealWorldRelevancess = engageable.lacksRealWorldRelevancesCount;

    ui.firstVoteClick = clickedReaction;
    ui.lastVoteClick = now;
  }

  ui.reactionClicks++;

  applyOptimisticReaction(engageable, clickedReaction);

  const elapsed = ui.lastVoteClick ? now - ui.lastVoteClick : 0;

  // Quick double-click correction window check
  if (ui.reactionClicks === 2 && elapsed < 800) {
    ui.nextVoteClick = clickedReaction;

    if (ui.firstVoteClick === ui.nextVoteClick) {
      cancelScheduledJob(key);
      return;
    } else {
      cancelScheduledJob(key);
      scheduleReactionDispatch(engageable, key);
      ui.lastVoteClick = now;
      return;
    }
  }

  if (elapsed < 800) {
    cancelScheduledJob(key);
  }

  scheduleReactionDispatch(engageable, key);
  ui.lastVoteClick = now;
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
        ui.favoriteClicks = 0;
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
    react,
    favorite,
    flag,
    resumePendingAction,
    hasPendingAction: () => pendingAction.value !== null
  };
}