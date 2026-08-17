<script setup lang="ts">

// --- IMPORT ---
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import ProfileComponent from '../components/ProfileComponent.vue'
import { useProfileStore } from '../stores/ProfileStore.ts' // 🚀 Import Profile Store
import { APIError } from '@/api/apiTypes.ts'
import { useLoginHint } from '@/utils/authHelper'
import { useModalStore } from '@/stores/modalStore';
import { type AccountStatus} from '@/utils/enumHelper.ts'
import { AccountStatusDescriptions } from '@/utils/descriptors'
import SvgIcons from '@/components/SvgIcons.vue'

// --- INITIALIZE STORES ---
const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()
const modalStore = useModalStore();

// --- DEFINE & INITALIZE LOCAL VARIABLES ---
const loadingError = ref<APIError | null>(null)
const isLoading = ref<boolean>(true);
const accountStatus = ref<AccountStatus>('Active');

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
  
  const { error, status } = await profileStore.getAccountStatus()

  if (error) {
    loadingError.value = error
  }

  //No matter the result, stop loading
  isLoading.value = false
  accountStatus.value = status || 'Active' // Default to 'Active' if status is undefined

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

     <template v-else-if="accountStatus">
    
    
  <div class="page-status-message-container">

    <div class="page-status-message">

      <template  v-if="accountStatus === 'Active'">

       <SvgIcons name="check" />

      </template>

      <template  v-else>

       <SvgIcons name="broken-chain" />

      </template>

      <h1> {{ AccountStatusDescriptions[accountStatus] }}</h1>
      
      <template v-if="accountStatus === 'Active'">
       <p class="alt">Your profile is currently active. No further action is required.</p>
       <div class="actions">
        <RouterLink to="/profile" title="Profile" >Continue to profile</RouterLink>
      </div>
      </template>

       <template v-else-if="accountStatus === 'SelfArchived'">
         <p class="alt">Your profile is currently <strong>self archived</strong>.</p>
         <p class="alt">Your past published work remains accessible on OutScribed, but your profile page is hidden. You can restore your profile and publishing privileges. To continue, click the link below</p>
       <div class="actions">
        <button 
              class="btn primary"
              aria-label="Unarchive Profile"
              title="Unarchive"
                @click="modalStore.push('UnarchiveProfile', 'Unarchive Profile')"
            >
             Unarchive Profile
            </button>
      </div>
      </template>

       <template v-else-if="accountStatus === 'HiddenByModeration'">
       <p class="alt">Your account is currently marked as <strong>hidden by community moderation</strong> due to community flags or ongoing automated checks.</p>
       <p class="alt">While under review, your profile is hidden and publishing new content is temporarily disabled. Checks usually resolve automatically or after admin inspection.</p>
      </template>

        <template v-else-if="accountStatus === 'SuspendedByAdmin'">
        <p class="alt">Your account has been <strong>suspended by administrative action</strong>.</p>
        <p class="alt">Publishing privileges have been paused. If you believe this action was taken in error, you may file an appeal with support. To continue, click the link below</p>
        <button 
              class="btn primary"
              aria-label="Appeal Suspension"
              title="Appeal Suspension"
                @click="modalStore.push('AppealSuspension', 'Appeal Suspension')"
            >
             Appeal Suspension
            </button>
      </template>

       <template v-else-if="accountStatus === 'BannedByAdmin'">
       <p class="alt">Your account is currently <strong>banned by administrative action</strong>.</p>
       <p class="alt">Publishing privileges have been permanently revoked. You may continue browsing OutScribed as a reader, but you can no longer publish or interact on the platform.</p> 
       </template>

    </div>

  </div>

    </template>

    <template v-else>
     <PageStatusMessage
         title='Unknown Error'
        message="An unknown error occured loading profile. Refresh page and try again.">
      </PageStatusMessage>
    </template>

</template>

<style lang="less" scoped>
   @import "@/assets/css/page-status-message.less";
</style>