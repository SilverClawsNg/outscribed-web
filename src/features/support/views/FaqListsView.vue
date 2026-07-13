<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, computed, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useFaqListStore } from '../stores/FaqListStore'; 
import { useFaqListFilterStore } from '../stores/FaqListFilterStore'; 
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts'
import FaqListComponent from '../components/FaqListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import { FaqCategoryDescriptions } from '@/utils/descriptors.ts'
import type { FaqCategory } from '@/utils/enumHelper.ts';


// --- INITIALIZE STORES ---
const faqStore = useFaqListStore();
const faqFilterStore = useFaqListFilterStore();
const router = useRouter()
const route = useRoute()
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)
const baseRoute = ref<string>('api/faqs'); 

// --- ROUTE OPTIONS ---
const category = computed(() => faqFilterStore.category as FaqCategory || 'General')


// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Faq Lists View]: Presence verified via hint. Dispatching data fetch...')

  // 1. Hydrate and check if the incoming URL string was pristine
  const { isClean } = faqFilterStore.rehydrate(route.query);

  // 2. 🛑 INTERCEPT TRASH: If parameters were stripped, update browser bar and halt!
  if (!isClean) {
    console.log('[Firewall] Stomping out double API call. Syncing browser string first...')
    
    wasCleaned.value  = true

    await router.replace({
      path: route.path,
      query: faqFilterStore.getAsDictionary()
    })
    
    // Abort this execution flow completely! 
    // The router update triggers your route.query watcher, handling the fetch smoothly.
    return
  }

  // 1. Hydrate the Filter Store using the current active route parameters
  //faqFilterStore.rehydrate(route.query);

  // 2. Build the targeted API request endpoint string from those validated details
  // 🛡️ Fix 4: Changed 'filterStore' to your actual variable 'faqFilterStore'
  const cleanApiPath = faqFilterStore.buildApiPath(baseRoute.value);

  // 3. Fetch from store
  const { success, error } = await faqStore.loadFaqs(cleanApiPath)

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

}

// --- MOUNT PAGE ---
onMounted(async () => {
  
  await initPage();
})

// Watch for browser navigation query parameters changing (Handles back/forward buttons cleanly)
watch(() => route.query, () => {
  initPage();
}, { deep: true });


// inside your HomeView.vue
onUnmounted(() => {
  faqStore.abort();
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
      :message="loadingError.detail || 'An unexpected error occurred.'">
     
    </PageStatusMessage>

  </template>

   <template v-else>
   
      <div class="shared__page-title">
        <h1>FAQs</h1>
        <p>{{ FaqCategoryDescriptions[category] }}</p>
        <div class="shared__page-title-actions">
          <button class="btn primary" @click="modalStore.push('FaqListFilter', 'Filter Lists')">Filter</button>
          <button class="btn secondary" @click="modalStore.push('AskQuestion', 'Ask a Question')">Ask a Question</button>
        </div>
      </div>

      <template v-if="wasCleaned">
     <div class="shared__content-warning">
       <span class="icon">⚠️</span>
      <p>
      Some filter values in the URL were invalid and removed. We are showing the best matching results. Use the
      <button @click="modalStore.push('FaqListFilter', 'Filter Lists')">filter</button> link to filter correctly.
      </p>
      
     </div>
    </template>

  <template v-if="faqStore.faqs && faqStore.faqs.length > 0">

       <div class="shared__container">

      <FaqListComponent 
        v-for="faq in faqStore.faqs" 
        :key="faq.faqId" 
        :faq="faq"/>

  </div>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Content!"
      message="No faqs was found matching your search filters.">
    </PageStatusMessage>
  </template>
  </template>

</template>