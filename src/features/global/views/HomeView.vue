<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { APIError } from '@/api/apiTypes'
import { useHomeStore } from '../stores/HomeStore'; 
import { type TaleListDto } from '@/features/tales/types/TalesTypes';

// Sub-components & Stores
import { useModalStore } from '@/stores/modalStore'
import { mediaHelper } from '@/utils/mediaHelper'
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import SvgIcons from '@/components/SvgIcons.vue';
import { useLoginHint } from '@/utils/authHelper'

// 1. Setup Services & State
const homepageStore = useHomeStore();
const modalStore = useModalStore()
const engage = useEngagement()
const router = useRouter()
const isLoggedIn = useLoginHint()

// --- DEFINE & INITIALIZE LOCAL VARIABLES ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const isRecent = ref(false)

function handleCreateDraftClick() {
  modalStore.push('CreateTale', 'Create Tale')
}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {
  const { success, error } = await homepageStore.loadhomecontents()

  if (!success) {
    if (error) {
      loadingError.value = error
    } else {
      loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occurred while retrieving homepage contents. Refresh page and try again.'
      );
    }
  }

  isLoading.value = false

  if (success) {
    await homepageStore.hydratePersonals(); 
  }
}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

onUnmounted(() => {
  homepageStore.abort();
});

// 1. FOCUS TALE: Takes the very first tale in the collection
const focusTale = computed<TaleListDto | null | undefined>(() => {
  return homepageStore.tales.length > 0 ? homepageStore.tales[0] : null;
});

// 2. PILL DISPLAY TALES: Slices the rest of the array (from index 1 onward)
const pillTales = computed<TaleListDto[]>(() => {
  return homepageStore.tales.length > 1 ? homepageStore.tales.slice(1) : [];
});

function handleJoinClick() {
  if (isLoggedIn.value) {
    router.push('/switch');
  } else {
    router.push('/register');
  }
}
</script>

<template>
  <div class="homepage-hero">
    <div class="homepage-hero__container">
      <div class="homepage-hero__brand-divider">
        <span class="homepage-hero__line"></span>
        <img src="@/assets/images/icon.png" alt="OutScribed Logo" class="homepage-hero__logo-icon" />
        <span class="homepage-hero__line"></span>
      </div>
     
      <h1 class="homepage-hero__title">
        The reality you know is just one version.
      </h1>
      
      <h2 class="homepage-hero__explainer">
        Blending logic and artistic freedoms, our stories re-imagine the past, 
        reframe the present, and sculpt futures.
      </h2>

      <div class="homepage-hero__cta-group">
        <RouterLink class="homepage-hero__cta homepage-hero__cta--about" to="/faqs">
          About Us
        </RouterLink>
        <button class="homepage-hero__cta homepage-hero__cta--join" @click="handleJoinClick">
          Join
        </button>
      </div>
    </div>
  </div>

  <div class="trending-section">
    <div class="trending-section__header">
      <SvgIcons name="trending" :size="80" />
      <h2 class="trending-section__title">Trending On OutScribed</h2>
    </div>

    <div class="trending-section__tags">
      <RouterLink
        v-for="tag in homepageStore.tags" 
        :key="tag.tagId" 
        :to="`/tales?tag=${tag.slug}`" 
        class="tag-pill"
      >
        <span class="tag-pill__name"><span class="tag-pill__symbol">#</span>{{ tag.name }}</span>
        <span class="tag-pill__divider"></span>
        <span class="tag-pill__metric">{{ formatCounts(tag.talesCounter) }}</span>
      </RouterLink>

      <RouterLink to="/tags" class="tag-pill tag-pill--more">
        <span class="tag-pill__name">More...</span>
      </RouterLink>
    </div>
  </div>

  <div class="main-layout">
    <div class="main-layout__content">
      <header class="section-header">
        <h2 class="section-header__title">Recent Tales</h2>
        <RouterLink to="/tales" class="btn btn--primary" title="Recent Tales"><span>View All</span></RouterLink>
      </header>

      <section class="focus-section">
        <article class="focus-card" v-if="focusTale">
          <div class="focus-card__content">
            <div class="tale-card">
              <h2 class="tale-card__title tale-card__title--large">
                <RouterLink :to="`/tale/${focusTale.slug}`" class="tale-card__link">{{ focusTale.title }}</RouterLink>
              </h2>
 
              <p class="tale-card__summary tale-card__summary--large">
                {{ focusTale.summary.length > 500 ? focusTale.summary.substring(0, 500) + '...' : focusTale.summary }}
              </p>

              <div class="tale-card__meta">
                <button class="tale-card__author-btn" @click="modalStore.push('Profile', 'Profile', focusTale.creatorId)">
                  {{ focusTale.creatorUsername }}
                </button>
                <span class="tale-card__dot"></span>
                <time class="tale-card__date">{{ toRelativeTime(focusTale.createdAt) }}</time>
                <span class="tale-card__dot"></span>
                <span class="tale-card__read-time">{{ focusTale.readingTime }} Min Read</span>
              </div>
      
              <footer class="tale-card__footer">
                <button 
                  class="tale-card__save-btn"
                  @click="engage.favorite(focusTale.engagement)"
                  :title="focusTale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                >
                  <SvgIcons name="bookmark" /> 
                  <span>Add to Favorites</span>
                </button>
                <RouterLink class="btn btn--secondary" :to="`/tale/${focusTale.slug}`">View Tale</RouterLink>
              </footer>
            </div>
          </div>

          <div class="focus-card__media">
            <img 
              :src="mediaHelper.getUrl(focusTale.photo, 'tales', 'full') || undefined" 
              :alt="focusTale.title" 
              class="focus-card__image"
            />
          </div>
        </article>
      </section>

      <div class="tales-grid">
        <article v-for="tale in pillTales" :key="tale.taleId" class="grid-card">
          <div class="grid-card__inner">
            <div class="grid-card__media-wrap">
              <img 
                :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb') || undefined" 
                :alt="tale.title" 
                class="grid-card__image"
              />
            </div>
            <div class="grid-card-body">
              <div class="tale-card">
                <h2 class="tale-card__title tale-card__title--small">
                  <RouterLink :to="`/tale/${tale.slug}`" class="tale-card__link">{{ tale.title }}</RouterLink>
                </h2>
 
                <p class="tale-card__summary tale-card__summary--small">
                  {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
                </p>

                <div class="tale-card__meta">
                  <button class="tale-card__author-btn" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
                    {{ tale.creatorUsername }}
                  </button>
                  <span class="tale-card__dot"></span>
                  <time class="tale-card__date">{{ toRelativeTime(tale.createdAt) }}</time>
                  <span class="tale-card__dot"></span>
                  <span class="tale-card__read-time">{{ tale.readingTime }} Min Read</span>
                </div>
      
                <footer class="tale-card__footer">
                  <button 
                    class="tale-card__save-btn"
                    @click="engage.favorite(tale.engagement)"
                    :title="tale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                  >
                    <SvgIcons name="bookmark" /> 
                    <span>Add to Favorites</span>
                  </button>
                  <RouterLink class="btn btn--secondary" :to="`/tale/${tale.slug}`">View Tale</RouterLink>
                </footer>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <aside class="sidebar">
      <!-- Top Categories -->
      <div class="sidebar-block">
        <header class="sidebar-block__header">Top Categories</header>
        <div class="sidebar-block__content">
          <article v-for="category in homepageStore.categories" :key="category.category" class="discovery-card">
            <h3 class="discovery-card__title">
              <span class="discovery-card__symbol">#</span>{{ CategoryDescriptions[category.category] }}
            </h3>
            <div class="discovery-card__actions">
              <RouterLink 
                :to="`/tales?category=${category.category}`" 
                class="discovery-card__link" 
                :class="{ 'discovery-card__link--disabled': category.talesCounter === 0 }"
                title="Filter Tales"
              >
                <span class="discovery-card__metric">{{ formatCounts(category.talesCounter) }}</span>
                <span class="discovery-card__label">Tales&rarr;</span>
              </RouterLink>
              <button 
                type="button" 
                class="btn btn--primary btn--outscribe"
                @click="modalStore.push('CreateTale', 'Create Tale', { category: category.category })"
                title="OutScribe a new tale"
              >
                OutScribe
              </button>
            </div>
          </article>
        </div>
        <footer class="sidebar-block__footer">
          <RouterLink to="/categories" class="sidebar-block__footer-link">See All Categories</RouterLink>
        </footer>
      </div>

      <!-- Top Countries -->
      <div class="sidebar-block">
        <header class="sidebar-block__header">Top Countries</header>
        <div class="sidebar-block__content">
          <article v-for="country in homepageStore.countries" :key="country.country" class="discovery-card">
            <h3 class="discovery-card__title">
              <span class="discovery-card__symbol">#</span>{{ CountryDescriptions[country.country] }}
            </h3>
            <div class="discovery-card__actions">
              <RouterLink 
                :to="`/tales?country=${country.country}`" 
                class="discovery-card__link" 
                :class="{ 'discovery-card__link--disabled': country.talesCounter === 0 }"
                title="Filter Tales"
              >
                <span class="discovery-card__metric">{{ formatCounts(country.talesCounter) }}</span>
                <span class="discovery-card__label">Tales&rarr;</span>
              </RouterLink>
              <button 
                type="button"
                class="btn btn--primary btn--outscribe" 
                @click="modalStore.push('CreateTale', 'Create Tale', { country: country.country })"
              >
                OutScribe
              </button>
            </div>
          </article>
        </div>
        <footer class="sidebar-block__footer">
          <RouterLink to="/countries" class="sidebar-block__footer-link">See All Countries</RouterLink>
        </footer>
      </div>

      <!-- Writers -->
      <div class="sidebar-block">
        <header class="sidebar-block__header sidebar-block__header--writers">
          <span>Writers</span>
          <div class="sidebar-block__selector">
            <button class="sidebar-block__tab" :class="{ 'sidebar-block__tab--active': isRecent }" :aria-pressed="isRecent" @click="isRecent = true">Recent</button>
            <button class="sidebar-block__tab" :class="{ 'sidebar-block__tab--active': !isRecent }" :aria-pressed="!isRecent" @click="isRecent = false">Popular</button>
          </div>
        </header>

        <div class="sidebar-block__content">
          <template v-if="isRecent">
            <article 
              v-for="writer in homepageStore.newWriters" 
              :key="writer.creator.accountId" 
              :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
              :class="{ 'discovery-card--disabled': getEngagementMetadata(writer.creator.engagement).isFavoriteDisabled }"
              @click="!getEngagementMetadata(writer.creator.engagement).isFavoriteDisabled && engage.favorite(writer.creator.engagement)"
              class="discovery-card"
            >
              <h3 class="discovery-card__title discovery-card__title--author">{{ writer.creator.username }}</h3>
              <div class="discovery-card__actions">
                <RouterLink 
                  :to="`/tales?username=${writer.creator.username}`" 
                  class="discovery-card__link" 
                  :class="{ 'discovery-card__link--disabled': writer.creator.talesCount === 0 }"
                  title="Filter Tales"
                >
                  <span class="discovery-card__metric">{{ formatCounts(writer.creator.talesCount) }}</span>
                  <span class="discovery-card__label">Tales&rarr;</span>
                </RouterLink>
                <button 
                  type="button" 
                  class="btn btn--primary btn--outscribe"
                  :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                  @click.stop="engage.favorite(writer.creator.engagement)"
                >
                  {{ getEngagementMetadata(writer.creator.engagement).favoriteAltText }}
                </button>
              </div>
            </article>
          </template>

          <template v-else>
            <article 
              v-for="writer in homepageStore.prolificWriters" 
              :key="writer.creator.accountId" 
              :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
              :class="{ 'discovery-card--disabled': getEngagementMetadata(writer.creator.engagement).isFavoriteDisabled }"
              @click="!getEngagementMetadata(writer.creator.engagement).isFavoriteDisabled && engage.favorite(writer.creator.engagement)"
              class="discovery-card"
            >
              <h3 class="discovery-card__title discovery-card__title--author">{{ writer.creator.username }}</h3>
              <div class="discovery-card__actions">
                <RouterLink 
                  :to="`/tales?username=${writer.creator.username}`" 
                  class="discovery-card__link" 
                  :class="{ 'discovery-card__link--disabled': writer.creator.talesCount === 0 }"
                  title="Filter Tales"
                >
                  <span class="discovery-card__metric">{{ formatCounts(writer.creator.talesCount) }}</span>
                  <span class="discovery-card__label">Tales&rarr;</span>
                </RouterLink>
                <button 
                  type="button" 
                  class="btn btn--primary"
                  :title="writer.creator.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
                  @click.stop="engage.favorite(writer.creator.engagement)"
                >
                  {{ getEngagementMetadata(writer.creator.engagement).favoriteAltText }}
                </button>
              </div>
            </article>
          </template>
        </div>
 
        <footer class="sidebar-block__footer">
          <RouterLink to="/writers" class="sidebar-block__footer-link">See All Writers</RouterLink>
        </footer>
      </div>
    </aside>
  </div>

  <div class="roadmap-section">
    <div class="roadmap-section__container">
      <div class="roadmap-section__header">
        <h3 class="roadmap-section__title">From Guest to OutScriber</h3>
        <p class="roadmap-section__subtitle">
          Start <button type="button" class="roadmap-section__action-trigger" @click="handleCreateDraftClick">OutScribing</button> in quick, simple steps.
        </p>
      </div>

      <div class="roadmap-section__grid">
        <div class="roadmap-card roadmap-card--step-one">
          <span class="roadmap-card__number">01</span>
          <div class="roadmap-card__content">
            <h4 class="roadmap-card__heading">Sign Up</h4>
            <p class="roadmap-card__description">Easily verify your identity via Google, Microsoft, Apple, or an email security token.</p>
          </div>
        </div>

        <div class="roadmap-card roadmap-card--step-two">
          <span class="roadmap-card__number">02</span>
          <div class="roadmap-card__content">
            <h4 class="roadmap-card__heading">Choose Handle</h4>
            <p class="roadmap-card__description">Choose your unique OutScribed username and secure password to access your account.</p>
          </div>
        </div>

        <div class="roadmap-card roadmap-card--step-three">
          <span class="roadmap-card__number">03</span>
          <div class="roadmap-card__content">
            <h4 class="roadmap-card__heading">Acknowledgement</h4>
            <p class="roadmap-card__description">Agree to platform publishing guidelines with a single check.</p>
          </div>
        </div>

        <div class="roadmap-card roadmap-card--step-four">
          <span class="roadmap-card__number">04</span>
          <div class="roadmap-card__content">
            <h4 class="roadmap-card__heading">Create A Draft</h4>
            <p class="roadmap-card__description">Get started with your story by selecting a category and a befitting title.</p>
          </div>
        </div>

        <div class="roadmap-card roadmap-card--step-five">
          <span class="roadmap-card__number">05</span>
          <div class="roadmap-card__content">
            <h4 class="roadmap-card__heading">Build Story</h4>
            <p class="roadmap-card__description">Use a rich text editor to write story. Complete basic information, reality check, and optional photo & tags.</p>
          </div>
        </div>

        <div class="roadmap-card roadmap-card--step-six">
          <span class="roadmap-card__number">06</span>
          <div class="roadmap-card__content">
            <h4 class="roadmap-card__heading">Go Live & Engage</h4>
            <p class="roadmap-card__description">Launch your tale to the network and start inviting others to experience your world!</p>
          </div>
        </div>
      </div>

      <div class="roadmap-section__footer">
        <span class="roadmap-section__prompt">Ready?</span>
        <button 
          type="button" 
          class="btn btn--secondary btn--prominent"
          @click="handleCreateDraftClick"
        >
          Start here
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

/* ==========================================================================
   1. HOMEPAGE HERO (Mesh Gradient Header)
   ================================================================---------- */
.homepage-hero {
  width: 100%;
  height: auto;
  position: relative;
  justify-content: center;
  display: flex;
  align-items: center;
  margin-top: -1px;
  background-color: @link-color;
  padding: 1rem;
  margin-bottom: 1rem;
  min-height: 400px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 85%;
    height: 85%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(
      circle, 
      rgba(119, 113, 214, 0.5) 0%, 
      rgba(54, 46, 189, 0.5) 45%, 
      rgba(28, 20, 167, 0) 75%
    );
    filter: blur(40px);
    will-change: transform, filter;

    @media (min-width: 768px) {
      width: 70%;
      height: 70%;
      filter: blur(70px);
    }
  }

  &__container {
    position: relative;
    height: auto;
    z-index: 1;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    max-width: 100%;
    color: @white-color;

    @media @smallDevice {
      width: 500px;
      padding: 2rem 0;
    }

    @media @largeDevice {
      width: 550px;
      padding: 2rem 0;
    }
  }

  &__brand-divider {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  &__line { 
    flex-grow: 1;
    height: 2px;
    background-color: @white-color;
  }

  &__logo-icon {
    height: auto;
    margin: 0 0.5rem;

    @media @smallDevice {
      width: 2.5rem;
    }
    @media @largeDevice {
      width: 3rem;
    }
  }

  &__title {
    font-weight: 900;
    text-transform: uppercase;
    border-bottom: 2px solid @white-color;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    text-align: center;

    @media @phone {
      font-size: 1.8rem;
      line-height: 2rem;
    }
    @media @phablet {
      font-size: 2.2rem;
      line-height: 2.4rem;
    }
    @media @largeDevice {
      font-size: 2.8rem;
      line-height: 3rem;
    }
  }

  &__explainer {
    font-weight: 500;
    font-size: 1.12rem;
    margin-bottom: 0.75rem;
    text-align: center;
  }

  &__cta-group {
    display: flex;
    justify-content: center;
    column-gap: 0.5rem;
    width: auto;
  }

  &__cta {
    height: 3rem;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    border-radius: 6px;
    font-weight: 900;
    text-transform: uppercase;
    font-size: clamp(1.1rem, 1.2vw + 1rem, 1.4rem);
    text-decoration: none;

    &--about {
      background-color: @white-color;
      color: @logo-red;
      &:hover {
        background-color: @logo-red;
        color: @white-color;
      }
    }
   
    &--join {
      background-color: @logo-red;
      color: @white-color;
      border: none;
      cursor: pointer;
      &:hover {
        background-color: @white-color;
        color: @logo-red;
      }
    }
  }
}

/* ==========================================================================
   2. TRENDING SECTION
   ================================================================---------- */
.trending-section {
  width: @max-width;
  max-width: calc(100% - 20px);
  margin: 1rem auto 2rem auto;

  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 0.75rem;
    color: @red-color;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  column-gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--light-background-color);
  border: 1px solid var(--border-color);
  color: var(--muted-text-color);
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6rem;
  height: 2rem;
  text-decoration: none;

  &:hover {
    background-color: var(--background-color);
    color: @link-color;
  }

  &__name {
    display: inline-flex;
    align-items: center;
  }

  &__symbol {
    font-size: 0.9rem;
    font-weight: normal;
  }

  &__metric {
    font-weight: 700;
  }
}

/* ==========================================================================
   3. MAIN LAYOUT CONTAINER & SIDEBAR
   ================================================================---------- */
.main-layout {
  width: @max-width;
  max-width: calc(100% - 20px);
  margin: 2rem auto;

  @media @largeDevice {
    display: flex;
  }

  &__content {
    @media @smallDevice {
      width: 100%;
    }
    @media @tablet {
      border-right: 1px solid var(--border-color);
      padding-right: 1rem;
      width: 64%;
    }
    @media @laptop {
      border-right: 1px solid var(--border-color);
      padding-right: 1rem;
      width: 70%;
    }
    @media @desktop {
      border-right: 1px solid var(--border-color);
      padding-right: 1rem;
      width: 77%;
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
  }
}

/* ==========================================================================
   4. FOCUS & PILL TALES CARDS
   ================================================================---------- */
.focus-section {
  width: 100%;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.focus-card {
  display: flex;

  @media @smallDevice, @tablet, @laptop {
    max-width: @mid-width;
    margin: 0 auto;
    row-gap: 1rem;
    flex-direction: column-reverse;
  }

  @media @desktop {
    column-gap: 1rem;
    justify-content: space-between;
  }

  &__content {
    display: flex;
    justify-content: center;

    @media @smallDevice, @tablet, @laptop {
      width: 100%;
    }
    @media @desktop {
      width: 32%;
    }
  }

  &__media {
    overflow: hidden;
    position: relative;

    @media @smallDevice, @tablet, @laptop {
      width: 100%;
    }
    @media @desktop {
      width: 68%;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  &:hover &__image {
    transform: scale(1.02);
  }
}

.tales-grid {
  display: grid;
  gap: 10px;
   
  @media @smallDevice, @tablet {
    grid-template-columns: repeat(1, 1fr);
  }
  @media @laptop {
    grid-template-columns: repeat(2, 1fr);
  }
  @media @desktop {
    grid-template-columns: repeat(3, 1fr);
  }
}

.grid-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2rem;

  @media @smallDevice, @tablet {
    width: 100%;
    max-width: @min-width;
    margin: 0 auto;
    &:last-child {
      border-bottom: none;
    }
  }

  &__media-wrap {
    width: 100%;
    aspect-ratio: 4/3;
    height: auto;
    background-color: var(--light-background-color);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.25s ease;
  }

  &:hover &__image {
    transform: scale(1.03);
  }
}

/* Reusable Tale Card Block */
.tale-card {
  width: 100%;
  height: auto;

  &__meta {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    z-index: 10;
    margin-bottom: 1rem;
  }

  &__author-btn {
    background: none;
    border: none;
    padding: 0;
    font-weight: 600;
    cursor: pointer;
    color: var(--link-color);
  }

  &__dot {
    /* Style for divider dots if applicable */
  }

  &__title {
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
    font-weight: normal;

    &--small {
      font-size: clamp(1.3rem, 5vw, 1.6rem);
      line-height: 1.2;
    }
    &--large {
      font-size: clamp(1.4rem, 5vw, 1.8rem);
      line-height: 1.2;
    }
  }

  &__link {
    text-decoration: none;
    color: var(--text-color);
    &:hover {
      color: var(--link-color);
    }
  }
     
  &__summary {
    margin-bottom: 1rem;
    color: var(--muted-text-color);

    &--small, &--large {
      font-size: clamp(0.95rem, 5vw, 1.1rem);
      line-height: 1.4;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    justify-content: space-between;
  }

  &__save-btn {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
    height: 40px;
    background: transparent;
    border: none;
    cursor: pointer;
  }
}

/* ==========================================================================
   5. SIDEBAR & DISCOVERY BLOCKS
   ================================================================---------- */
.sidebar {
  @media @smallDevice {
    width: 100%;
    padding-top: 1rem;
    margin-top: 1rem;
  }
  @media @tablet {
    width: 36%;
    padding-left: 1rem;
  }
  @media @laptop {
    width: 30%;
    padding-left: 1rem;
  }
  @media @desktop {
    width: 23%;
    padding-left: 1rem;
  }

  &__block {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.5rem;
    margin-bottom: 1.5rem;

    @media @smallDevice {
      width: @min-width;
      max-width: 100%;
      margin: 0 auto 1.5rem auto;
    }
  }
}

.sidebar-block {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 1.5rem;

  &__header {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
    
    &--writers {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__selector {
    display: flex;
    gap: 0.5rem;
  }

  &__tab {
    background: none;
    border: none;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    color: var(--muted-text-color);
    transition: color 0.2s ease;
    text-decoration: underline;

    &--active {
      color: var(--link-color);
      text-decoration: none;
      pointer-events: none;
    }

    &:hover:not(&--active) {
      color: var(--text-color);
      text-decoration: none;
    }
  }

  &__footer {
    text-align: center;
    margin-top: 1rem;
    padding: 1rem 0;
    border-top: 1px solid var(--border-color);
  }

  &__footer-link {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--link-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.discovery-card {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  &__title {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    font-weight: 600;

    &--author {
      font-size: 1.1rem;
    }
  }

  &__symbol {
    font-size: 0.9rem;
    font-weight: normal;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    column-gap: 0.25rem;
    text-decoration: none;
    color: var(--text-color);

    &--disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  &__metric {
    font-weight: 700;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    column-gap: 1rem;
    align-items: center;
  }
}

/* ==========================================================================
   6. PUBLISHING ROADMAP SECTION
   ================================================================---------- */
.roadmap-section {
  display: flex;
  flex-direction: column;
  padding: 2rem 0;

  &__container {
    width: @max-width;
    max-width: calc(100% - 20px);
    margin: 0 auto;

    @media @largeDevice {
      padding: 2.5rem 2rem;
    }
  }

  &__header {
    text-align: center;
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--text-color);
    margin-bottom: 0.3rem;
  }

  &__subtitle {
    font-size: 0.95rem;
    color: var(--text-color);
    font-style: italic;
    margin-bottom: 1rem;
  }

  &__action-trigger {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    border-bottom: 1px dotted var(--text-color);

    &:hover {
      border-bottom: none;
    }
  }

  &__grid {
    display: grid;
    gap: 0.5rem;

    @media @smallDevice {
      grid-template-columns: 1fr;
    }
    @media @tablet {
      grid-template-columns: repeat(2, 1fr);
    }
    @media @laptop, @desktop {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  &__prompt {
    font-style: italic;
  }
}

.roadmap-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &--step-one {
    background-color: fade(@logo-red, 8%);
    border: 1px solid fade(@logo-red, 35%);
    .roadmap-card__number { background-color: @logo-red; color: @white-color; }
    .roadmap-card__heading { color: darken(@logo-red, 10%); }
  }
  &--step-two {
    background-color: fade(@logo-orange, 8%);
    border: 1px solid fade(@logo-orange, 35%);
    .roadmap-card__number { background-color: @logo-orange; color: @white-color; }
    .roadmap-card__heading { color: darken(@logo-orange, 15%); }
  }
  &--step-three {
    background-color: fade(@logo-yellow, 15%);
    border: 1px solid fade(@logo-yellow, 35%);
    .roadmap-card__number { background-color: darken(@logo-yellow, 20%); color: @white-color; }
    .roadmap-card__heading { color: darken(@logo-yellow, 10%); }
  }
  &--step-four {
    background-color: fade(@logo-purple, 8%);
    border: 1px solid fade(@logo-purple, 35%);
    .roadmap-card__number { background-color: @logo-purple; color: @white-color; }
    .roadmap-card__heading { color: @logo-purple; }
  }
  &--step-five {
    background-color: fade(@logo-green, 8%);
    border: 1px solid fade(@logo-green, 35%);
    .roadmap-card__number { background-color: @logo-green; color: @white-color; }
    .roadmap-card__heading { color: darken(@logo-green, 10%); }
  }
  &--step-six {
    background-color: fade(@link-color, 8%);
    border: 1px solid fade(@link-color, 35%);
    .roadmap-card__number { background-color: @link-color; color: @white-color; }
    .roadmap-card__heading { color: darken(@link-color, 15%); font-weight: 700; }
  }

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    font-weight: 700;
    font-size: 0.85rem;
    border-radius: 50%;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__heading {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
  }

  &__description {
    font-size: 0.85rem;
    color: var(--muted-text-color);
    margin: 0;
    line-height: 1.4;
  }
}
</style>