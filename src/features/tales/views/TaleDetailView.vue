<script setup lang="ts">

// --- IMPORTS ---
import { computed, onMounted, ref, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageStatusMessage from '@/components/PageStatusMessage.vue';
import TaleDetailComponent from '../components/TaleDetailComponent.vue'
import { useTaleDetailStore } from '../stores/TaleDetailStore'; 
import { APIError } from '@/api/apiTypes.ts'
import { generateTitleSlug } from '@/utils/urlSlugGenerator';
import { useLoginHint } from '@/utils/authHelper'

// --- INITIALIZE STORES ---
const taleStore = useTaleDetailStore();
const route = useRoute();
const router = useRouter();

// --- DEFINE & INITALIZE LOCAL VARIABLES ---
const loadingError = ref<APIError | null>(null)
const isLoading = ref<boolean>(true);
const isUnauthorized = ref<boolean>(false) // 🎯 Introduce an explicit state tracker

// 2. Extract parameters safely from the active stream address context
const isArchiveRoute = computed(() => route.path.includes('/archives') || !!route.params.archiveContext);
const routeUsername = computed(() => (route.params.username as string) || '');
const taleId = computed(() => (route.params.taleId as string) || '');
const routeTaleTitle = computed(() => (route.params.taleTitle as string) || '');
const isLoggedIn = useLoginHint()


// 3. Evaluated Business Logic (Mirrors your C# expressions directly)
const isRedirecting = computed(() => !taleId.value.trim());

const redirectMessage = computed(() => {
  return isRedirecting.value 
    ? `Tale ID is missing. You may wish to view all tales by @${routeUsername.value}` 
    : '';
});



const redirectUrl = computed(() => {
  if (!isRedirecting.value) return '';
  // Encodes parameters cleanly into standard URL Query layouts (?username=...)
  return `/tales?username=${encodeURIComponent(routeUsername.value)}`;
});

const currentPath = encodeURIComponent(route.fullPath)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Profile View]: Presence verified via hint. Dispatching data fetch...')

  // 🎯 ROUTE-BASED GATEWAY CONTROL
  const { error } = isArchiveRoute.value
    ? await taleStore.loadArchivedTale(taleId.value)
    : await taleStore.loadTale(taleId.value);
  
  if (error) {
    loadingError.value = error
  } else{
    // 🚀 ADDRESS BAR SELF-HEALING REGION
    if (taleStore.tale && !taleStore.tale.isArchived) {
      const canonicalTitleSlug = generateTitleSlug(taleStore.tale.title);
      const targetUsername = taleStore.tale.creator.username || routeUsername.value;

      // If the slug in the current address bar does not match reality, heal it silently
      if (routeTaleTitle.value !== canonicalTitleSlug || routeUsername.value !== targetUsername) {
        console.info('[Router]: Mismatched signature detected. Performing canonical URL healing pass.');
        
        router.replace({
          name: 'TaleDetail', // Replace with your exact route configuration name
          params: { 
            username: targetUsername, 
            taleId: taleId.value, 
            taleTitle: canonicalTitleSlug 
          }
        });
      }
    }
  }

  //No matter the result, stop loading
  isLoading.value = false

}

// --- MOUNT PAGE ---
onMounted(async () => {

  if (isRedirecting.value) {
    // programmatic redirect
    console.warn("[Router Guard]: Invalid layout signature detected. Redirecting to author workspace stream.");

    router.replace(redirectUrl.value!)
     return
  }

  // 🎯 Clean Authentication Local Guard
  if (isArchiveRoute.value) {

    if (!isLoggedIn.value) {
      isUnauthorized.value = true // Set your explicit flag
      isLoading.value = false     // Drop the loader immediately
      return                      // Kill execution before hitting the store
    }
  }

  // 1. Clear out the previous tale immediately before starting the new fetch pass
  taleStore.reset()
  
  await initPage();

  
      //await nextTick();
    // 1. Instantly fire enrichment hydration pass in the background
    taleStore.enrichTale();

    // 2. Schedule a "True View" conversion event after a 5 second delay
    taleStore.recordView();

})

// inside your HomeView.vue
onUnmounted(() => {
  taleStore.reset()
});

</script>

<template>

  <template v-if="isRedirecting">

    <PageStatusMessage 
      title="Tale ID Not Found!" 
      :message="redirectMessage">

      <template #actions>
        <router-link :to="redirectUrl" class="btn primary">
          Redirect Now
        </router-link>
      </template>
    </PageStatusMessage>

  </template>

  <template v-else-if="isLoading">
      <div class="loader-container">
        <p class="loader"></p>
      </div>
    </template>

   <template v-else-if="isUnauthorized">
    <PageStatusMessage 
      title="401: Unauthorized!" 
      message="It appears you are not logged in or your session has expired. Login to view this archived content.">
      <template #actions>
        <button class="btn primary" @click="router.push(`/login?returnUrl=${currentPath}`)">Login</button>
      </template>
    </PageStatusMessage>
  </template>

    <template v-else-if="loadingError">
      <PageStatusMessage 
        :title="loadingError.title" 
        :message="loadingError.detail">
           <template v-if="loadingError.status == 404" #actions>
        <button class="btn primary" @click="router.push(`/tales`)">Find other tales</button>
      </template>
      </PageStatusMessage>
    </template>

    <template v-else-if="taleStore.tale">

       <template v-if="taleStore.tale.isArchived && !isArchiveRoute">
        <PageStatusMessage
            title='404: Archived!'
            message="Sorry.This tale has been temporarily archived and only available to persons who have previously engaged it through votes, saves, etc.">
            <template #actions>
              <button class="btn primary" @click="router.push(`/tale/archives/${taleId}`)">Continue to archives</button>
            </template>
          </PageStatusMessage>
      </template>

      <template v-else>
            <TaleDetailComponent />
      </template>

    </template>

    <template v-else>
     <PageStatusMessage
         title='000: Error'
        message="An unknown error occured. Refresh page and try again.">
      </PageStatusMessage>
    </template>

</template>