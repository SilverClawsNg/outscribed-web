<script setup lang="ts">
import { ref, computed,  onMounted, onUnmounted} from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useLoginHint } from '@/utils/authHelper'
import { useAuthenticationStore } from '@/features/authentication/stores/AuthenticationStore';
import { useRouter } from 'vue-router'

// 1. Setup your services/stores
const modalStore = useModalStore()
const isLoggedIn = useLoginHint()
const isMenuOpen = ref(false)
const authStore = useAuthenticationStore();
const router = useRouter()

function handleCreateDraftClick() {
  modalStore.push('CreateTale', 'Create Tale')
  isMenuOpen.value = false;
}

function handleSavedDraftsClick() {
  console.log(`is-logged = ${isLoggedIn.value}. writer status = ${authStore.writerStatus}`)
  if(!isLoggedIn.value || authStore.writerStatus === 'None'){
    modalStore.push('CreateTale', 'Create Tale')
  }
  else{
    router.push('/studio')
  }
      isMenuOpen.value = false;
}

function handleSearchClick() {
  modalStore.push('Search', 'Search')
  isMenuOpen.value = false;
}

</script>

<template>
<header class="main-header-wrapper">
  <div class="main-header">

    <!-- 1. Isolated Brand Section (Left Anchor) -->
    <section class="main-header__brand-section">
      <button
        type="button"
        class="main-header__menu-toggle mobile-only"
        :class="{ 'main-header__menu-toggle--active': isMenuOpen }"
        aria-label="Toggle Navigation Menu"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <SvgIcons name="menu" :size="20" />
      </button>

      <router-link to="/" class="main-header__brand-link" title="OutScribed Home" @click="isMenuOpen = false">
        <img src="@/assets/images/icon.png" alt="OutScribed Icon" /> <SvgIcons name="logo" />
      </router-link>
    </section>

<!-- 2. Navigation Cluster (Desktop Inline Bar / Mobile Collapsible Drawer) -->
    <nav
      class="main-header__nav"
      :class="{ 'main-header__nav--open': isMenuOpen }"
      aria-label="Primary Navigation"
    >
      <div class="main-header__inner-nav">
        <section class="main-header__section main-header__features-section">
          <router-link to="/tales" class="main-header__link" @click="isMenuOpen = false">
            <span class="web-only">Tales</span>
            <span class="mobile-only main-header__mobile-label">
              <SvgIcons name="tale" :size="20" />
              <span>Discover Tales</span>
            </span>
          </router-link>

          <router-link to="/writers" class="main-header__link" @click="isMenuOpen = false">
            <span class="web-only">Writers</span>
            <span class="mobile-only main-header__mobile-label">
              <SvgIcons name="writers" :size="20" />
              <span>Meet The Writers</span>
            </span>
          </router-link>

              <button
            type="button"
            @click="handleSavedDraftsClick(); isMenuOpen = false"
            class="main-header__link mobile-only"
            title="Open Write Studio & saved drafts"
          >
            <span class="mobile-only main-header__mobile-label">
              <SvgIcons name="edit" :size="20" />
              <span>Your Write Studio</span>
            </span>
          
          </button>

          <button
            type="button"
            class="main-header__link mobile-only"
            @click="handleCreateDraftClick(); isMenuOpen = false"
            title="OutScribe a new tale"
          >
             <span class="mobile-only main-header__mobile-label">
              <SvgIcons name="openbox" :size="20" />
              <span>Create A New Tale</span>
            </span>
          
          </button>
        
          <router-link to="/about-us" class="main-header__link" @click="isMenuOpen = false">
            <span class="web-only">About Us</span>
            <span class="mobile-only main-header__mobile-label">
              <SvgIcons name="about" :size="20" />
              <span>About OutScribed</span>
            </span>
          </router-link>

          <button type="button" class="main-header__link web-only" @click="handleSearchClick">
            Search
          </button>
        </section>

        <section class="main-header__section main-header__account-section">
          <template v-if="isLoggedIn">
            <router-link to="/profile" class="main-header__link" @click="isMenuOpen = false">
              <span class="web-only">Profile</span>
              <span class="mobile-only main-header__mobile-label">
                <SvgIcons name="user" :size="20" />
                <span>Your Profile</span>
              </span>
            </router-link>

            <router-link to="/timelines" class="main-header__link" @click="isMenuOpen = false">
              <span class="web-only">Timeline</span>
              <span class="mobile-only main-header__mobile-label">
                <SvgIcons name="timeline" :size="20" />
                <span>Activity Timeline</span>
              </span>
            </router-link>

            <router-link to="/logout" class="main-header__link" @click="isMenuOpen = false">
              <span class="web-only">Logout</span>
              <span class="mobile-only main-header__mobile-label">
                <SvgIcons name="logout" :size="20" />
                <span>Log Out</span>
              </span>
            </router-link>
          </template>

          <template v-else>
            <router-link to="/login" class="main-header__link" @click="isMenuOpen = false">
              <span class="web-only">Log In</span>
              <span class="mobile-only main-header__mobile-label">
                <SvgIcons name="login" :size="20" />
                <span>Log In</span>
              </span>
            </router-link>

            <router-link to="/register" class="main-header__link" @click="isMenuOpen = false">
              <span class="web-only">Sign Up</span>
              <span class="mobile-only main-header__mobile-label">
                <SvgIcons name="register" :size="20" />
                <span>Create Account</span>
              </span>
            </router-link>
          </template>
        </section>

        <!-- Mobile-only discovery & search group inside expandable drawer -->
        <section class="main-header__section main-header__directory-section mobile-only">
          <button
            type="button"
            class="main-header__link"
            @click="handleSearchClick(); isMenuOpen = false"
          >
            <span class="main-header__mobile-label">
              <SvgIcons name="search" :size="20" />
              <span>Search</span>
            </span>
          </button>

          <router-link to="/categories" class="main-header__link" @click="isMenuOpen = false">
            <span class="main-header__mobile-label">
              <SvgIcons name="category" :size="20" />
              <span>Categories</span>
            </span>
          </router-link>

          <router-link to="/countries" class="main-header__link" @click="isMenuOpen = false">
            <span class="main-header__mobile-label">
              <SvgIcons name="globe" :size="20" />
              <span>Countries</span>
            </span>
          </router-link>

          <router-link to="/tags" class="main-header__link" @click="isMenuOpen = false">
            <span class="main-header__mobile-label">
              <SvgIcons name="tag" :size="20" />
              <span>Trending Tags</span>
            </span>
          </router-link>
        </section>


        <!-- Desktop write action pills -->
        <section class="main-header__section main-header__write-section web-only">
          <button
            type="button"
            @click="handleSavedDraftsClick"
            class="main-header__studio-link"
            title="Open Write Studio & saved drafts"
          >
            <SvgIcons name="edit" :size="15" />
            <span>Studio</span>
          </button>

          <button
            type="button"
            class="main-header__write-link"
            @click="handleCreateDraftClick"
            title="OutScribe a new tale"
          >
            OutScribe
          </button>
        </section>
      </div>
    </nav>

    <!-- 3. Tablet/Phablet Top-Bar Write Actions (Hidden on small phones via .no-show-phone) -->
    <section class="main-header__section main-header__write-section mobile-only">
      <button
        type="button"
        @click="handleSavedDraftsClick"
        class="main-header__studio-link no-show-phone"
        title="Open Write Studio & saved drafts"
      >
        <SvgIcons name="edit" :size="15" />
        <span>Studio</span>
      </button>

      <button
        type="button"
        class="main-header__write-link"
        @click="handleCreateDraftClick"
        title="OutScribe a new tale"
      >
        OutScribe
      </button>
    </section>

  </div>
</header>
</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

// Visibility helpers scoped to the 992px breakpoint
.web-only {
  @media @phone, @phablet, @tablet {
    display: none !important;
  }
}

.mobile-only {
  @media @laptop, @desktop {
    display: none !important;
  }
}

.no-show-phone {
  @media @phone {
    display: none !important;
  }
}

.main-header-wrapper {
  width: 100%;
  height: 50px;
  //border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5001;
  background-color: var(--background-color);
  background-color: #0d2d4d;
  background-color: @site-background-color;
}

.main-header {
  width: @max-width;
  max-width: calc(100% - 20px); // 1300px
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;

  @media @phone, @phablet, @tablet {
    column-gap: 0.4rem;
  }

  // 1. Left Anchor: Toggle + Logo
  &__brand-section {
    display: flex;
    align-items: center;
    column-gap: 0.65rem;
    flex-shrink: 0;
    min-width: 0;

    @media @phone, @phablet, @tablet {
      column-gap: 0.45rem;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    flex-shrink: 0;

    @media (max-width: 1120px) and (min-width: 993px) {
      column-gap: 0.65rem;
    }

    @media (max-width: 992px) {
      position: fixed;
      top: 50px;
      left: 0;
      right: 0;
      height: calc(100vh - 50px);
      background-color: @site-background-color;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;

      &--open {
        opacity: 1;
        pointer-events: auto;
      }

       & svg{
        fill: @white-color;
      }

    }
  }

  &__inner-nav {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    width: 100%;

    @media (max-width: 992px) {
      flex-direction: column;
      align-items: stretch;
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 0.5rem 12px 1.5rem;
      border-bottom: 1.6px solid @white-color;
    }
  }

  // Sub-groups inside __nav (and mobile top-bar write section)
  &__section {
    display: flex;
    align-items: center;
    column-gap: 0.85rem;
    flex-shrink: 0;

    @media @laptop {
      column-gap: 0.6rem;
    }

    // Vertical hairline dividers on desktop (> 992px)
    @media @laptop, @desktop {
      + .main-header__section {
        padding-left: 1rem;
        border-left: 1.6px solid var(--border-color);

        @media @laptop {
          padding-left: 0.65rem;
        }
      }
    }

    // Vertical stacking with horizontal dividers inside mobile drawer
    @media @phone, @phablet, @tablet {
      .main-header__nav & {
        flex-direction: column;
        align-items: stretch;
        row-gap: 0.15rem;

        + .main-header__section {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1.6px solid var(--border-color);
        }
      }
    }
  }

  // Mobile top-bar write actions (Studio icon + OutScribe pill)
  &__write-section.mobile-only {
    column-gap: 0.4rem;
  }

  // Standard navigation links & buttons
  &__link {
    white-space: nowrap;
    flex-shrink: 0;
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1;
    color: var(--heading-text-color);
    color:@white-color;
    text-decoration: none;
    background: none;
    border: none;
    padding: 0;
    font-size: inherit;
    font-family: inherit;
    cursor: pointer;
    transition: color 0.15s ease;

    &.router-link-active {
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-thickness: 1px;
    }

    @media @phone, @phablet, @tablet {
      width: 100%;
      text-align: left;
      padding: 0.65rem 0.25rem;
      line-height: 1.25;

      &.router-link-active {
        text-decoration: none;
        font-weight: 700;
      }
    }
  }

  // Mobile icon + text alignment wrapper
  &__mobile-label {
    display: inline-flex;
    align-items: center;
    column-gap: 0.7rem;

    svg {
      flex-shrink: 0;
      color: var(--heading-text-color);
    }
  }

  &__drawer-write-section {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    margin-top: 0.65rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color);

    .main-header__studio-link--drawer,
    .main-header__write-link--drawer {
      width: 100%;
      height: 38px;
      justify-content: center;
    }
  }

  // Studio pill (Full on desktop, compact icon-only square/circle on mobile)
  &__studio-link {
    white-space: nowrap;
    flex-shrink: 0;
    border-radius: 999999px;
    border: 1px solid var(--border-color);
    border: 1.6px solid @white-color;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    column-gap: 0.4rem;
    padding: 0 0.9rem;
    font-weight: 400;
    line-height: 1;
    color: var(--heading-text-color);
    color:@white-color;
    background: transparent;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;

    svg {
      flex-shrink: 0;
      stroke-width:1.6;
    }

  }

  // OutScribe gold CTA pill
  &__write-link {
    white-space: nowrap;
    flex-shrink: 0;
    background-color: #D99B00;
    background-color: #9dd2ff;
    background-color: #ffaa00;
    background-color: @link-color;
    //background-color: #9ecee5;

    height: 34px;
    padding: 0 1rem;
    border-radius: 999999px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: @black-color;
    color:@white-color;
    column-gap: 0.25rem;
    line-height: 1;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &::before {
      content: "+";
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
      transform: translateY(-1px);
      color: inherit;
    }

    @media @phone, @phablet, @tablet {
      height: 32px;
      padding: 0 0.7rem;
      font-size: 0.82rem;
      column-gap: 0.2rem;

      &::before {
        font-size: 1.1rem;
      }
    }
  }
}

.main-header {
  &__menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0;
    color: var(--heading-text-color);
    color:@white-color;
    cursor: pointer;
    flex-shrink: 0;
  }

  &__brand-link {
    display: inline-flex;
    align-items: center;
    color: var(--heading-text-color);
    color:@white-color;
    text-decoration: none;
    flex-shrink: 0;

    & img{
      width: 24px;
      height: auto;
      margin-right: 0.25rem;
    }
    
     & svg {
        width: auto;

       @media @phone {
           height: 22px;
        }

         @media @phablet {
            height: 24px;
        }

        @media @largeDevice {
            height: 26px;
        }
    }
  }
}


</style>