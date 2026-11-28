<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useUseCases } from '@/composables/useUseCases'

const { allUseCases, resolveAvatarUrl } = useUseCases()

const openIndex = ref<number | null>(0)

const toggleScenario = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}

</script>

<template>

  <section class="use-cases-page">

     <!-- Header Section -->
      <div class="page-header">
        <h1 class="page-header__title">Ways to OutScribe</h1>
        <p class="page-header__subtitle">
          Explore real-world scenarios showing how everyday ideas, debates, and memories become compelling stories.
        </p>
      </div>

  <template v-if="allUseCases.length > 0">

  
    <div class="use-cases-grid">
      <article
        v-for="(item, index) in allUseCases"
        :key="item.id"
        class="use-case-card"
        :class="{ 'is-open': openIndex === index }"
      >
        <button
          type="button"
          class="use-case-card__header"
          :aria-expanded="openIndex === index"
          :aria-controls="`use-case-panel-${item.slug}`"
          @click="toggleScenario(index)"
        >
          <span class="use-case-card__avatar">
            <img
              :src="resolveAvatarUrl(item.avatar)"
              :alt="item.title"
              width="136"
              height="136"
              loading="lazy"
            />
          </span>

          <span class="use-case-card__title-row">
            <h3 class="use-case-card__title">{{ item.title }}</h3>
            <span class="use-case-card__toggle" aria-hidden="true">
              {{ openIndex === index ? '−' : '+' }}
            </span>
          </span>
        </button>

        <div
          :id="`use-case-panel-${item.slug}`"
          class="use-case-card__panel"
        >
          <div class="use-case-card__step">
            <h4>The Situation</h4>
            <p>{{ item.situation }}</p>
          </div>

          <div class="use-case-card__step">
            <h4>The OutScribed Approach</h4>
            <p>{{ item.approach }}</p>
          </div>

          <div class="use-case-card__step">
            <h4>Why It Works</h4>
            <p>{{ item.whyItWorks }}</p>
          </div>
        </div>
      </article>
    </div>

  </template>

  <template v-else>
    <PageStatusMessage
      title="No Use Case Found!"
      message="We did not find any use case."
      icon="inbox"
      :is-standalone="true"
      />
  </template>
   
  </section>
</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

.use-cases-page {
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