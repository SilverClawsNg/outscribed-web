<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted } from 'vue'

import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useRoute } from 'vue-router';

// --- INITIALIZE STORES ---
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const route = useRoute();
const faqSection = ref<HTMLElement | null>(null);

const scrollToFaq = () => {
  if (!faqSection.value) return;

  // Adjust offset (e.g., 80px) to clear your sticky navbar cleanly
  const headerOffset = 80;
  const elementPosition = faqSection.value.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });

  // Shift focus for keyboard/screen-reader accessibility without jumping scroll again
  faqSection.value.focus({ preventScroll: true });
};

// Also handle direct navigation to /faqs#faq
onMounted(() => {
  if (route.hash === '#faq') {
    setTimeout(scrollToFaq, 100);
  }
});

</script>

<template>

  <div class="about-page">
      
      <!-- Header Section -->
      <div class="page-header">
        <h1 class="page-header__title">About Us</h1>
        <p class="page-header__subtitle">
          A quick guide to our storytelling philosophy, the anatomy of tales, opening & managing accounts, and publishing guidelines.
        </p>
      </div>
      <!-- FAQ Self-Service Banner -->
      <div class="faq-banner">
        <div class="faq-banner__icon">
          <SvgIcons name="help" :size="30"/>
        </div>
        <div class="faq-banner__content">
         
          <p><strong>out·scribe:</strong> <i>verb</i> | /aʊtˈskraɪb/</p>
          <p><strong>Inflections:</strong> outscribe, outscribed, outscribing, outscribes</p>
          <p><strong>Etymology:</strong> Blend of <i>out-</i> (expressing outward projection) + <i>-scribe</i> (from Latin <i>scribere</i>, to write).</p>
          <p><strong>Definition:</strong> To express, reframe, or dramatize a real-world event, systemic issue, or human truth by adopting an alternate narrative perspective rather than writing as oneself.</p>
         
        </div>
      
      </div>
      
<div class="rich-text">
  <h1>What is OutScribed?</h1>
   <p>OutScribed is a story-driven publishing platform where real-world situations are explored through imaginative fiction. By stepping into hypothetical scenarios and third-person perspectives, writers can unpack complex truths, ask bold 'what-if?' questions, and explore human experiences without the constraints of personal inhibitions & traits.</p>
   <h2>The Anatomy of a Tale</h2>      
   <p>Stories on OutScribed, known as <strong>tales</strong>, operates at the intersection of imagination and logic:</p>
          <ul><li><strong>The Narrative (The Fiction):</strong> Immersive stories, dramatic scenarios, and character-driven plots inspired by real-world trends, historical pivots, or current events.</li>
            <li><strong>The Reality Check (The Anchor):</strong> Real-world sources or background facts that reveal the exact truth or event that sparked the story.</li></ul>
           <h2>The OutScribed Code: Creative Freedom with Integrity</h2>   
          <p>OutScribed uses narrative storytelling to illuminate reality from new angles. Quality and trust are maintained through three guiding principles:</p>
          <ul><li><strong>Anchored in Reality:</strong> Stories are grounded in plausible logic, real human dynamics, and verifiable events—never aimless sensationalism.</li>
            <li><strong>Exploration Over Agendas:</strong> Focus are placed on systems, societal shifts, and human choices rather than launching personal attacks or targeted harassment.</li>
            <li><strong>Freedom Through Perspective:</strong> Storytelling allows creators to address sensitive, complex, or taboo topics safely and constructively by focusing on the narrative rather than personal identity.</li>
          </ul>
 
          
</div>

   <!-- Editorial Jump Trigger -->
      <div class="about-page__jump">
        <p>See Also:</p>
        <div  class="about-page__links">
           <router-link to="/faqs" class="about-page__links-item">
            Frequently Asked Questions
          </router-link>
             <router-link to="/use-cases" class="about-page__links-item">
            Use Cases For OutScribed
          </router-link>
        </div>
      </div>
</div>

</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";
@import "@/assets/css/rich-text.less";

.about-page {
  width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;

   &__jump {
    margin: 1.25rem 0;
 
  }

  &__links{
     display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    margin-top: 0.5rem;
    margin-left: 0.5rem;
    
    &-item{
      text-decoration: underline;
      color:var(--text-color);
      font-weight: 400;
      
    &:hover{
      text-decoration: none;
    }
    }
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