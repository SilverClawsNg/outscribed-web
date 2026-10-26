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
            <router-link to="/logout" class="main-header__utility-link">logout</router-link>
          </template>
          <template v-else>
            <span class="main-header__auth-prompt">
              Get Started. 
              <router-link to="/login" class="main-header__editorial-link" @click="isMenuOpen = false">Log In</router-link>
              or 
              <router-link to="/register" class="main-header__auth-btn main-header__auth-btn--highlight" @click="isMenuOpen = false">Sign Up</router-link>
            </span>
          </template>
        </div>

        <!-- Slot B: Mobile Menu Toggle Button (Mobile Left) -->
        <button 
          class="main-header__menu-toggle" 
          :class="{ 'main-header__menu-toggle--active': isMenuOpen }"
          aria-label="Toggle Navigation Menu"
          @click="isMenuOpen = !isMenuOpen"
        >
           <SvgIcons name="menu" :size="20" />
        </button>

        <!-- Slot C: Main Brand Anchor (Always Centered) -->
        <div class="main-header__brand-slot">
        <router-link to="/" class="main-header__brand-link" title="OutScribed Home">
            <SvgIcons name="logo" />
          </router-link>
        </div>

        <!-- Slot D: Quick Write Icon (Mobile Right) -->
          <button type="button" class="main-header__quick-write-btn" @click="handleCreateDraftClick">
             <SvgIcons name="edit" :size="20" />
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
              <SvgIcons name="user" /> Profile
            </router-link>
            <router-link to="/timelines" class="main-header__mobile-link" @click="isMenuOpen = false">
              <SvgIcons name="clock" /> Timeline
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login"  class="main-header__mobile-link" @click="isMenuOpen = false">
              <SvgIcons name="user" /> Log In
            </router-link>
            <router-link to="/register"  class="main-header__mobile-link main-header__mobile-link--highlight" @click="isMenuOpen = false">
             <SvgIcons name="archive" />  Sign Up For Free
            </router-link>
          </template>
          <div class="divider-multi"><span></span></div>
        </div>
       
        <div class="main-header__mobile-studio-group">
           <button type="button" class="main-header__mobile-cta-btn" @click="handleCreateDraftClick">
              <SvgIcons name="edit" /> Create Draft
            </button>
          <button type="button" @click="handleSavedDraftsClick" class="main-header__mobile-link">
            <SvgIcons name="archive" /> Saved Drafts
          </button>
          <router-link v-if="isLoggedIn" to="/logout" class="main-header__mobile-link main-header__mobile-link--logout" @click="isMenuOpen = false">
           <SvgIcons name="padlock" /> Logout
          </router-link>
        </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="less">
@import "@/assets/css/header.less";
</style>