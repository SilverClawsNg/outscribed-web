import type { ContentType, ActivityType, Category, Country, WriterStatus } from '@/utils/enumHelper' // 🎯 Import your clean semantics
import { type TaleListDto } from '@/features/tales/types/TalesTypes' // 🎯 Import your clean semantics
import { type InsightListDto } from '@/features/insights/types/InsightsTypes' // 🎯 Import your clean semantics
import type { CreatorDto } from '@/features/identity/types/IdentityTypes'

export interface TimelineDto {
  id: string
  happenedAt: string
  
  // 🎯 THE FIX: Force strict semantic union matching (remove "| string")
  contentType: ContentType    
  activityType: ActivityType  
  
  contentId: string
  actorId: string
  broadcastId: string | null
  broadcasterUsername: string | null
  payload: Record<string, string> | null
  [key: string]: any 
}

// Helper type for response
export interface GetTimelineResponse {
  timelines: TimelineDto[];
  hasNext: boolean;
  pointer: string | null; 
  anchor: string | null
}

// Helper type for response
export interface GetHomeContentsResponse {
  tales: TaleListDto[];
  insights: InsightListDto[];
  tags: TagListDto[];
  categories: CategoryMetricsDto[];
  countries: CountryMetricsDto[];
  prolificWriters: WriterStatsDto[];
  newWriters: WriterStatsDto[];
}

export interface TagListDto {
    tagId: string,
    name: string,
    slug: string,
    insightsCounter: number,
    talesCounter: number,
}

export interface CategoryMetricsDto {
    category: Category,
    insightsCounter: number,
    talesCounter: number,
}

export interface CountryMetricsDto {
    country: Country,
    insightsCounter: number,
    talesCounter: number,
}

export interface WriterStatsDto {
    creator: CreatorDto
    onboardedAt: string
    country: Country
}

export interface TagDetailDto {
    tagId: string,
    createdAt: string,
    lastUpdatedAt: string,
    name: string,
    slug: string,
    insightsCounter: number,
    talesCounter: number,
    totalCounts: number
}

export interface TagDraftDto {
  tagId: string; // Using string to handle backend Ulid representation
  name: string;
}

export interface TagListDto {
  name: string;
  slug: string;
}
