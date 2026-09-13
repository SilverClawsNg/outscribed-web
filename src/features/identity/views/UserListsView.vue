<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, computed, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useUserListStore } from '../stores/UserListStore'; 
import { useUserListFilterStore } from '../stores/UserListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import UserListComponent from '../components/UserListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import InfiniteScroller from '@/components/InfiniteScroller.vue'

// --- INITIALIZE STORES ---
const userStore = useUserListStore();
const userFilterStore = useUserListFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)

// --- ROUTE OPTIONS ---
const relationType = computed(() => ((route.params.relationType as string) || '').toLowerCase())
const creatorUsername = computed(() => route.params.creatorUsername as string || '')

const currentPath = encodeURIComponent(route.fullPath)

// --- Determine route validity ---
const isValidType = computed(() => {
  if (!relationType.value) return true // Base feed route
  return ['followers', 'follows'].includes(relationType.value)
})

// Authorized ONLY when viewing "My" relational feeds (has relationType, but no creatorUsername)
const isAuthorized = computed(() => Boolean(relationType.value) && !creatorUsername.value)

const apiUrl = computed(() => {
  if (!relationType.value && !creatorUsername.value) {
    return 'api/users'
  } 
  
  if (!isValidType.value) return ''
  
  return creatorUsername.value
    ? `api/users/${creatorUsername.value}/${relationType.value}`
    : `api/users/${relationType.value}`

})

const pageTitle = computed(() => {
  if (!relationType.value && !creatorUsername.value) {
    return 'Browse Users'
  }
  
  return creatorUsername.value
    ? `${creatorUsername.value}'s ${relationType.value}`
    : `My ${relationType.value}`
})

// --- Watch Route Changes ---
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (newPath === oldPath) return

    loadingError.value = null

    if (!isValidType.value) {
      router.push('/404')
      return
    }

    userFilterStore.setActiveType(
      'user',
      isAuthorized.value ? relationType.value : null
    )

    await initPage() // fetch only; apiUrl/pageTitle already correct
  },
  { immediate: true }
)
 

// --- DEFINE PAGE FUNCTIONS ---
function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [User Lists View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = userFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: userFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'userFilterStore'
  const cleanApiPath = userFilterStore.buildApiPath(apiUrl.value);

  // 2b. Set the base url for loadmore
  userStore.setBaseRoute(apiUrl.value)

  // 3. Fetch from store
  const { success, error } = await userStore.loadUsers(cleanApiPath, isAuthorized.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving drafts. Refresh page and try again.'
      );
  }
  }

  // No matter the result, stop loading
  isLoading.value = false

  // 3. ⏳ Late-Binding Personal Layer Hydration (Runs seamlessly in background)
  if (success) {
    await userStore.hydratePersonals(); 
  }
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

// inside your HomeView.vue
onUnmounted(() => {
  userStore.abort();
});

</script>

<template>
  
  <template v-if="isLoading">

    <div class="loader-container">
      <p class="loader"></p>
    </div>

  </template>

  <template v-else-if="loadingError">

    <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'"
       icon="warning"
      :is-standalone="true">
        <template v-if="loadingError.status == 401" #actions>
        <button class="btn primary" @click="redirectToLogin">Login</button>
      </template>
        <template v-else-if="loadingError.definition" #actions>
           <button class="btn primary" @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
    </PageStatusMessage>

  </template>

   <template v-else>
   
       <header class="page-header shared__container">
          <h1 class="page-header__title"  :class="{ at: creatorUsername }">
               {{ pageTitle }}
            </h1>
        <button class="btn primary" @click="modalStore.push('UserListFilter', 'Filter Lists')">Filter</button>
       </header>

       <template v-if="wasCleaned">
      <PageStatusMessage 
              title="Invalid Filters Removed!" 
              message="Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the filter button above to filter correctly."
              icon="warning" 
              :is-bordered="true"
            />
    </template>

  <template v-if="userStore.users && userStore.users.length > 0">

       <InfiniteScroller
        :has-next="userStore.hasNext"
        :is-fetching="userStore.isFetchingMore"
        :error="userStore.loadMoreError"
        @load-more="userStore.loadMoreUsers"
        @retry="userStore.loadMoreUsers">

        
  <div class="shared__container">

      <UserListComponent 
        v-for="user in userStore.users" 
        :key="user.accountId" 
        :user="user"/>

  </div>

       </InfiniteScroller>

  </template>

  <template v-else>
   <PageStatusMessage
      title="No User Found!"
      message="We did not find any user matching your search filters."
      icon="inbox"
      :is-standalone="true"
      />
  </template>
  </template>

</template>