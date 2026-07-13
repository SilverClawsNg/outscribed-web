// src/stores/profileStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAsync } from '@/api/apiGetServices'
import { postAsync } from '@/api/apiPostServices'

import { type GetMyProfileResponse } from '@/features/identity/types/IdentityTypes'
import { type ContactType } from '@/utils/enumHelper.ts'
import type { ContactDto, UpdateProfileRequest, ChangePasswordRequest, UpdatePhotoRequest } from '../types/IdentityTypes.ts'
import { APIError } from '@/api/apiTypes.ts'

export const useProfileStore = defineStore('profile', () => {

  // --- 🛑 STATE ---
  const profile = ref<GetMyProfileResponse | null>(null)

  const uploadStatus = ref<string | null>(null) // 'Loading' | 'Uploaded' | 'Error' | null
  const uploadError = ref<string | null>(null)

  // 🔒 Keep the controller private/local to this store context
  let feedController: AbortController | null = null;

  
// --- 👥 SOCIAL CONTACT LOOKUPS ---
const facebook = computed(() => profile.value?.contacts?.find(c => c.type === 'Facebook')?.title || null)
const facebookLink = computed(() => `https://facebook.com/${facebook.value || ''}`)

const twitter = computed(() => profile.value?.contacts?.find(c => c.type === 'Twitter')?.title || null)
const twitterLink = computed(() => `https://twitter.com/${twitter.value || ''}`)

const linkedin = computed(() => profile.value?.contacts?.find(c => c.type === 'LinkedIn')?.title || null)
const linkedinLink = computed(() => `https://linkedin.com/in/${linkedin.value || ''}`)

const email = computed(() => profile.value?.contacts?.find(c => c.type === 'Email')?.title || null)

// Inside src/stores/profileStore.ts

  // --- ⚡ ACTIONS (Centralized State Operations) ---

  /**
   * 🔄 Fetches the master profile parameters from the backend monolith
   */
  async function loadMyProfile() {

try{
  
       // Spawn a fresh controller instance for this specific execution pass
        feedController = new AbortController();

    const outcome = await getAsync<GetMyProfileResponse>('api/identity/profile', true, {} as GetMyProfileResponse,
      feedController.signal
    )

     if (outcome.isFailure) {
      return { success: false, error: outcome.error || null }
    }

    // Inside profileStore.ts fallback block
    if (!outcome.value) {
      
      // 🎯 Instantiate your exact class blueprint with matching parameters
      const error = new APIError(
        404,
        'Not Found!',
        'Sorry. No profile was found for current user.',
        'Identity.ProfileNotFound'
      )
      
          return { success: false, error: error }
    }

  // Happy Path
  profile.value = outcome.value
        return { success: true, error: null }
} catch (err: any) {
    // Fail-safe catch-all wrapper
    return { 
      success: false, 
      error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
    };
  }


  }


  /**
   * 📸 COMMAND: Upload and change user's display avatar
   */
  async function uploadProfilePhoto(payload: UpdatePhotoRequest) {

    uploadStatus.value = "Loading"
    const outcome = await postAsync<{ photoUrl: string }>('/api/profiles/photo', payload,  true)

  if (outcome.isFailure) {
    if (!outcome.error) {
      uploadError.value = 'Unknown error occurred while uploading photo. Refresh page and try again.'
    } else {
      if (outcome.error.status === 401) {
        uploadError.value = 'It appears you have been logged out. Re-Login to continue.'
      } else {
        uploadError.value = outcome.error.detail || 'An error occurred uploading photo.'
      }
    }
    uploadStatus.value = null
    // 🧱 THE FIX: Tell the UI that both auth initialization and profile loading are done
    return
  }

  if (outcome.isSuccess && outcome.value?.photoUrl) {
      if (profile.value) {
        // 🎯 Update state instantly on success
        profile.value.photo = outcome.value.photoUrl
        uploadStatus.value = null
      }
    }

    return // Return result down to component to let it route closing/UI states
  }
  

  /**
   * 📸 COMMAND: Upload and change user's display avatar
   */
  async function updateContactState(newTitle: string) {

const formData = {
    title: newTitle,
    contactType: activeContactType.value
  }
    const outcome = await postAsync<{ photoUrl: string }>('/api/contacts/update', formData,  true)

 if (outcome.isFailure) {
      return { success: false, error: outcome.error || null }
    }

  if(profile.value && activeContactDto.value && newTitle){

      if (activeContactDto) {
        activeContactDto.value.title = newTitle
      } else {
        profile.value.contacts.push({ 
          type: activeContactType.value, 
          title: newTitle 
        } as ContactDto)
      }

  }

      return { success: true, error: null }
  }


  /**
   * 📸 COMMAND: Upload and change user's display avatar
   */
  async function UpdateProfileState(formData: UpdateProfileRequest) {

    const outcome = await postAsync<{ photoUrl: string }>('/api/profile/update', formData,  true)

 if (outcome.isFailure) {
      return { success: false, error: outcome.error || null }
    }

  if(profile.value && formData){

    if(formData.bio){
    profile.value.bio = formData.bio
    }

     if(formData.title){
    profile.value.title = formData.title
    }


     if(formData.country && formData.country != '-1'){
    profile.value.country = formData.country
    }

  }

      return { success: true, error: null }
  }


const statusClass = computed(() => {
  switch (profile.value?.status) {
    case 'Active': return 'info'
    case 'HiddenByModeration':
    case 'SuspendedByAdmin': return 'warning'
    case 'BannedByAdmin': return 'danger'
    default: return 'info'
  }
})

// 🎯 THE STRATEGY ACTIVE TRACKER: Context lives directly in the domain layer
  const activeContactType = ref<ContactType | null>(null)

  /**
   * 🔍 DERIVED STATE: Computes the precise working DTO based on the active type token
   */
  const activeContactDto = computed<ContactDto | null>(() => {
    if (!profile.value || !activeContactType.value) return null
    return profile.value.contacts.find(c => c.type === activeContactType.value) || null
  })

  /**
   * 🏗️ CONTEXT SETTER: Call this immediately before launching your modal layout
   */
  function setActiveContact(type: ContactType) {
    activeContactType.value = type
  }

  function clearActiveContext() {
    activeContactType.value = null
  }

   function abort() {
    if (feedController) {
      feedController.abort();
      feedController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
  }

 
  return {
    profile,
    facebook,
    twitter,
    linkedin,
    email,
    facebookLink,
    twitterLink,
    linkedinLink,
    
    statusClass,
    uploadError,
    uploadStatus,
    activeContactType,
    activeContactDto, // 🚀 Modals can listen straight to this
    abort,
    loadMyProfile,
    uploadProfilePhoto,
    updateContactState,
    UpdateProfileState,
    setActiveContact,
    clearActiveContext
  }
})