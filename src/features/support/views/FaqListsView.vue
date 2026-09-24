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


     <header class="page-header">
      <div class="page-header__contents">
        <h1>Frequently Asked Questions</h1>
          <button 
        type="button" 
        class="btn btn--secondary"  
        @click="modalStore.push('AskQuestion', 'Ask a Question')"
      >
      Ask a Question
      </button>
      </div>
    </header>
 
  <template v-if="faqData.length > 0">

       <div class="container">

      <FaqListComponent 
         v-for="faq in faqData" 
        :key="faq.id" 
        :faq="faq"/>

  </div>

  <div class="page-closure"></div>

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