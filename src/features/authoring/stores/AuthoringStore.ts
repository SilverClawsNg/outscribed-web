import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import type { WriterOnboardingRequest } from '../types/AuthoringTypes'
import { postAsync } from '@/api/apiPostServices'
import { APIError } from '@/api/apiTypes'

export const useAuthoringStore = defineStore('authoring', () => {
  const authStore = useAuthStore()

  // 🎯 CORE ONBOARDING TRANSIENT VARIABLES
  const structureAcknowledged = ref(false)
  const liabilityAcknowledged = ref(false)

  // 🎯 C# IsFullyCertified EQUIVALENT
  const isFullyCertified = computed(() => {
    return structureAcknowledged.value && liabilityAcknowledged.value
  })

  // RESET FUNCTION (Call when initializing the onboarding wizard)
  function resetOnboardingState() {
    structureAcknowledged.value = false
    liabilityAcknowledged.value = false
  }

  // 🔒 Keep the controller private/local to this store context
  let abortController: AbortController | null = null;

  /**
   * 🚀 DISPATCH COMPLETED ONBOARDING MUTATION TO BACKEND
   */
  async function submitWriterOnboarding(formData: WriterOnboardingRequest): Promise<{ success: boolean; error: APIError | null }> {
    // Replace this block with your actual postAsync endpoint network layout call
    try {
      console.log('[Authoring Engine]: Sending certification blueprint payload to server...')

      const outcome = await postAsync('/api/authoring/onboard', formData, true)

      // Consideration 1: Check if any error and immediately return to caller
      if (outcome.isFailure) {
        return { success: false, error: outcome.error || null };
      }

      // 🟢 CRITICAL SUCCESS STEP: Directly update the parent authStore in memory!
      //authStore.writerStatus = 'Active'
      authStore.setWriterActive()

      // Success! The caller handles toggling its loading state and grabbing data from the store reactively.
    return { success: true, error: null };
      
    } catch (err: any) {
    // Fail-safe catch-all wrapper
    return { 
      success: false, 
      error: err?.error || new APIError(500, 'Internal Client Error', err.message || 'An unexpected error occurred.') 
    };
  }
  }

  function abort() {
    if (abortController) {
      abortController.abort();
      abortController = null;
      console.log('[Store]: Requests successfully canceled.');
    }
  }

  return {
    structureAcknowledged,
    liabilityAcknowledged,
    isFullyCertified,
    abort,
    resetOnboardingState,
    submitWriterOnboarding
  }
})