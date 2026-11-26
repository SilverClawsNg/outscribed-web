<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
const modalStore = useModalStore()

function handleCreateDraftClick() {
  modalStore.push('CreateTale', 'Create Tale')
}

</script>
<template>
   <section class="roadmap-section" aria-labelledby="roadmap-heading">
 <header class="roadmap-section__header">
  <h2 id="roadmap-heading" class="roadmap-section__title">
    <span class="roadmap-section__title-top">Go from guest to OutScriber</span>
    <span class="roadmap-section__title-main">in five minutes</span>
  </h2>
</header>

  <!-- 4-Section Body: [1] Image + [2, 3, 4] Enclosed Step Containers -->
  <div class="roadmap-section__body">
    <div class="roadmap-section__media">
      <img src="@/assets/images/writing-girl.png" alt="Writer crafting a story" />
    </div>

    <div class="roadmap-section__steps">
      <article class="roadmap-card roadmap-card--step1">
        <h3 class="roadmap-card__heading">1. Sign Up</h3>
        <ul class="roadmap-card__content">
          <li>Create an account via Google, Microsoft, Apple, or email token.</li>
          <li>Choose your unique OutScribed handle and password.</li>
          <li>Accept the platform's legal &amp; structural statements in one click.</li>
        </ul>
      </article>

      <article class="roadmap-card roadmap-card--step2">
        <h3 class="roadmap-card__heading">2. Build Story</h3>
        <ul class="roadmap-card__content">
          <li>Start a draft with a title and category.</li>
          <li>Open the <strong>Write Studio</strong> to craft your narrative.</li>
          <li>Complete reality checks, optional photo, and tags.</li>
        </ul>
      </article>

      <article class="roadmap-card roadmap-card--step3">
        <h3 class="roadmap-card__heading">3. Go Live</h3>
        <ul class="roadmap-card__content">
          <li>Preview your story to ensure all Ts are crossed and Is dotted.</li>
          <li>Publish to the world with a single click.</li>
          <li>Invite readers to rate and join discussion threads.</li>
        </ul>
      </article>
    </div>
  </div>

  <footer class="roadmap-section__footer">
    <button
      type="button"
      class="btn btn--primary"
      @click="handleCreateDraftClick"
    >
      Start here
    </button>

    <router-link to="/faqs" class="roadmap-section__faq-link">
      View FAQs
    </router-link>
  </footer>
</section>
</template>


<style lang="less" scoped>
@import "@/assets/css/variables.less";
/* =============================================================
- COMPACT 4-SECTION HORIZONTAL ROADMAP
- ============================================================= */

.roadmap-section {
  width: 100%;
  max-width: @max-width; // 1300px
  margin: 2rem auto 0;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

&__header {
    text-align: center;
    max-width: 780px;
    margin: 0 auto;
    padding: 0.25rem 0 0.5rem;
  }

  &__title {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
  }

  &__title-top {
    font-size: clamp(1.05rem, 1.8vw, 1.35rem);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: 0.01em;
    color: var(--body-text-color);
  }

  &__title-main {
    font-size: clamp(1.95rem, 4.2vw, 2.6rem);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.025em;
    
  }
 

  // Body wrapper: defaults to stacked (< 600px and tablet 600px-992px)
  &__body {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 1.25rem 0;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
    align-items: stretch;
  }

  // Section 1: Illustration column
  &__media {
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      display: block;
      width: 100%;
      max-width: 220px;
      height: auto;
      object-fit: contain;
    }
  }

  // Sections 2, 3, 4: Enclosed step containers (stacked < 600px)
  &__steps {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  &__faq-link {
    font-size: 0.88rem;
    font-weight: 400;
    text-decoration: underline;
    text-underline-offset: 4px;
    color: var(--heading-text-color);

    &:hover {
      text-decoration: none;
      color: var(--body-text-color);
    }
  }
}

.roadmap-card {
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  

  &__heading {
    font-size: 0.95rem;
    text-transform: uppercase;
    font-weight: 900;
    letter-spacing: 0.03em;
    margin: 0;
    color: var(--heading-text-color);
  }

  &__content {
    list-style: square;
    margin: 0;
    padding-left: 1.05rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    li {
      font-size: 0.85rem;
      line-height: 1.4;
      color: var(--body-text-color);

      strong {
        color: var(--heading-text-color);
      }
    }
  }
}

// Container margin adjustment below 1320px
@media (max-width: 1320px) {
  .roadmap-section {
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
  }
}

// Tablet & up (>= 600px): 3 text step containers sit side-by-side
@media (min-width: 600px) {
  .roadmap-section__steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
}

// Desktop (> 992px): Image joins as the 1st of 4 horizontal sections
@media (min-width: 993px) {
  .roadmap-section__body {
    grid-template-columns: minmax(190px, 0.85fr) minmax(0, 3fr);
    align-items: center;
    gap: 1.25rem;
  }

  .roadmap-section__media img {
    max-width: 240px;
  }
}

// Small phones (< 600px): compact outer padding
@media (max-width: 599px) {
  .roadmap-section {
    padding: 1.15rem 0.9rem;
    gap: 1rem;
  }
}
</style>