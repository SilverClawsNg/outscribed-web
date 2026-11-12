<script setup lang="ts"> 

// --- IMPORTS ---
import FaqListComponent from '../components/FaqListComponent.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore'
import faqData from '../data/faqs.json'
import SvgIcons from '@/components/SvgIcons.vue'

// --- INITIALIZE STORES ---
const modalStore = useModalStore()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---

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
          <p>OutScribed gives people a safe, story-driven medium to express complex realities, examine systems, and articulate deeply held beliefs. By reframing actualities through characters, hypothetical settings, or alternate timelines, creators can navigate challenging topics with total honesty.</p>
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

       <div class="container">

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

    &__title {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    &__subtitle {
      font-size: 1.05rem;
      max-width: 80%;
      margin: 0 auto;
      line-height: 1.5;
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