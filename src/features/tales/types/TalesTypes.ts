import type { Country, Category, TaleStatus, VoteType, ContentType } from '@/utils/enumHelper' // 🎯 Import your clean semantics
import { type Engageable, createDefaultUiState, type CommentPageListDto } from '@/features/engagements/types/EngagementTypes' // 🎯 Import your clean semantics
import { reactive } from 'vue';
import { type CreatorDto } from '@/features/identity/types/IdentityTypes' // 🎯 Import your clean semantics
import { type InsightLatestListDto } from '@/features/insights/types/InsightsTypes' // 🎯 Import your clean semantics

/**
 * 🧱 BASE TALE COMPONENT
 * The core property foundation shared by every single story representation
 * across the OutScribed network infrastructure.
 */
export interface BaseTaleDto {
  taleId: string;
  createdAt: string;
  title: string;
  slug: string;
  summary: string;
}


export interface TaleLatestDto extends BaseTaleDto {}

export interface SourceTaleDto extends BaseTaleDto {
  creatorId: string;
  creatorUsername: string;
}

export interface GetTaleDraftListResponse {
  tales: TaleDraftListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}

export interface TaleDraftListDto {
  taleId: string;
  createdAt: string;
  lastUpdatedAt: string;
  creatorId: string;
  title: string;
  slug: string;
  addendum: string | null;
  addendumDate: string | null;
  summary: string | null;
  detail: string | null;
  photo: string | null;
  photoCaption: string | null;
  hasEngagement: boolean;
  country: Country | null;
  category: Category;
  status: TaleStatus,
  tags: TagDraftDto[];
  watchlistTitle: string | null;
  watchlistSummary: string | null;
  watchlistSource: string | null;
  watchlistUrl: string | null;
}

export interface GetTaleListResponse {
  tales: TaleListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}

export interface TaleListDto {
  taleId: string;
  createdAt: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  slug: string;
  readingTime: number;
  summary: string;
  photo: string;
  insightsCount: number;
  country: Country | null;
  category: Category;
  status: TaleStatus;
  engagement: Engageable
}


export interface TaleDetailDto {
  taleId: string;
  createdAt: string;
  creator: CreatorDto;
  title: string;
  summary: string;
  detail: string;
  photo: string;
  photoCaption: string;
  addendum: string | null;
  addendumDate: string | null;
  country: Country | null;
  category: Category;
  status: TaleStatus,
  tags: TagDraftDto[];
  insightscount: number;
  readingTime: number;
  isArchived: boolean;
  watchlistTitle: string;
  watchlistSummary: string;
  watchlistSource: string;
  watchlistUrl: string;
  engagement: Engageable
}


export interface CreateRequest {
    title: string; 
    category: Category;
}

export interface CreateResponse { 
    id: string; 
    slug: string; 
    createdAt: string 
}

export interface TagDraftDto {
  tagId: string; // Using string to handle backend Ulid representation
  name: string;
}


export interface UpdateRequest {
  taleId: string;
  title: string;
  category: Category | '-1';
}

export interface UpdateCountryRequest {
  taleId: string;
  country: Country | '-1';
}

export interface UpdateSummaryRequest {
  taleId: string;
  summary: string;
}

export interface UpdateDetailRequest {
  taleId: string;
  detail: string;
}

export interface UpdateAddendumRequest {
  taleId: string;
  addendum: string | null;
}

export interface UpdateWatchlistRequest {
  taleId: string;
  title: string | null;
  summary: string | null;
  source: string | null;
  sourceUrl: string | null;
}

export interface UpdatePhotoRequest {
  taleId: string;
  base64String: string;
  contentType: string;
  caption: string;
}

export interface TagRequest {
  taleId: string;
  name: string;
}

export interface UntagRequest {
  taleId: string;
  tagId: string;
}

export interface ConfirmRequest {
  taleId: string;
  confirm: boolean;
}

export interface GetTaleDetailPersonalizeResponse {
 hasFlagged: boolean;
  isFavorite: boolean;
  iscreatorFavorite: boolean;
  myVote: VoteType;
}

export function initializeTaleListEngagement(rawTale: any): TaleListDto {

  return {
    // 1. Spread out the primitive core values from the network line safely
    ...rawTale,
    
    // 2. Explicitly map your rich nested engagement graph
    engagement: {
      contentId: rawTale.taleId || '',
      contentType: 'Tale',
      
      // 📊 Phase 1 Defaults (Overwritten during lazy-loaded metrics sync)
      viewsCount: rawTale.viewsCount || 0,
      upvotesCount:rawTale.upvotesCount || 0,
      downvotesCount: rawTale.downvotesCount || 0,
      commentsCount: rawTale.commentsCount || 0,
      favoritesCount: rawTale.favoritesCount || 0,
      sharesCount: rawTale.sharesCount || 0,
      flagsCount: rawTale.flagsCount || 0,
      insightsCount: rawTale.insightsCount || 0,
      
      // 🔒 Phase 1 Personalization Defaults (Overwritten during Auth check sync)
      isFavorite: false,
      hasFlagged: false,
      myVote: 'None', // 🎯 Establishes 'Upvote' | 'Downvote' | 'None' baseline

      isEngagementLoaded: false,

      // ⚡ Pre-initialize the reactive UI state immediately on arrival
      uiState: reactive(createDefaultUiState())
    }
  };
}

export function initializeTaleDetailEngagement(rawTale: any): TaleDetailDto {
  return {
    ...rawTale,
    
    // 🛡️ Pre-build the structural nesting layer framework immediately
    engagement: {
      contentId: rawTale.taleId,
      contentType: 'Tale',
      
      // 📊 Phase 1 Baselines (Awaiting lazy-loaded live hydration counters)
      viewsCount: 0,
      sharesCount: 0,
      commentsCount: 0,
      upvotesCount: 0,
      downvotesCount: 0,
      favoritesCount: 0,
      flagsCount: 0,
      insightsCount: 0,
      
      // 🔒 Phase 1 Personalization Defaults
      isFavorite: false,
      hasFlagged: false,
      myVote: 'None', 

      isEngagementLoaded: false,
      
      // ⚡ Pre-initialize the reactive UI tracking states immediately
      uiState: reactive(createDefaultUiState())
    }
  };
}

/**
 * 🚀 Hydrates an existing reactive engagement structural shell with live stats.
 */
export function hydrateTaleEngagement(targetEngagement: Engageable, stats: Engageable): void {

  Object.assign(targetEngagement, {
    viewsCount: stats.viewsCount ?? 0,
    sharesCount: stats.sharesCount ?? 0,
    commentsCount: stats.commentsCount ?? 0,
    upvotesCount: stats.upvotesCount ?? 0,
    downvotesCount: stats.downvotesCount ?? 0,
    favoritesCount: stats.favoritesCount ?? 0,
    flagsCount: stats.flagsCount ?? 0,
    insightsCount: stats.insightsCount ?? 0

  });
}

export interface TaleStatDto {
  viewsCount: 0;
      upvotesCount: 0;
      downvotesCount: 0;
      commentsCount: 0;
      favoritesCount: 0;
      sharesCount: 0;
      insightsCount: 0;
      flagsCount: 0;
}

export interface GetTalePageEnrichmentResponse {
  insights: InsightLatestListDto[];
      comments: CommentPageListDto[];
      stats: Engageable;
}