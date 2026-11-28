<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useUseCases } from '@/composables/useUseCases'

const { featuredUseCases, resolveAvatarUrl } = useUseCases()

const openIndex = ref<number | null>(0)

const toggleScenario = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
    
  <section class="use-cases-section" aria-labelledby="use-cases-heading">
    <header class="section-header section-header--max">
      <h2 id="use-cases-heading" class="section-header__title">
        Use Cases
      </h2>
      <div class="section-header__lines">
        <p class="section-header__lines--item"></p>
        <p class="section-header__lines--item"></p>
      </div>
      <RouterLink to="/use-cases" class="btn btn--primary">
        See All
      </RouterLink>
    </header>

    <p class="use-cases-intro">
      OutScribed focuses on the use of short stories as a means of expression. Here are some practical real-world scenarios where OutScribed stories excel.
    </p>

    <div class="use-cases-grid">
      <article
        v-for="(item, index) in featuredUseCases"
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
  </section>
</template>

<style lang="less" scoped>
@import "@/assets/css/use-case.less";
</style>