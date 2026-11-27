<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useHomeStore } from '../stores/HomeStore'; 
import { CategoryDescriptions } from '@/utils/descriptors';
import { mediaHelper } from '@/utils/mediaHelper'
import TaleTextComponent from '@/features/tales/components/TaleTextComponent.vue';
import TaleCardComponent from '@/features/tales/components/TaleCardComponent.vue';

const homepageStore = useHomeStore();


const goldTale = computed(() => homepageStore.hotTales[0] ?? null)
const silverTale = computed(() => homepageStore.recentTales[1] ?? null)
const bronzeTale = computed(() => homepageStore.recentTales[2] ?? null)

</script>


<template>
  <section
    v-if="goldTale"
    class="hot-tales"
    aria-labelledby="hot-tales-heading"
  >
    <header class="hot-tales__header">
      <h2 id="hot-tales-heading" class="hot-tales__title">
        Hot this week
      </h2>
      <RouterLink to="/tales?sort=hot" class="hot-tales__more">
        View all hot tales &rarr;
      </RouterLink>
    </header>

    <div class="hot-podium">
      <!-- #1 GOLD: Left Lead Column -->
      <article class="hot-podium__gold">
        <RouterLink
          :to="`/tale/${goldTale.slug}`"
          class="hot-podium__media hot-podium__media--gold"
          :aria-label="`Read ${goldTale.title}`"
        >
          <img
            v-if="goldTale.photo"
           :src="mediaHelper.getUrl(goldTale.photo, 'tales', 'full')" 
            :alt="goldTale.title"
            width="750"
            height="562"
            loading="lazy"
          />
          <div v-else class="hot-podium__fallback" aria-hidden="true">
            <span>{{ CategoryDescriptions[goldTale.category] }}</span>
          </div>
        </RouterLink>

        <div class="hot-podium__body hot-podium__body--gold">
          <TaleTextComponent :tale="goldTale" type="gold" />
        </div>
      </article>

      <!-- RIGHT COLUMN: #2 SILVER + #3 BRONZE -->
      <div v-if="silverTale || bronzeTale" class="hot-podium__side">
        <!-- #2 SILVER: Top Right -->
        <article v-if="silverTale" class="hot-podium__silver">
          <RouterLink
            :to="`/tale/${silverTale.slug}`"
            class="hot-podium__media hot-podium__media--silver"
            :aria-label="`Read ${silverTale.title}`"
          >
            <img
              v-if="silverTale.photo"
              :src="mediaHelper.getUrl(silverTale.photo, 'tales', 'full')" 
              :alt="silverTale.title"
              width="750"
              height="562"
              loading="lazy"
            />
            <div v-else class="hot-podium__fallback" aria-hidden="true">
              <span>{{ CategoryDescriptions[silverTale.category] }}</span>
            </div>
          </RouterLink>

          <div class="hot-podium__body hot-podium__body--silver">
            <TaleTextComponent :tale="silverTale" type="silver" />
          </div>
        </article>

        <!-- #3 BRONZE: Bottom Right (Horizontal Thumbnail + Text) -->
        <article v-if="bronzeTale" class="hot-podium__bronze">
          <RouterLink
            :to="`/tale/${bronzeTale.slug}`"
            class="hot-podium__media hot-podium__media--bronze"
            :aria-label="`Read ${bronzeTale.title}`"
          >
            <img
              v-if="bronzeTale.photo"
             :src="mediaHelper.getUrl(bronzeTale.photo, 'tales', 'full')" 
              :alt="bronzeTale.title"
              width="750"
              height="562"
              loading="lazy"
            />
            <div v-else class="hot-podium__fallback" aria-hidden="true">
              <span>{{ CategoryDescriptions[bronzeTale.category] }}</span>
            </div>
          </RouterLink>

          <div class="hot-podium__body hot-podium__body--bronze">
            <TaleTextComponent :tale="bronzeTale" type="bronze" />
          </div>
        </article>
      </div>
    </div>
  </section>
</template>


<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/tale-card.less";
/* =============================================================
- HOT TALES PODIUM (1st Gold, 2nd Silver, 3rd Bronze)
- ============================================================= */

.hot-tales {
  width: 100%;
  max-width: @max-width; // 1300px
  margin: 2.5rem auto 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--border-color);
  }

  &__title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--heading-text-color);
  }

  &__more {
    font-size: 0.85rem;
    font-weight: 400;
    white-space: nowrap;
    color: var(--heading-text-color);
    text-decoration: underline;
    text-underline-offset: 4px;

    &:hover {
      color: var(--body-text-color);
      text-decoration: none;
    }
  }
}

// -------------------------------------------------------------
// Podium Composition (Stacked < 992px, Asymmetric Split >= 992px)
// -------------------------------------------------------------
.hot-podium {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: stretch;

  &__gold,
  &__silver {
    display: flex;
    flex-direction: column;
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__bronze {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  // Shared Media Frame (4:3 native ratio matching 750x562)
  &__media {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--surface-background-color, #f4f4f5);
    text-decoration: none;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }

    &:hover img {
      transform: scale(1.025);
    }
  }

  &__fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: linear-gradient(135deg, #10203a 0%, #1f3250 100%);
    color: #f5f5f5;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
  }

  &__body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding-top: 1rem;
  }
}

@media (max-width: 1320px) {
  .hot-tales {
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
  }
}

// Tablet (600px - 991px): Keep Gold full-width on top, Silver & Bronze side-by-side below
@media @tablet {
  .hot-podium__side {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }
}

// Desktop (>= 992px): Broadsheet Gold (Left) + Silver & Bronze (Right) with Hairline Dividers
@media (min-width: 992px) {
  .hot-podium {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 2rem;

    &__gold {
      padding-right: 2rem;
      border-right: 1px solid var(--border-color);
    }

    &__body--gold {
      padding-top: 1.25rem;
    }

    &__side {
      justify-content: space-between;
      gap: 1.5rem;
    }

    // Silver gets a slightly wider 16:9 crop so the right column balances vertically
    &__media--silver {
      aspect-ratio: 16 / 9;
    }

    &__body--silver {
      padding-top: 0.9rem;
    }

     &__bronze {
    flex-direction: column;
    gap: 0;
    padding-top: 1.35rem;
    border-top: 1px solid var(--border-color);
  }

   &__media--bronze {
    display: none;
  }

   &__body--bronze {
    padding-top: 0;
  }

  }
}
</style>