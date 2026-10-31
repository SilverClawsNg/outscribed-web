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
    router.push('/editor')
  }
      isMenuOpen.value = false;
}

function handleSearchClick() {
  modalStore.push('Search', 'Search')
  isMenuOpen.value = false;
}

</script>

<template>

  <header class="main-header">
    
    <!-- ==================================================================== -->
    <!-- UTILITY BAR (Level 1 Wrapper - 100% Width for Full Bleed Border)    -->
    <!-- ==================================================================== -->
    <div class="main-header__utility-bar-wrapper">

      <div class="main-header__utility-bar">
        
        <!-- Slot A: Account / Auth Status (Desktop Left) -->
        <div class="main-header__account-slot">
          <template v-if="isLoggedIn">
            <router-link to="/profile" class="main-header__utility-link">Profile</router-link>
            <span class="main-header__utility-divider">/</span>
            <router-link to="/timelines" class="main-header__utility-link">Timeline</router-link>
            <span class="main-header__utility-divider">/</span>
            <router-link to="/logout" class="main-header__utility-link">Logout</router-link>
          </template>
          <template v-else>
            <p class="main-header__auth-prompt">
              <span>Get Started. </span>
              <router-link to="/login" class="main-header__editorial-link" @click="isMenuOpen = false">Log In </router-link>
              <span>or </span>
              <router-link to="/register" class="main-header__auth-btn main-header__auth-btn--highlight" @click="isMenuOpen = false">Sign Up</router-link>
            </p>
          </template>
        </div>

        <!-- Slot B: Mobile Menu Toggle Button (Mobile Left) -->
        <button 
          class="main-header__menu-toggle" 
          :class="{ 'main-header__menu-toggle--active': isMenuOpen }"
          aria-label="Toggle Navigation Menu"
          @click="isMenuOpen = !isMenuOpen"
        >
           <SvgIcons name="menu" :size="25" />
        </button>

        <!-- Slot C: Main Brand Anchor (Always Centered) -->
        <div class="main-header__brand-slot">
        <router-link to="/" class="main-header__brand-link" title="OutScribed Home">
            <SvgIcons name="logo" />
          </router-link>
        </div>

        <!-- Slot D: Quick Write Icon (Mobile Right) -->
          <button type="button" class="main-header__quick-write-btn" @click="handleCreateDraftClick">
             <SvgIcons name="edit" :size="25" />
          </button>

        <!-- Slot E: Studio Actions & Draft CTA (Desktop Right) -->
        <div class="main-header__studio-slot">
           <button type="button" @click="handleSavedDraftsClick" class="main-header__utility-link">
           Saved Drafts
           </button>
         
          <button type="button" class="btn btn--secondary" @click="handleCreateDraftClick">
            OutScribe
          </button>
        </div>
   
      </div>
    </div>

    <!-- ==================================================================== -->
    <!-- PRIMARY NAV (Level 2 Wrapper - 100% Width Full-Bleed Border)        -->
    <!-- ==================================================================== -->
     <div class="main-header__primary-nav-wrapper" :class="{ 'main-header__primary-nav-wrapper--expanded': isMenuOpen }">
      <div class="main-header__primary-nav">
        <div class="main-header__primary-nav-inner">
          
         <!-- Slot F: Core Editorial Links -->
        <nav class="main-header__editorial-links">
          <router-link to="/tales" class="main-header__editorial-link" @click="isMenuOpen = false">Discover Tales</router-link>
          <router-link to="/writers" class="main-header__editorial-link" @click="isMenuOpen = false">Meet the Writers</router-link>
          <router-link to="/faqs" class="main-header__editorial-link" @click="isMenuOpen = false">Learn More About OutScribed</router-link>
          <button type="button" class="main-header__editorial-link main-header__search-trigger" @click="handleSearchClick">
            Search OutScribed
          </button>
        </nav>

        <!-- Mobile Accordion Content (Slots A & E mirrored on Mobile Expand) -->
        <div class="main-header__mobile-account-group">
          <div class="divider-multi"><span></span></div>
           <template v-if="isLoggedIn">
            <router-link to="/profile" class="main-header__mobile-link" @click="isMenuOpen = false">
              <SvgIcons name="user" :size="22" /> Profile
            </router-link>
            <router-link to="/timelines" class="main-header__mobile-link" @click="isMenuOpen = false">
              <SvgIcons name="clock" :size="22" /> Timeline
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login"  class="main-header__mobile-link" @click="isMenuOpen = false">
              <SvgIcons name="user" :size="22" /> Log In
            </router-link>
            <router-link to="/register"  class="main-header__mobile-link main-header__mobile-link--highlight" @click="isMenuOpen = false">
             <SvgIcons name="archive" :size="22" />  Sign Up For Free
            </router-link>
          </template>
          <div class="divider-multi"><span></span></div>
        </div>
       
        <div class="main-header__mobile-studio-group">
           <button type="button" class="main-header__mobile-cta-btn" @click="handleCreateDraftClick">
              <SvgIcons name="edit" :size="22" /> Create Draft
            </button>
          <button type="button" @click="handleSavedDraftsClick" class="main-header__mobile-link">
            <SvgIcons name="archive" :size="22" /> Saved Drafts
          </button>
          <router-link v-if="isLoggedIn" to="/logout" class="main-header__mobile-link main-header__mobile-link--logout" @click="isMenuOpen = false">
           <SvgIcons name="padlock" :size="25" /> Logout
          </router-link>
        </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

.main-header {
  position: fixed;
  //top: @body-top-offset;
  z-index: 5000;
  background-color: var(--background-color);
  width: 100%;
  box-shadow: var(--box-shadow);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  
  @media @smallDevice {
    top: @body-top-offset-small; // Pushes standard document flow down cleanly
  }

  @media @largeDevice {
    top: @body-top-offset-large; // Pushes standard document flow down cleanly
  }

  /* Full-Bleed Top Bar Wrapper */
  &__utility-bar-wrapper {
    width: 100%;
    border-bottom: 1px solid var(--border-color);
  }

  /* Utility Bar Container (1300px Max Width Constraint) */
  &__utility-bar {
    max-width: min(1300px, calc(100% - 20px));
    margin: 0 auto;
    display: grid;
    align-items: center;
    height: 56px;

    /* Grid layout */
    grid-template-columns: 1fr auto 1fr;
    grid-template-areas: "account brand studio";

    @media @smallDevice {
      grid-template-columns: 48px 1fr 48px;
      grid-template-areas: "toggle brand quick-write";
    }
  }

  /* Slots */
  &__account-slot {
    grid-area: account;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media @smallDevice { display: none; }
  }

  &__brand-slot {
    grid-area: brand;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__brand-link {
    display: flex;
    text-decoration: none;

     & svg {
        fill: var(--text-color);
        width: auto;

       @media @phone {
           height: 26px;
        }

         @media @phablet {
            height: 27px;
        }

         @media @tablet {
            height: 29px;
        }

        @media @largeDevice {
            height: 32px; /* Your desired height */
        }
    }
  }

  &__studio-slot {
    grid-area: studio;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1.25rem;

    @media @smallDevice { display: none; }
  }

  &__quick-write-btn {
    grid-area: quick-write;
    display: none;

    @media @smallDevice {
      display: flex;
      justify-content: flex-end;

      & svg{
        stroke-width: 2;
      }
    }
  }

  /* Menu Toggle Button (Dots) */
  &__menu-toggle {
    grid-area: toggle;
    display: none;
    background: none;
    border: none;
    padding: 0.5rem 0;
    cursor: pointer;
    flex-direction: column;
    gap: 3px;

    @media @smallDevice {
      display: flex;
      justify-content: flex-start;
    }
  }

  /* Utility Typography & Controls */
  &__utility-link {
    //font-size: 0.9rem;
    font-weight: 600;
    //color: var(--text-color);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;

    &:hover { color: @link-color; }

    &--logout {
      &:hover { color: @danger-color; }
    }
  }

  &__utility-divider {
    color: var(--border-color);
  }

  &__auth-prompt {
    display: flex;
    column-gap: 0.25rem;
    //font-size: 0.8125rem;
    color: var(--muted-text-color);
  }

  &__auth-btn {
    background: none;
    border: none;
    font-weight: 600;
    //color: var(--muted-text-color);
    cursor: pointer;
    text-decoration: underline;

    &--highlight { color: @link-color }
  }

  &__cta-btn {
    background-color: @link-color;
    color: var(--background-color);
    border: 1px solid var(--link-color);
    padding: 0.45rem 1rem;
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: 2px;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover { background-color: @link-alt-color; }
  }

  /* ==========================================================================
     PRIMARY NAV (100% Width Wrapper with Full-Bleed Border)
     ========================================================================== */
  &__primary-nav-wrapper {
    width: 100%;
    //border-bottom: 1px solid var(--border-color); // Full-bleed border across screen width
    display: grid;
    grid-template-rows: 1fr; // Expanded on desktop
    transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      //transition: padding-top 0.55s cubic-bezier(0.4, 0, 0.2, 1);
      background-color: var(--light-background-color);  
      background-color: var(--background-color);  

    @media @smallDevice {
      grid-template-rows: 0fr; // Collapsed on mobile
      
      &--expanded {
        grid-template-rows: 1fr;
        min-height: calc(100lvh - 56px);
      }
    }

    & svg{
      stroke-width: 2;
    }
  }

  /* Primary Nav Inner Container (1300px Constraint) */
  &__primary-nav {
  overflow: hidden;
  max-width: min(1300px, calc(100% - 20px));
  margin: 0 auto;
  width: 100%;
  padding: 0; // Absolutely zero padding on grid boundary

  @media @smallDevice {
    max-height: calc(100lvh - 56px);
    overflow-y: auto;
  }
}

/* Inner padding wrapper that smoothly collapses with grid-template-rows */
&__primary-nav-inner {

  @media @largeDevice {
    height: 42px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media @smallDevice {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.25rem 0; // Safe here because grid-template-rows wraps around it
  }
}
 

  /* Editorial Core Links */
  &__editorial-links {
    display: flex;
    align-items: center;
    height: 100%;

    @media @largeDevice {
      gap: 2.25rem;
    }

    @media @smallDevice {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.85rem;
    }
  }

  &__editorial-link {
    //font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.15s ease;
    height: 100%;
    display: flex;
    align-items:center;
    border-bottom: 2px solid transparent;
     //color:  var(--text-color);

     &.router-link-exact-active {
     border-bottom-color: var(--text-color);
     pointer-events: none;
    }


    &:hover { color: @link-color }

    
    @media @smallDevice{
     font-size: 1.2rem;
    }

    @media @largeDevice{
      color: var(--text-color);
    }
  
  }

  &__search-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: none;
    border: none;
    cursor: pointer;
  }

  /* Mobile Slide Down Accordion Slots */
  &__mobile-account-group,
  &__mobile-studio-group {
    display: none;

    @media @smallDevice {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
       font-size: 1.2rem;
      //padding-top: 1rem;
      //border-top: 1px solid var(--border-color);
    }
  }

  &__mobile-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    text-align: left;
    font-size: 0.9375rem;
    font-weight: 500;
    //color: var(--muted-text-color);
    text-decoration: none;
    padding: 0.2rem 0;

      @media @smallDevice{
     font-size: 1.2rem;
    }

    
  }

  &__mobile-cta-btn {
    text-align:left;
    font-weight:normal;
    display: flex;
    align-items: center;
    //justify-content: center;
    column-gap: 0.5rem;
    //background: var(--link-color);
    //color: var(--background-color);
    //border: none;
    //padding: 0.65rem;
    //font-weight: 700;
    //border-radius: 4px;
    //cursor: pointer;
  }
}
</style>