// src/features/profile/types/profile.types.ts
import type { Country, AccountStatus, ContactType } from '@/utils/enumHelper'
import { type Engageable, createDefaultUiState } from '@/features/engagements/types/EngagementTypes' // 🎯 Import your clean semantics
import { reactive } from 'vue';
import { APIError } from '@/api/apiTypes.ts'

export interface ContactDto {
  title: string
  type: ContactType
}

export interface GetMyProfileResponse {
  // 📋 Core Properties (Auto-hydrated from Server JSON payload)
  accountId: string;
  registeredAt : string
  username : string
  bio : string | null
  title : string
  photo : string | null
  country : Country | null
  status : AccountStatus
  moderationScore : number
  contacts : ContactDto[]
  
  insightsCount : number
  talesCount : number
  commentsCount : number
  viewsCount : number
  
  taleUpvotesCount : number
  insightUpvotesCount : number
  commentUpvotesCount : number
  taleDownvotesCount : number
  insightDownvotesCount : number
  commentDownvotesCount : number
  
  favoritersCount : number
  taleFavoritesCount : number
  insightFavoritesCount : number
  commentFavoritesCount : number
  
  taleSharesCount : number
  insightSharesCount : number
  followersCount : number
  followsCount : number
  favoritesCount : number

}

export interface UpdateContactRequest { 
    title: string; 
    ContactType: string; 
}

export interface UpdateProfileRequest { 
    title: string; 
    bio: string; 
    country: Country | '-1'
}

export interface ChangePasswordRequest { 
    oldPassword: string; 
    newPassword: string; 
    confirm: boolean
}

export interface CreatorDto {
  accountId: string
    username: string; 
    talesCount: number
  insightsCount: number
  commentsCount: number
    engagement: Engageable | any
}

export interface UserDto {
  accountId: string
  username: string; 
  engagement: Engageable | any
}

export interface GetUserProfileResponse {
    
  accountId: string;
  registeredAt : string
  username : string
  bio : string | null
  title : string
  photo : string | null
  country : Country | null
  contacts : ContactDto[]
  
  insightsCount : number
  talesCount : number
  commentsCount : number
  viewsCount : number
  
  taleUpvotesCount : number
  insightUpvotesCount : number
  commentUpvotesCount : number
  
  followersCount : number
  followsCount : number

  user: UserDto

}

export function initializeAccountEngagement(rawAccount: any): CreatorDto {

  return {
    // 1. Spread out the primitive core values from the network line safely
    ...rawAccount,
    
    // 2. Explicitly map your rich nested engagement graph
    engagement: {
      contentId: rawAccount.accountId,
      contentType: 'Account',
      commentsCount: rawAccount.commentsCount || 0,
      isFavorite: false,
      isEngagementLoaded: false,
      
      // ⚡ Pre-initialize the reactive UI state immediately on arrival
      uiState: reactive(createDefaultUiState())
    }
  };
}

export function initializeUserEngagement(rawAccount: any): UserDto {

  return {
    // 1. Spread out the primitive core values from the network line safely
    ...rawAccount,
    
    // 2. Explicitly map your rich nested engagement graph
    engagement: {
      contentId: rawAccount.accountId,
      contentType: 'Account',
      isFavorite: false,
      isEngagementLoaded: false,
      
      // ⚡ Pre-initialize the reactive UI state immediately on arrival
      uiState: reactive(createDefaultUiState())
    }
  };
}

export interface UserListDto {
  accountId: string;
  username: string;
  country: Country | null;
  registeredAt: string;
  photo: string;
  title: string;
  talesCount: number;
  followsCount: number;
  engagement: Engageable;
}

export interface GetUserListResponse {
  users: UserListDto[];
  hasNext: boolean;
  anchor: string | null;
  pointer: string | null; 
}

export function initializeUserListEngagement(rawAccount: any): UserListDto {

  return {
    // 1. Spread out the primitive core values from the network line safely
    ...rawAccount,
    
    // 2. Explicitly map your rich nested engagement graph
    engagement: {
      contentId: rawAccount.accountId,
      contentType: 'Account',
      favoritesCount: rawAccount.followersCount || 0,
      commentsCount: rawAccount.commentsCount || 0,
      insightsCount: rawAccount.insightsCount || 0,
      isFavorite: false,
      isEngagementLoaded: false,
      
      // ⚡ Pre-initialize the reactive UI state immediately on arrival
      uiState: reactive(createDefaultUiState())
    }
  };
}


export interface UpdatePhotoRequest {
  base64String: string;
  contentType: string;
}
