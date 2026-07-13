import { reactive } from 'vue';
import type { CommentStatus, ContentType, FlagType, VoteType} from '@/utils/enumHelper'
import { APIError } from '@/api/apiTypes.ts'

export interface Engageable {
  contentId: string; // Map your ULID string representation
  contentType: ContentType;
  myVote: VoteType;
  commentsCount: number;
  upvotesCount: number;
  downvotesCount: number;
  isFavorite: boolean;
  favoritesCount: number;
  flagsCount: number;
  sharesCount: number;
  viewsCount: number;
  insightsCount: number;
  hasFlagged: boolean;
  isEngagementLoaded: boolean;
  uiState: EngagementState; // Optional placeholder container
}

export interface EngagementState {
  voteClicks: number;
  favoriteClicks: number;
  snapshotVote: VoteType;
  snapshotUpvotes: number;
  snapshotDownvotes: number;
  snapshotFavorite: boolean;
  snapshotFavorites: number;
  firstVoteClick: VoteType | null;
  nextVoteClick: VoteType | null;
  lastVoteClick: number | null; // epoch milliseconds
  lastFavoriteClick: number | null;
}

// Factory to initialize pristine UI tracking states
export function createDefaultUiState(): EngagementState {
  return {
    voteClicks: 0,
    favoriteClicks: 0,
    snapshotVote: 'None',
    snapshotUpvotes: 0,
    snapshotDownvotes: 0,
    snapshotFavorite: false,
    snapshotFavorites: 0,
    firstVoteClick: null,
    nextVoteClick: null,
    lastVoteClick: null,
    lastFavoriteClick: null,
  };
}


// Factory to initialize pristine UI tracking states
export function createAbridgedUiState(): EngagementState {
  return {
    voteClicks: 0,
    favoriteClicks: 0,
    snapshotVote: 'None',
    snapshotUpvotes: 0,
    snapshotDownvotes: 0,
    snapshotFavorite: false,
    snapshotFavorites: 0,
    firstVoteClick: null,
    nextVoteClick: null,
    lastVoteClick: null,
    lastFavoriteClick: null,
  };
}


export function getEngagementMetadata(item: Engageable) {
  

  const hasLoaded = item.isEngagementLoaded;
  const clicksExceeded = (item.uiState.voteClicks || 0) >= 20;
  const favClicksExceeded = (item.uiState.favoriteClicks || 0) >= 20;
  const contentTypeLower = (item.contentType || 'item').toLowerCase();

  return {
    isVoteDisabled: !hasLoaded || clicksExceeded,
    isFavoriteDisabled: !hasLoaded || favClicksExceeded,
    isRepliesDisabled: (item.commentsCount || 0) === 0, // Maps cleanly to your backend response field
    isFlagDisabled: !hasLoaded || item.hasFlagged,

    isUpvoteChecked: item.myVote === 'Upvote' ? 'checked' : null,
    isDownvoteChecked: item.myVote === 'Downvote' ? 'checked' : null,

    favoriteClass: item.isFavorite ? 'active text-brand-gold' : '',
    flagClass: item.hasFlagged ? 'active text-brand-red' : '',

    flagText: item.hasFlagged ? 'Reported' : 'Report',
    flagLongText: item.hasFlagged 
      ? `You have reported this ${contentTypeLower}` 
      : `Report this ${contentTypeLower} for violations`,

    favoriteText: item.isFavorite ? 'Saved' : 'Save',
    favoriteAltText: item.isFavorite ? 'Following' : 'Follow',
    favoriteLongText: item.isFavorite 
      ? `Remove this ${contentTypeLower} from saved folder` 
      : `Add this ${contentTypeLower} to saved folder`
  };
}


export interface VoteRequest {
  contentId: string;
  content: ContentType;
  type: VoteType
}

export interface FavoriteRequest {
  contentId: string;
  content: ContentType;
}

export interface EngagementResponse {
  hasFlagged: boolean; 
 commentsCount: number;
  upvotesCount: number;
  downvotesCount: number;
  isFavorite: boolean;
  favoritesCount: number;
  flagsCount: number;
  sharesCount: number;
}

export interface GetFavoriteIdsResponse {
  favoriteIds: string[];
}

export interface GetEngagementIdsResponse {
  favoriteIds: string[];
   flagIds: string[];
    upvoteIds: string[];
     downvoteIds: string[];
}

export interface GetFavoriteIdResponse {
  favoriteId: string;
}

export interface CommentPageListDto {
  commentId: string;
  commentedAt: string;
  detail: string;
  commentatorId: string;
  commentatorUsername: string;
   contentId: string;
  contentType: ContentType;
   engagement: Engageable;
}

export interface BaseCommentListDto {
  commentId: string;
  contentId: string;
  contentType: ContentType;
  parentId: string | null;
  commentedAt: string;
  status: CommentStatus;
  hasEngagement: boolean;
  detail: string;
  addendum: string | null;
  engagement: Engageable;
}

export interface CommentListDto {
  commentId: string;
  contentId: string;
  contentType: ContentType;
  parentId: string | null;
  commentedAt: string;
  lastUpdatedAt: string;
  status: CommentStatus;
  hasEngagement: boolean;
  detail: string;
  addendum: string | null;
  commentatorId: string | null;
  commentatorUsername: string | null;
  engagement: Engageable;

  // Frontend Reactive Extensions
  title: string | null;
  pinnedReply: CommentListDto | null;
  ancestors: CommentListDto[];
  hasReplied: boolean | false

}

export interface GetContentCommentsResponse {
  comments: CommentListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}

export interface GetPageCommentsResponse {
  comments: CommentPageListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}

export interface GetCommentRepliesResponse {
  comments: CommentListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}

export function initializeCommentListEngagement(rawComment: any, isNew = false): CommentListDto {
  
  return {
    // 🧱 1. Explicitly pick top-level domain fields
    commentId: rawComment.commentId,
    contentId: rawComment.contentId,
    contentType: rawComment.contentType ?? 'Comment',
    parentId: rawComment.parentId ?? null,
    commentedAt: rawComment.commentedAt,
    lastUpdatedAt: rawComment.commentedAt ?? null,
    status: rawComment.status,
    hasEngagement: rawComment.hasEngagement ?? false,
    detail: rawComment.detail,
    addendum: rawComment.addendum ?? null,
    commentatorId: rawComment.commentatorId ?? null,
    commentatorUsername: rawComment.commentatorUsername ?? null,
    pinnedReply: rawComment.pinnedReply ?? null,
    ancestors: rawComment.ancestors ?? null,
    title: rawComment.title ?? null,
    hasReplied: rawComment.hasReplied ?? null,
    // 🛡️ Guarantee the nested engagement layer exists
    engagement: {
     contentId: rawComment.commentId || '',
      contentType: 'Comment',
      
      
      // 📊 Phase 1 Defaults (Overwritten during lazy-loaded metrics sync)
      upvotesCount:rawComment.upvotesCount || 0,
      downvotesCount: rawComment.downvotesCount || 0,
      commentsCount: rawComment.commentsCount || 0,
      favoritesCount: rawComment.favoritesCount || 0,
      flagsCount: rawComment.flagsCount || 0,

      sharesCount: 0,
      viewsCount: 0,
      insightsCount: 0,
     
      // 🔒 Phase 1 Personalization Defaults (Overwritten during Auth check sync)
      isFavorite: false,
      hasFlagged: false,
      myVote: 'None', // 🎯 Establishes 'Upvote' | 'Downvote' | 'None' baseline

      isEngagementLoaded: isNew,
      
      // ⚡ Pre-initialize the reactive UI state immediately on arrival
      uiState: reactive(createDefaultUiState())
    }
  };
}
export function initializeCommentPageListEngagement(rawComment: any, isNew = false): CommentPageListDto {
  
  return {
    // 🧱 1. Explicitly pick top-level domain fields
    commentId: rawComment.commentId,
    commentedAt: rawComment.commentedAt,
    detail: rawComment.detail,
    commentatorId: rawComment.commentatorId ?? null,
    commentatorUsername: rawComment.commentatorUsername ?? null,
     contentId: rawComment.contentId,
    contentType: rawComment.contentType ?? 'Comment',
    // 🛡️ Guarantee the nested engagement layer exists
    engagement: {
    contentId: rawComment.commentId || '',
    contentType: 'Comment',
      
      
      // 📊 Phase 1 Defaults (Overwritten during lazy-loaded metrics sync)
      upvotesCount:rawComment.upvotesCount || 0,
      downvotesCount: rawComment.downvotesCount || 0,
      commentsCount: rawComment.commentsCount || 0,
      favoritesCount: rawComment.favoritesCount || 0,
      flagsCount: rawComment.flagsCount || 0,

      sharesCount: 0,
      viewsCount: 0,
      insightsCount: 0,
     
      // 🔒 Phase 1 Personalization Defaults (Overwritten during Auth check sync)
      isFavorite: false,
      hasFlagged: false,
      myVote: 'None', // 🎯 Establishes 'Upvote' | 'Downvote' | 'None' baseline

      isEngagementLoaded: isNew,
      
      // ⚡ Pre-initialize the reactive UI state immediately on arrival
      uiState: reactive(createDefaultUiState())
    }
  };
}

export interface ActiveContentContext {
  id: string;
  title: string;
  contentType: ContentType;
  engagement: Engageable;
  writeCommentFromInline: boolean;
  pinnedComment: CommentListDto | null;
}


export interface CreateCommentRequest {
    contentid: string;
    content: ContentType; 
    detail: string;
}

export interface ReplyCommentRequest {
    contentid: string;
    content: ContentType; 
    detail: string;
    parentId: string;
}

export interface UpdateCommentRequest {
    contentid: string;
    content: ContentType; 
    detail: string;
    commentId: string;
}

export interface UpdateAddendumRequest {
 contentid: string;
    content: ContentType; 
    addendum: string | null;
    commentId: string;
}

export interface CommentCreatedResponse { 
    commentId: string; 
    detail: string; 
    createdAt: string;
    commentsCount: number;
  upvotesCount: number;
  downvotesCount: number;
  favoritesCount: number;
  flagsCount: number;
  sharesCount: number;
  viewsCount: number;
}

export interface SourceContentDto {
  title: string;
  slug: string;
  creatorId: string;
  creatorUsername: string;
  date: string;
  content: ContentType;
  summary: string;
}

export interface GetCommentThreadResponse { 
    source: SourceContentDto; 
    focus: CommentListDto; 
    ancestors: CommentListDto[] 
}

export interface LoadingCommentsResponse {
  success: boolean;
  comments: CommentListDto[];
  hasNext: boolean;
  pointer: string | null;
  anchor: string | null;
  error: APIError | null;
}



// 1. Define a clear structural contract for the output envelope
export interface LoadingPageCommentsResponse {
  success: boolean;
  comments: CommentPageListDto[];
  hasNext: boolean;
  pointer: any;
  anchor: any;
  error: any | null;
}

// 1. Define a clear structural contract for the output envelope
export interface LoadingCommentThreadResponse {
  success: boolean;
    source: SourceContentDto | null; 
    focus: CommentListDto | null; 
    ancestors: CommentListDto[] 
  error: any | null;
}


export interface UpdateDetailRequest {
  commentId: string;
  detail: string;
}

export interface UpdateAddendumRequest {
  commentId: string;
  addendum: string | null;
}

export interface ConfirmRequest {
  commentId: string;
  confirm: boolean;
}

export interface FlagRequest {
  contentId: string | null;
  content: ContentType | null;
  type: FlagType | null;
  notes: string | '';
}
