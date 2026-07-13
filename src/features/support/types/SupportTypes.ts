import type { FaqCategory, VoteType } from '@/utils/enumHelper'

export interface FaqListDto {
  faqId: string
  onboardedAt: string
  category: FaqCategory
  question: string
  answer: string
  lastUpdatedAt: string

  hasVoted: boolean | false
}

export interface GetFaqListResponse {
  faqs: FaqListDto[];
}

export interface VoteRequest {
  faqId: string;
  voteType: VoteType;
}

export interface AskQuestionRequest {
  question: string;
  emailAddress: string;
}