<script setup lang="ts"> 

// --- IMPORTS ---
import { ref } from 'vue'

import FaqListComponent from '../components/FaqListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import faqData from '../data/faqs.json'


// Track the single open ID (using the item's unique id)
const openId = ref<number | null>();

function handleToggle(id: number) {
  // If the clicked item is already open, close it. Otherwise, open it (closing any other open card).
  openId.value = openId.value === id ? null : id;
}

</script>

<template>

  <div class="about-page">
      
      <!-- Header Section -->
      <div class="page-header">
        <h1 class="page-header__title">Frequently Asked Questions</h1>
        <p class="page-header__subtitle">
          Help topics to get you started on OutScribed including opening & managing account, creating tales, etc. 
        </p>
      </div>
     
 
  <template v-if="faqData.length > 0">

        <FaqListComponent 
         v-for="item in faqData" 
        :key="item.id" 
        :faq="item"
        :is-open="openId === item.id"
        @toggle="handleToggle"/>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No FAQ Found!"
      message="We did not find any frequently asked question."
      icon="inbox"
      :is-standalone="true"
      />
  </template>

</div>

</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

.about-page {
  width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;

   &__jump {
    margin: 1.25rem 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    column-gap: 0.5rem;
    

    & a{

      text-decoration: underline;
      font-weight: 400;
    }
    

      & svg{
        fill: var(--text-color);
        vertical-align: middle;
      }

    &:hover{
     
      & a{
         text-decoration: none;
      }
       & svg{
        fill: @link-color;
      }
    }
  }
  
   &__faq {
    scroll-margin-top: 80px; // Native CSS fallback for hash navigation
    outline: none; // Prevents focus ring when programmatically focused via tabindex="-1"
  }
}

  // Self-Service FAQ Box
  .faq-banner {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    background-color: var(--light-background-color);
    border: 1px solid var(--border-color);
    border-left: 4px solid @link-color;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2.5rem;

    &__icon {
      color: @link-color;
      flex-shrink: 0;
      margin-top: 0.2rem;

      & svg{
        stroke-width: 2;
      }


    }

    &__content {
      h2 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
      }

      p {
        font-size: 0.925rem;
        line-height: 1.5;
        margin-bottom: 1rem;
      }
    }
  }

  </style>