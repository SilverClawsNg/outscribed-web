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
}