import type { Country, WriterStatus } from '@/utils/enumHelper'
import type { CreatorDto } from '@/features/identity/types/IdentityTypes'
import type { TaleLatestDto } from '@/features/tales/types/TalesTypes'


export interface WriterOnboardingRequest { 
    confirm: boolean; 
    country: Country | '-1'
}

export interface WriterListDto {
  creator: CreatorDto
  onboardedAt: string
  status: WriterStatus
  country: Country
  
  
  // 🎯 NATIVE JSON OBJECTS: No manual string manipulation required!
  latestTaleRaw: Record<string, any> | null 
  
  // Directly typed matching your computed backend property
  latestTale: TaleLatestDto | null 
}


export interface GetWriterListResponse {
  writers: WriterListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}