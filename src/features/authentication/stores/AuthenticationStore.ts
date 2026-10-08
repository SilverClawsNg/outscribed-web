import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApiClient from '@/api/apiClient'
import apiClient from '@/api/apiClient'

import { postAsync } from '@/api/apiPostServices'
import { getAsync } from '@/api/apiGetServices'

import type { Result } from '@/api/apiTypes'
import { APIError } from '@/api/apiTypes'

import type { WriterStatus } from '@/utils/enumHelper'
import { setLoginHint, clearLoginHint, checkIsLoggedIn, clearByPatterns } from '@/utils/authHelper'
import type { AuthenticationSessionResponse, LoginRequest, ReserveResponse,
    SendTokenRequest, LogoutRequest, ChangePasswordRequest, ResetPasswordRequest
 } from '../types/AuthenticationTypes'


export const useAuthenticationStore = defineStore('authStore', () => {

    // --- Initialize Variables ---

     const accessToken = ref<string | null>(null)
     const expiryDate = ref<Date | null>(null)
     const userId = ref<string | null>(null)
     const username = ref<string | null>(null)
     const writerStatus = ref<WriterStatus | null>(null)
     let activeRefreshPromise: Promise<string | null> | null = null
     const hasAccessToken = computed<boolean>(() => !!accessToken.value)

    // --- Sets Access Token ---
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

    // --- Unsets Access Token ---
     function unsetAccessToken() {
            accessToken.value = null
            expiryDate.value = null
            userId.value = null
            username.value = null
            writerStatus.value = 'None'
            localStorage.removeItem('outscribed_user_hint')
            clearLoginHint() // 📣 Broadcast change instantly to all components
    }   

    // --- Gets Access Token ---
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

    // --- Executes Silent Refresh ---
    async function executeSilentRefresh(): Promise<{ token: string | null; status: number }> {
    
        activeRefreshPromise = (async () => {
        
        try {

        const response = await authApiClient.post<AuthenticationSessionResponse>('/api/token/refresh', {});

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

    // --- Check Authentication Status ---
     function checkAuthentication(): boolean {
        // 1. If local storage hint is missing, user is definitely logged out
        if (!checkIsLoggedIn()) {
        return false;
        }

        // 2. Verify token presence and non-expired state in memory
        const bufferWindowMs = 5000; // 5-second buffer check
        const isTokenValid = 
        !!accessToken.value && 
        !!expiryDate.value && 
        (Date.now() + bufferWindowMs < expiryDate.value.getTime());

        return isTokenValid;
    }

    // --- Verify Writing Status ---
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

    // --- Login User ---
    async function login(formData: LoginRequest): Promise<Result<string>> {

        // 1. Post to the backend endpoint getting the raw AuthenticationSessionResponse
        const outcome = await postAsync<AuthenticationSessionResponse, any>('/api/login', formData, false)
        
        // 🎯 CASE 1: The network layer or error mapper caught a classic failure (e.g., HTTP 400/500/Timeout)
        if (outcome.isFailure || !outcome.value?.isSuccessful ) {
            return {
            value: null,
            error: outcome.error || new APIError(400, 'Authentication Failed', 'Invalid email address or password combination.'),
            isFailure: true,
            isSuccess: false
            }
        }

         // 🎯 CASE 2: Account is unverified. Returns the verificationId to allow token send
        if(outcome.value.verificationId){

            return {
            value: outcome.value.verificationId,
            error: null,
            isFailure: false,
            isSuccess: true
            }
            }

        // 🎯 CASE 3: The endpoint hit HTTP 200, but identity domain rules failed (e.g., wrong password)
        if (!outcome.value?.accessToken) {
            return {
            value: null,
            error: new APIError(400, 'Authentication Failed', 'Unknown error occured.'),
            isFailure: true,
            isSuccess: false
            }
        }

        // 🎯 CASE 3: Clean path success! Store intercepts the token, saves it, and converts T to boolean
        setAccessToken(outcome.value.accessToken)
        
        //set the current user
        handleAuthStorageTransition(formData.username)

        return {
            value: null,
            error: null,
            isFailure: false,
            isSuccess: true
        }
    }

    // --- Set Current User in Local Storage ---
    function handleAuthStorageTransition(newUsername: string) {
        const canonicalNewUser = newUsername.trim().toLowerCase();
        const currentOwner = (localStorage.getItem('outsCribed:owner') || '').toLowerCase();

        // 1. Returning Same User: Preserve drafts & anchors
        if (currentOwner === canonicalNewUser) {
            console.log(`[Storage] Session restored for: ${canonicalNewUser}`);
            return;
        }

        // 2. Account Switch or New Registration: Full Purge
        console.log(`[Storage] Purging storage for new session (${currentOwner || 'none'} -> ${canonicalNewUser})`);
        
        clearByPatterns([
            // 1. Purge all offline draft contents
            'tale:draft', 
            'insight:draft', 
            'comment:draft',

            // 2. Purge all pagination anchors (covers base, favorites, upvotes, flags, etc.)
            'tale:anchor', 
            'insight:anchor', 
            'comment:anchor',
            'timeline:anchor',

            // 3. Purge user network anchors
            'user:anchor'
        ]);

        localStorage.setItem('OutScribed:owner', canonicalNewUser);
    }

    // --- Reserve Account ---
    async function reserveAccount(formData: any): Promise<Result<string>> {

        const outcome = await postAsync<ReserveResponse, any>('/api/reserve', formData, false)

        if (outcome.isFailure || !outcome.value) {
            return {
            value: null,
            error: outcome.error || new APIError(400, 'Registration Failed', 'Could not complete registration process.'),
            isFailure: true,
            isSuccess: false
            }
        }

        return {
            value: outcome.value?.verificationId,
            error: null,
            isFailure: false,
            isSuccess: true
            }

    }

    // --- Verify Account - Polled After Third Party Auth Started ---
    async function verifyAccount(formData: any): Promise<Result<boolean>> {

    const outcome = await postAsync<AuthenticationSessionResponse, any>('/api/verify', formData, false)

    if (outcome.isFailure || !outcome.value?.isSuccessful) {
        return {
        value: null,
        error: outcome.error || new APIError(400, 'Verification Failed', 'Could not complete verification process.'),
        isFailure: true,
        isSuccess: false
        }
    }

    // Provider has not set email yet
        if(!outcome.value.accessToken){

            return {
            value: false,
            error: null,
            isFailure: false,
            isSuccess: true
            }
        }

    // Store saves token locally
    setAccessToken(outcome.value.accessToken)

    //set the current user
    handleAuthStorageTransition(formData.username)

    return {
        value: true,
        error: null,
        isFailure: false,
        isSuccess: true
    }
    }

    // --- Register Account - Using Token ---
    async function registerAccount(formData: any): Promise<Result<boolean>> {

        const outcome = await postAsync<AuthenticationSessionResponse, any>('/api/access', formData, false)

        if (outcome.isFailure || !outcome.value?.isSuccessful || !outcome.value?.accessToken) {
            return {
            value: null,
            error: outcome.error || new APIError(400, 'Registration Failed', 'Could not complete registration process.'),
            isFailure: true,
            isSuccess: false
            }
        }

        // Store saves token locally
        setAccessToken(outcome.value.accessToken)

        //set the current user
        handleAuthStorageTransition(formData.username)

        return {
            value: true,
            error: null,
            isFailure: false,
            isSuccess: true
        }
    }

    // --- Send Verification Token ---
    async function sendToken(formData: SendTokenRequest): Promise<Result<boolean>> {
    
        const outcome = await postAsync('/api/token', formData, false)

        if (outcome.isFailure) {
            return {
            value: null,
            error: outcome.error || new APIError(400, 'Token Send Failed', 'Could not send verification token.'),
            isFailure: true,
            isSuccess: false
            }
        }

        return {
            value: null,
            error: null,
            isFailure: false,
            isSuccess: true
        }

    }

    // --- Resets password ---
    async function resetPassword(formData: ResetPasswordRequest) {
    
        const outcome = await postAsync<boolean>('/api/password/reset', formData, false)

         if (outcome.isFailure || !outcome.value) {
            return {
            value: null,
            error: outcome.error || new APIError(400, 'Registration Failed', 'Could not complete registration process.'),
            isFailure: true,
            isSuccess: false
            }
        }

         return {
            value: true,
            error: null,
            isFailure: false,
            isSuccess: true
        }
    }

    // --- Log user out ---
    function logout(logoutData: LogoutRequest): void {

        // Destructure `flushCache` out, gathering all backend-expected properties into `payload`
        const { flushCache, ...payload } = logoutData;

        apiClient.post('/api/logout', payload, {
        meta: { requiresAuth: false } 
        }).catch(err => console.error('[Auth Store]: Remote session revocation drop failure:', err))
        
        // 2. Clear the persistent user hint from disk and reactive memory
        unsetAccessToken() // Clears state, disk tracking, and signals helper [cite: 71]
        if(logoutData.flushCache){

        if (flushCache) {
        clearByPatterns([
            // 1. Purge all offline draft contents
            'tale:draft', 
            'insight:draft', 
            'comment:draft',

            // 2. Purge all pagination anchors (covers base, favorites, upvotes, flags, etc.)
            'tale:anchor', 
            'insight:anchor', 
            'comment:anchor',
            'timeline:anchor',

            // 3. Purge user network anchors
            'user:anchor'
        ]);
        }
        }

    }

    // --- Set writer active - After onboarding in authoring ---
    function setWriterActive() {
        
        console.log(`🎯 [Auth Store]: Synchronizing WriterStatus memory footprint -> ${status}`)
        writerStatus.value = 'Active'
    }

    // --- Change Password ---
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
        checkAuthentication,
        setWriterActive,
        getAccessToken,
        login,
        registerAccount,
        logout,
        changePassword,
        verifyAuthoring,
        sendToken,
        reserveAccount,
        verifyAccount,
        resetPassword
    }

})