import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApiClient from '@/api/apiClient'
import apiClient from '@/api/apiClient'

import { mapToApiError } from '@/utils/errorMapper' // 🎯 Import our new mapper
import { postAsync } from '@/api/apiPostServices'
import type { Result } from '@/api/apiTypes'
import { APIError } from '@/api/apiTypes'
import type { ChangePasswordRequest } from '@/features/identity/types/IdentityTypes'
import type { WriterStatus } from '@/utils/enumHelper'
import { setLoginHint, clearLoginHint, checkIsLoggedIn, clearByPatterns } from '@/utils/authHelper'
import type { LoginRequest } from '@/features/gatekeeper/types/GatewayTypes'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const expiryDate = ref<Date | null>(null)
  const userId = ref<string | null>(null)
  const username = ref<string | null>(null)
  const writerStatus = ref<WriterStatus | null>(null)
  const isInitializing = ref(true)

  let activeRefreshPromise: Promise<string | null> | null = null
  
  const hasAccessToken = computed<boolean>(() => !!accessToken.value)
  /**
   * 🎯 CENTRALIZED SETTER / PARSER
   * Decodes incoming JWT token strings to extract standard claims and timestamps
   */
  function setAccessToken(tokenStr: string) {
    if (!tokenStr || tokenStr.trim() === '') return

    try {
      accessToken.value = tokenStr

      // JWT Structure: Header.Payload.Signature
      const base64Url = tokenStr.split('.')[1]
      if (!base64Url) return

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      const claims = JSON.parse(jsonPayload)
      console.log('[AuthStore] Raw Decoded Claims payload Matrix:', claims)

      // Map claims supporting both Microsoft XML URI definitions and clean JWT tokens
      username.value = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || claims["name"] || null
      userId.value = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || claims["sub"] || null
      writerStatus.value = claims["writerStatus"] || 'None'

      if (claims.exp) {
        expiryDate.value = new Date(claims.exp * 1000) // Convert unix seconds toJS Date milliseconds
      }

      setLoginHint() // 📣 Broadcast change instantly to all components
      console.log(`[AuthStore]: Parsed session. User: ${username.value}, ID: ${userId.value}, Status: ${writerStatus.value}`)

    } catch (error) {
      console.error('[AuthStore] Failed to safely unpack or parse incoming JWT token matrix:', error)
      unsetAccessToken()
    }
  }

  /**
   * 🎯 CENTRALIZED RESETTER
   */
  function unsetAccessToken() {
    accessToken.value = null
    expiryDate.value = null
    userId.value = null
    username.value = null
    writerStatus.value = 'None'
    localStorage.removeItem('outscribed_user_hint')
    clearLoginHint() // 📣 Broadcast change instantly to all components
  }

  /**
 * 🎯 PREEMPTIVE ACCESS GUARD
 * Evaluates token validity locally using strict Date checks before network transmission.
 * Resolves gracefully via inline token refresh if a session hint is present.
 */
async function getAccessToken(): Promise<{ token: string | null; status: number }> {
  const bufferWindowMs = 30000 // 30-second window to handle mid-transit expiry safely 

  // 1. FAST PATH: If token exists and is comfortably alive, return it instantly 
  if (accessToken.value && expiryDate.value && (Date.now() + bufferWindowMs < expiryDate.value.getTime())) {
    return { token: accessToken.value, status: 200 } // 
  }

  // 2. BLOCKED PATH: Guard against missing hints immediately using our isolated helper authority 
  if (!checkIsLoggedIn()) {
    return { token: null, status: 401 } // 
  }

  // 3. CONCURRENT PATH: If a background refresh is already mid-transit, reuse its active promise [cite: 55, 58]
  if (activeRefreshPromise) {
    const token = await activeRefreshPromise // [cite: 56]
    return token ? { token, status: 200 } : { token: null, status: 401 } // [cite: 57]
  }

  // 4. FALLBACK PATH: Execute the silent refresh workflow inline 
  return await executeSilentRefresh() // 
}


async function executeSilentRefresh(): Promise<{ token: string | null; status: number }> {
  activeRefreshPromise = (async () => {
    
    try {
    const response = await authApiClient.post<AuthEnvelopeResponse>('/api/token/refresh', {});
//const response = await authApiClient.post<AuthEnvelopeResponse>('/api/token/refresh', {}, {
 // meta: { requiresAuth: false } 
//})

      // 🎯 Inspect your identity system's specific isSuccessful flag
      if (response.status === 200 && response.data?.isSuccessful && response.data?.accessToken) {
        setAccessToken(response.data.accessToken)
        return response.data.accessToken
      }
    } catch (err) {
      console.error('[Auth Store]: Background refresh token execution failed.', err)
    }
    return null
  })().finally(() => {
    activeRefreshPromise = null
  })

  const resultToken = await activeRefreshPromise
  if (resultToken) {
    return { token: resultToken, status: 200 }
  } else {
    unsetAccessToken()
    return { token: null, status: 401 }
  }
}
  /**
   * 🎯 PREEMPTIVE ACCESS GUARD
   * Evaluates token validity locally using your strict Date checks before network transmission
   */
 async function verifyAuthoring(): Promise<boolean> {
  // 1. Check the isolated, synchronous helper authority
  const hasHint = checkIsLoggedIn()

  // 💥 Rule 1: No hint means you are unauthenticated instantly. No waiting.
  if (!hasHint) {
    console.warn('🔒 [Auth Store]: Access denied. No local user hint present.')
    unsetAccessToken() 
    return false
  }

  // 🔄 Rule 2: If the hint exists but the in-memory token is gone, execute refresh
  if (!accessToken.value) {
    console.log('🔄 [Auth Store]: Token missing but hint exists. Initiating silent refresh context...')
    const refreshResult = await executeSilentRefresh()
    
    // Only pass them through if the background token swap actually succeeded
    return refreshResult.status === 200 && refreshResult.token !== null
  }

  // 🛡️ Rule 3: Valid hint and ready memory token are both present
  return true
}
  // 🎯 Contract for the specific identity wrapper returned by these endpoints
interface AuthEnvelopeResponse {
  isSuccessful: boolean
  accessToken: string | null
}

/**
 * 🎯 SILENT BACKGROUND REFRESH
 * Intercepts expired request tokens inline. Uses raw apiClient to avoid circular dependencies.
 */

/**
 * 🎯 LOGIN HANDLER
 * View handles it as: const outcome = await authStore.login(credentials)
 * Expected return: Result<boolean>
 */
async function login(formData: LoginRequest): Promise<Result<boolean>> {
  // 1. Post to the backend endpoint getting the raw AuthEnvelopeResponse
  const outcome = await postAsync<AuthEnvelopeResponse, any>('/api/login', formData, false)
  
  // 🎯 CASE 1: The network layer or error mapper caught a classic failure (e.g., HTTP 400/500/Timeout)
  if (outcome.isFailure) {
    return {
      value: false,
      error: outcome.error,
      isFailure: true,
      isSuccess: false
    }
  }

  // 🎯 CASE 2: The endpoint hit HTTP 200, but identity domain rules failed (e.g., wrong password)
  if (!outcome.value?.isSuccessful || !outcome.value?.accessToken) {
    return {
      value: false,
      error: outcome.error || new APIError(400, 'Authentication Failed', 'Invalid email address or password combination.'),
      isFailure: true,
      isSuccess: false
    }
  }

  // 🎯 CASE 3: Clean path success! Store intercepts the token, saves it, and converts T to boolean
  setAccessToken(outcome.value.accessToken)
  
  return {
    value: true,
    error: null,
    isFailure: false,
    isSuccess: true
  }
}

/**
 * 🎯 CREATE ACCESS (Registration Validation) HANDLER
 * Expected return: Result<boolean>
 */
async function createAccess(formData: any): Promise<Result<boolean>> {
  const outcome = await postAsync<AuthEnvelopeResponse, any>('/api/access', formData, false)

  if (outcome.isFailure) {
    return {
      value: null,
      error: outcome.error,
      isFailure: true,
      isSuccess: false
    }
  }

  if (!outcome.value?.isSuccessful || !outcome.value?.accessToken) {
    return {
      value: null,
      error: outcome.error || new APIError(400, 'Registration Failed', 'Could not complete registration process.'),
      isFailure: true,
      isSuccess: false
    }
  }

  // Store saves token locally
  setAccessToken(outcome.value.accessToken)

  return {
    value: true,
    error: null,
    isFailure: false,
    isSuccess: true
  }
}

function logout(logoutData: any): void {

 apiClient.post('/api/logout', logoutData, {
  meta: { requiresAuth: false } 
}).catch(err => console.error('[Auth Store]: Remote session revocation drop failure:', err))
  
// 2. Clear the persistent user hint from disk and reactive memory
 unsetAccessToken() // Clears state, disk tracking, and signals helper [cite: 71]
  clearByPatterns(['tale:draft', 'insight:draft', 'comment:draft'])
}

/**
   * 🛡️ SAFE WRITER STATUS MUTATOR
   * Directly updates frontend memory to synchronize UI layers immediately.
   */
  function setWriterActive() {
    
    console.log(`🎯 [Auth Store]: Synchronizing WriterStatus memory footprint -> ${status}`)
    writerStatus.value = 'Active'
  }

/**
   * 🔒 POST-PASSWORD CHANGE CLEANUP
   * Executes a complete identity wipe across the browser tab context.
   */
  async function changePassword(formdata: ChangePasswordRequest) {
    console.warn('🔒 [Auth Store]: Password change detected. Invalidating all local session vectors...')

// 1. Post to the backend endpoint getting the raw AuthEnvelopeResponse
  const outcome = await postAsync('/api/password/change', formdata, true)
  
  // 🎯 CASE 1: The network layer or error mapper caught a classic failure (e.g., HTTP 400/500/Timeout)
  if (outcome.isFailure) {
    return {
      value: false,
      error: outcome.error,
      isFailure: true,
      isSuccess: false
    }
  }

     unsetAccessToken()

    // 3. Force a clean, non-cached redirection straight to the login screen
    // Using window.location instead of router.push ensures a clean app state flush
    window.location.href = '/login'
  }

  return {
    accessToken,
    expiryDate,
    userId,
    username,
    writerStatus,
    hasAccessToken,
    setWriterActive,
    getAccessToken,
    login,
    createAccess,
    logout,
    changePassword,
    verifyAuthoring
  }
})