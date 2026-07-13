<script setup lang="ts">

// --- IMPORTS ---
import { computed, onMounted, ref, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageStatusMessage from '@/components/PageStatusMessage.vue';
import InsightDetailComponent from '../components/InsightDetailComponent.vue'
import { useInsightDetailStore } from '../stores/InsightDetailStore'; 
import { APIError } from '@/api/apiTypes.ts'
import { useModalStore } from '@/stores/modalStore'
import { generateTitleSlug } from '@/utils/urlSlugGenerator';
import { useLoginHint } from '@/utils/authHelper'

// --- INITIALIZE STORES ---
const insightStore = useInsightDetailStore();
const route = useRoute();
const router = useRouter();
const modalStore = useModalStore()

// --- DEFINE & INITALIZE LOCAL VARIABLES ---
const loadingError = ref<APIError | null>(null)
const isLoading = ref<boolean>(true);
const isUnauthorized = ref<boolean>(false) // 🎯 Introduce an explicit state tracker
const isLoggedIn = useLoginHint()
// 2. Extract parameters safely from the active stream address context
const isArchiveRoute = computed(() => route.path.includes('/archives') || !!route.params.archiveContext);
const routeUsername = computed(() => (route.params.username as string) || '');
const insightId = computed(() => (route.params.insightId as string) || '');
const routeInsightTitle = computed(() => (route.params.insightTitle as string) || '');

// 3. Evaluated Business Logic (Mirrors your C# expressions directly)
const isRedirecting = computed(() => !insightId.value.trim());

const redirectMessage = computed(() => {
  return isRedirecting.value 
    ? `Insight ID is missing. You may wish to view all insights by @${routeUsername.value}` 
    : '';
});

function redirectToArchives() {
  router.push(`/insight/archives/${insightId.value}`)
}

function redirectToAllInsights() {
  router.push(`/insights`)
}

const redirectUrl = computed(() => {
  if (!isRedirecting.value) return '';
  // Encodes parameters cleanly into standard URL Query layouts (?username=...)
  return `/insights?username=${encodeURIComponent(routeUsername.value)}`;
});

const currentPath = encodeURIComponent(route.fullPath)

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Profile View]: Presence verified via hint. Dispatching data fetch...')

  // 🎯 ROUTE-BASED GATEWAY CONTROL
  const { error } = isArchiveRoute.value
    ? await insightStore.loadArchivedInsight(insightId.value)
    : await insightStore.loadInsight(insightId.value);
  
  if (error) {
    loadingError.value = error
  } else{
    // 🚀 ADDRESS BAR SELF-HEALING REGION
    if (insightStore.insight && !insightStore.insight.isArchived) {
      const canonicalTitleSlug = generateTitleSlug(insightStore.insight.title);
      const targetUsername = insightStore.insight.creator.username || routeUsername.value;

      // If the slug in the current address bar does not match reality, heal it silently
      if (routeInsightTitle.value !== canonicalTitleSlug || routeUsername.value !== targetUsername) {
        console.info('[Router]: Mismatched signature detected. Performing canonical URL healing pass.');
        
        router.replace({
          name: 'InsightDetail', // Replace with your exact route configuration name
          params: { 
            username: targetUsername, 
            insightId: insightId.value, 
            insightTitle: canonicalTitleSlug 
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

  // 1. Clear out the previous insight immediately before starting the new fetch pass
  insightStore.reset()
  
  await initPage();

      
    // 1. Instantly fire enrichment hydration pass in the background
    insightStore.enrichInsight();

    // 2. Schedule a "True View" conversion event after a 5 second delay
    insightStore.recordView();

})

// inside your HomeView.vue
onUnmounted(() => {
  insightStore.reset()
});

</script>

<template>

  <template v-if="isRedirecting">

    <PageStatusMessage 
      title="Insight ID Not Found!" 
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
        <button class="btn primary" @click="router.push(`/insights`)">Find other insights</button>
      </template>
      </PageStatusMessage>
    </template>

    <template v-else-if="insightStore.insight">

       <template v-if="insightStore.insight.isArchived && !isArchiveRoute">
        <PageStatusMessage
            title='404: Archived!'
            message="Sorry.This insight has been temporarily archived and only available to persons who have previously engaged it through votes, saves, etc.">
            <template #actions>
              <button class="btn primary" @click="router.push(`/insight/archives/${insightId}`)">Continue to archives</button>
            </template>
          </PageStatusMessage>
      </template>

      <template v-else>
            <InsightDetailComponent />
      </template>

    </template>

    <template v-else>
     <PageStatusMessage
         title='Unknwon Error'
        message="An unknown error occured. Refresh page and try again.">
      </PageStatusMessage>
    </template>

</template>