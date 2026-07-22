<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted, watch, computed, onUnmounted } from 'vue' // 🛡️ Fix 2: Added missing 'watch' hook import
import { useFaqListStore } from '../stores/FaqListStore'; 
import { APIError } from '@/api/apiTypes.ts'
import FaqListComponent from '../components/FaqListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'

// --- INITIALIZE STORES ---
const faqStore = useFaqListStore();
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const wasCleaned = ref(false)
const baseRoute = ref<string>('api/faqs'); 

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { success, error } = await faqStore.loadFaqs(baseRoute.value)

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
      <button class="btn secondary" @click="modalStore.push('AskQuestion', 'Ask a Question')">Ask a Question</button>

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