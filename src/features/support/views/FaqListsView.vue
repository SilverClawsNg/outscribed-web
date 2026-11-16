<script setup lang="ts"> 

// --- IMPORTS ---
import { ref, onMounted } from 'vue'

import FaqListComponent from '../components/FaqListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import faqData from '../data/faqs.json'
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
      <div class="about-header">
        <h1 class="about-header__title">About Us</h1>
        <p class="about-header__subtitle">
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
      
<!-- Editorial Jump Trigger -->
      <div class="about-page__jump">
        <a 
          href="#faq" 
          class="about-page__jump-link" 
          @click.prevent="scrollToFaq"
        >
        
        <span class="svg-holder"> <SvgIcons name="downarrow" :size="20" /></span>
          <span>Jump to Frequently Asked Questions</span>
        </a>
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
            <li><strong>Freedom Through Perspective:</strong> Storytelling allows creators to address sensitive, complex, or taboo topics safely and constructively by focusing on the narrative rather than personal identity.</li></ul>

           <h2>Use cases for OutScribing</h2>    
          <p>OutScribed gives people a safe, story-driven medium to express complex realities, speculate alternative scenarios, examine systems, and articulate deeply held beliefs. By reframing actualities through characters, hypothetical settings, or alternate timelines, creators can navigate challenging topics with total honesty.</p>
          <p>Here are some ways people use OutScribed:</p>

<ul>
  <li><strong>Reframing Personal Struggles:</strong> Process painful memories, life lessons, or personal regrets by externalizing your experience into a character's journey.</li>
  <li><strong>Navigating High-Stakes & Sensitive Topics:</strong> Discuss politics, governance, culture, or faith through narrative logic rather than aggressive debates and personal friction.</li>
  <li><strong>Dramatizing "What If" Futures:</strong> Explore how hypothetical events, economic shifts, or emerging laws might impact real lives by writing the story after the dust has settled.</li>
  <li><strong>Simplifying Complex Systems:</strong> Turn dense legal changes, financial frameworks, policy proposals, or technical jargon into relatable human stories that anyone can grasp.</li>
  <li><strong>Writing Tributuaries:</strong> Honour living people through biographical or reflective narrative fiction, celebrating their real-world impact while they are still here to experience it.</li>
  <li><strong>Conversing Across Time:</strong> Write stories addressed to past or future versions of yourself to explore cross-generational lessons, alternate choices, and long-term hope.</li>
  <li><strong>Testing Alternative Viewpoints:</strong> Adopt an opposing perspective or an unfamiliar worldview within a controlled narrative to build empathy and understand different sides of a debate.</li>
  <li><strong>Sparking Constructive Dialogue:</strong> Introduce bold or unconventional ideas through storytelling to invite meaningful discussion without provoking defensive reactions.</li>
</ul>

<p>At its core, OutScribed is built on clarity through perspective. It allows you to step into an alternate reality, tell an engaging tale, and shed light on real-world facts without fear.</p>
</div>

  <header class="page-header page-header--mid">
    <h2 class="page-header__title">
      Frequently Asked Questions
    </h2>
    <div class="page-header__lines">
      <p class="page-header__lines--item"></p>
      <p class="page-header__lines--item"></p>
    </div>
  </header>
 
  <template v-if="faqData.length > 0">

       <section id="faq" 
      ref="faqSection" 
      class="about-page__faq"
      tabindex="-1">

      <FaqListComponent 
         v-for="faq in faqData" 
        :key="faq.id" 
        :faq="faq"/>

       </section>

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
@import "@/assets/css/rich-text.less";

.about-page {
  padding-top: 3rem;
  width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;

  .about-header {
    text-align: center;
    margin-bottom: 2.5rem;
    max-width: @min-width;
     margin: 0 auto 2.5rem auto;

    &__title {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    &__subtitle {
      font-size: 1.05rem;
      line-height: 1.5;
    }
  }

   &__jump {
    margin: 1.25rem 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    column-gap: 0.5rem;

      & svg{
        fill: var(--text-color);
        vertical-align: middle;
      }

    &:hover{
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