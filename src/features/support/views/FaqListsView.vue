<script setup lang="ts"> 

// --- IMPORTS ---
import FaqListComponent from '../components/FaqListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import faqData from '../data/faqs.json'

// --- INITIALIZE STORES ---
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---

</script>

<template>
 
      <div class="shared__page-title">
        <h1>FAQs</h1>
      <button class="btn secondary" @click="modalStore.push('AskQuestion', 'Ask a Question')">Ask a Question</button>

      </div>

  <template v-if="faqData.length > 0">

       <div class="shared__container">

      <FaqListComponent 
         v-for="faq in faqData" 
        :key="faq.id" 
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