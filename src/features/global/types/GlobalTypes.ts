import type { ContentType, ActivityType } from '@/utils/enumHelper' // 🎯 Import your clean semantics
import { type TaleListDto } from '@/features/tales/types/TalesTypes' // 🎯 Import your clean semantics
import { type InsightListDto } from '@/features/insights/types/InsightsTypes' // 🎯 Import your clean semantics

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
  trendingThisWeek: TagDetailDto[];
  trendingThisMonth: TagDetailDto[];
  trendingThisYear: TagDetailDto[];
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