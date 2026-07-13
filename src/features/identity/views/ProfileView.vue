<script setup lang="ts">

// --- IMPORT ---
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import ProfileComponent from '../components/ProfileComponent.vue'
import { useProfileStore } from '../stores/ProfileStore' // 🚀 Import Profile Store
import { APIError } from '@/api/apiTypes.ts'
import { useLoginHint } from '@/utils/authHelper'

// --- INITIALIZE STORES ---
const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()

// --- DEFINE & INITALIZE LOCAL VARIABLES ---
const loadingError = ref<APIError | null>(null)
const isLoading = ref<boolean>(true);
const currentPath = encodeURIComponent(route.fullPath)

// --- CHECK USER'S AUTHENTICATION HINT STATUS ---
const isLoggedIn = useLoginHint()

// --- DEFINE PAGE FUNCTIONS ---
function redirectToLogin() {router.push(`/login?returnUrl=${currentPath}`)}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // If there's no login hint in the browser, don't even bother trying to fetch data
  if (!isLoggedIn.value) return

  console.log('🚀 [Profile View]: Presence verified via hint. Dispatching data fetch...')
  
  const { error } = await profileStore.loadMyProfile()

  if (error) {
    loadingError.value = error
  }

  //No matter the result, stop loading
  isLoading.value = false

}

// --- MOUNT PAGE ---
onMounted(async () => {
  initPage();
})


// inside your HomeView.vue
onUnmounted(() => {
  profileStore.abort();
});

</script>

<template>
 
    <template v-if="!isLoggedIn">
      <PageStatusMessage 
        title="401: Unauthorized!" 
        message="It appears you are not logged in or have been logged out. Login to continue to the timeline">
        <template #actions>
          <button class="btn primary" @click="redirectToLogin">Login</button>
        </template>
      </PageStatusMessage>
    </template>
    
    <template v-else-if="isLoading">
      <div class="loader-container">
        <p class="loader"></p>
      </div>
    </template>

    <template v-else-if="loadingError">
      <PageStatusMessage 
        :title="loadingError.title" 
        :message="loadingError.detail">
        <template v-if="loadingError.status === 401" #actions>
          <button class="btn primary" @click="redirectToLogin">Login</button>
        </template>
      </PageStatusMessage>
    </template>

    <template v-else-if="profileStore.profile">
      <ProfileComponent />
    </template>

    <template v-else>
     <PageStatusMessage
         title='000: Error'
        message="An unknown error occured loading profile. Refresh page and try again.">
      </PageStatusMessage>
    </template>

</template>
