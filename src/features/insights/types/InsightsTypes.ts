import type { Country, Category, InsightStatus, VoteType } from '@/utils/enumHelper' // 🎯 Import your clean semantics
import { type Engageable, createDefaultUiState, type CommentPageListDto } from '@/features/engagements/types/EngagementTypes' // 🎯 Import your clean semantics
import { type SourceTaleDto } from '@/features/tales/types/TalesTypes' // 🎯 Import your clean semantics
import { reactive } from 'vue';
import { type CreatorDto } from '@/features/identity/types/IdentityTypes' // 🎯 Import your clean semantics


export interface GetInsightDraftListResponse {
  insights: InsightDraftListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}

export interface InsightDraftListDto {
  insightId: string;
  createdAt: string;
  lastUpdatedAt: string;
  creatorId: string;
  taleId: string;
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
  status: InsightStatus,
  tags: TagDraftDto[];
 
}

export interface GetInsightListResponse {
  insights: InsightListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}

export interface InsightListDto {
  insightId: string;
  createdAt: string;
  creatorId: string;
  taleId: string;
  creatorUsername: string;
  title: string;
  slug: string;
  readingTime: number;
  summary: string;
  photo: string;
  country: Country | null;
  category: Category;
  status: InsightStatus;
  engagement: Engageable
}

export interface InsightDetailDto {
  insightId: string;
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
  status: InsightStatus,
  tags: TagDraftDto[];
  insightscount: number;
  readingTime: number;
  isArchived: boolean;
  source: SourceTaleDto;
  engagement: Engageable
}


export interface CreateRequest {
    taleId: string;
    title: string; 
    category: Category | '-1'; // Using '-1' as a placeholder for unselected category
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
  insightId: string;
  title: string;
  category: Category | '-1';
}

export interface UpdateCountryRequest {
  insightId: string;
  country: Country | '-1'; // Using '-1' as a placeholder for unselected country
}

export interface UpdateSummaryRequest {
  insightId: string;
  summary: string;
}

export interface UpdateDetailRequest {
  insightId: string;
  detail: string;
}

export interface UpdateAddendumRequest {
  insightId: string;
  addendum: string | null;
}

export interface UpdatePhotoRequest {
  insightId: string;
  base64String: string;
  contentType: string;
  caption: string;
}

export interface TagRequest {
  insightId: string;
  name: string;
}

export interface UntagRequest {
  insightId: string;
  tagId: string;
}

export interface ConfirmRequest {
  insightId: string;
  confirm: boolean;
}

export interface GetInsightDetailPersonalizeResponse {
 hasFlagged: boolean;
  isFavorite: boolean;
  iscreatorFavorite: boolean;
  myVote: VoteType;
}

export interface InsightStatDto {
  viewsCount: 0;
      upvotesCount: 0;
      downvotesCount: 0;
      commentsCount: 0;
      favoritesCount: 0;
      sharesCount: 0;
      insightsCount: 0;
      flagsCount: 0;
}

export interface GetInsightPageEnrichmentResponse {
      comments: CommentPageListDto[];
      stats: Engageable
}

export interface InsightListDto {
  insightId: string;
  createdAt: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  slug: string;
  readingTime: number;
  summary: string;
  photo: string;
  country: Country | null;
  category: Category;
  status: InsightStatus;
 engagement: Engageable
}

export function initializeInsightListEngagement(rawInsight: any): InsightListDto {
  return {
    ...rawInsight,
    // 🛡️ Guarantee the nested engagement layer exists
    engagement: {
      contentId: rawInsight.insightId || '',
      contentType: 'Insight',
      upvotesCount: rawInsight.upvotesCount || 0,
      viewsCount: rawInsight.viewsCount || 0,
      commentsCount: rawInsight.commentsCount || 0,
      isFavorite: false,
      favoritesCount: rawInsight.favoritesCount || 0,
      isEngagementLoaded: false,
      
      // ⚡ Pre-initialize the reactive UI state immediately on arrival
      uiState: reactive(createDefaultUiState())
    }
  };
}

export function initializeInsightDetailEngagement(rawInsight: any): InsightDetailDto {
  return {
    ...rawInsight,
    
    // 🛡️ Pre-build the structural nesting layer framework immediately
    engagement: {
      contentId: rawInsight.insightId,
      contentType: 'Insight',
      
      // 📊 Phase 1 Baselines (Awaiting lazy-loaded live hydration counters)
      viewsCount: 0,
      sharesCount: 0,
      commentsCount: 0,
      upvotesCount: 0,
      downvotesCount: 0,
      favoritesCount: 0,
      flagsCount: 0,
      
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
export function hydrateInsightEngagement(targetEngagement: Engageable, stats: Engageable): void {

  Object.assign(targetEngagement, {
    viewsCount: stats.viewsCount ?? 0,
    sharesCount: stats.sharesCount ?? 0,
    commentsCount: stats.commentsCount ?? 0,
    upvotesCount: stats.upvotesCount ?? 0,
    downvotesCount: stats.downvotesCount ?? 0,
    favoritesCount: stats.favoritesCount ?? 0,
    flagsCount: stats.flagsCount ?? 0,

  });
}

export interface InsightLatestListDto {
  insightId: string;
  createdAt: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  summary: string;
  slug: string;
}
