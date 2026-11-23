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
      <div class="about-banner">
        <div class="about-banner__icon">
          <SvgIcons name="help" :size="30"/>
        </div>
        <div class="about-banner__content">
         
          <p><strong>out·scribe:</strong> <i>verb</i> | /aʊtˈskraɪb/</p>
          <p><strong>Inflections:</strong> outscribe, outscribed, outscribing, outscribes</p>
          <p><strong>Etymology:</strong> Blend of <i>out-</i> (expressing outward projection) + <i>-scribe</i> (from Latin <i>scribere</i>, to write).</p>
          <p><strong>Definition:</strong> To express, reframe, or dramatize a real-world event, systemic issue, or human truth by adopting an alternate narrative perspective rather than writing as oneself.</p>
         
        </div>
      
      </div>
      
<div class="rich-text">
 
<h2>What is OutScribed?</h2>

<p>
OutScribed is a platform for exploring ideas through imagined realities.
</p>

<p>
Whether you are questioning a policy, reimagining a system, simplifying a complex solution, offering a dissenting judgment, exploring a historical mystery, or expressing thoughts that are difficult to share directly, OutScribed allows you to examine those ideas through short stories.
</p>


<blockquote>
    The story is the vehicle. The idea is the destination.
</blockquote>


<p>
By stepping into alternate realities, future timelines, historical reconstructions, and fictional perspectives, writers can explore possibilities, challenge assumptions, and present new ways of thinking without being limited by conventional formats.
</p>

<h2>The Anatomy of a Tale</h2>

<p>
Stories on OutScribed, known as <strong>Tales</strong>, operate at the intersection of imagination and reasoning.
</p>

<h3>The Narrative (The Exploration)</h3>

<p>
A short story that places an idea inside a lived reality.
</p>

<p>
The narrative may explore:
</p>

<ul>
    <li>Alternative perspectives</li>
    <li>Future consequences</li>
    <li>Historical mysteries</li>
    <li>Speculative theories</li>
    <li>Redesigned systems</li>
    <li>Personal experiences</li>
    <li>Dissenting viewpoints</li>
</ul>

<p>
Rather than simply describing an idea, the narrative allows readers to experience its implications.
</p>

<h3>The Reality Check (The Anchor)</h3>

<p>
A supporting section that connects the narrative to the real world.
</p>

<p>
Reality Checks may contain:
</p>

<ul>
    <li>Facts</li>
    <li>Research</li>
    <li>Historical records</li>
    <li>News events</li>
    <li>Legal precedents</li>
    <li>Technical references</li>
    <li>Personal context</li>
</ul>

<p>
The purpose is not to prove the story is true, but to reveal the real-world idea that inspired it.
</p>

<h2>The OutScribed Philosophy</h2>

<p>
OutScribed was built on a simple belief:
</p>

<blockquote>
    Some ideas are easier to understand, discuss, and refine when they are experienced through related stories.
</blockquote>

<p>
Stories allow us to test possibilities before embracing them, examine consequences before creating them, and understand perspectives before accepting or rejecting them.
</p>

<h2>The OutScribed Code</h2>

<ul>
  <li><strong>Anchored in Reality</strong>: Even the most imaginative tales should remain grounded in recognizable human behavior, plausible reasoning, or real-world inspiration.</li>
<li><strong>Exploration Over Certainty</strong>: OutScribed is a place to explore ideas, not declare final answers. Tales are invitations to think, question, and discuss.</li>
<li><strong>Eyes On The Goal</strong>: Critique systems, decisions, assumptions, and outcomes. Keep the emphasis on ideas rather than personal attacks.</li>
<li><strong>Freedom Through Narrative</strong>: Stories provide a safe distance between the writer and the subject. They allow creators to explore sensitive, unconventional, or deeply personal topics while retaining control over how those experiences are expressed.</li>
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
  .about-banner {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
     background-color: var(--surface-background-color);
    border: 1px solid var(--surface-border-color);
    border-left-width: 4px;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2.5rem;

    &__icon {
      color: var(--muted-text-color);
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