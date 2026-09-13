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

   <header class="page-header shared__container">
     <h1>FAQs</h1>
      <!-- Variant 1: Filter Button -->
      <button 
        type="button" 
        class="btn primary" 
        @click="modalStore.push('AskQuestion', 'Ask a Question')"
      >
      Ask a Question
      </button>
    </header>
 
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
      title="No FAQ Found!"
      message="We did not find any frequently asked question."
      icon="inbox"
      :is-standalone="true"
      />
  </template>

</template>