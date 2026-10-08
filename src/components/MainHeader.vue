<script setup lang="ts">
import { ref, computed,  onMounted, onUnmounted} from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useLoginHint } from '@/utils/authHelper'

// 1. Setup your services/stores
const modalStore = useModalStore()
const isLoggedIn = useLoginHint()
const isMenuOpen = ref(false)


function handleCreateDraftClick() {
  if (!isLoggedIn.value) modalStore.push('CreateTale', 'Create Tale')
}

// 2. Define your component inputs and outputs (Props & Emits)
const emit = defineEmits<{
  (e: 'headerClassChanged', className: string): void
}>()

// 3. Replicate the HeaderState Enum using string values
type HeaderState = 'Neutral' | 'Public' | 'User'

const currentState = ref<HeaderState>('Neutral')
  
const LARGE_MQ = '(min-width: 768px)' // match your @largeDevice

function isLargeDevice() {
  return typeof window !== 'undefined' && window.matchMedia(LARGE_MQ).matches
}

function applyDefaultForViewport() {
  // Only auto-open public when nothing user-driven is forcing User
  if (isLargeDevice()) {
    if (currentState.value !== 'User') {
      currentState.value = 'Public'
      updateParent()
    }
  } else {
    // Mobile: menus closed by default
    if (currentState.value === 'Public') {
      currentState.value = 'Neutral'
      updateParent()
    }
  }
}

// 4. Computed property (mirrors your C# switch statement switch expression)
const activeStateClass = computed(() => {
  switch (currentState.value) {
    case 'Public': return 'state-public-open'
    case 'User': return 'state-user-open'
    default: return 'state-neutral'
  }
})

// 5. Component Methods
const updateParent = () => {
  emit('headerClassChanged', activeStateClass.value)
}

const CloseMenu = () => {
  if (!isLargeDevice()) {
    currentState.value = 'Neutral'
    updateParent()
  } 
 
}

const TogglePublicMenu = () => {
  currentState.value = currentState.value === 'Public' ? 'Neutral' : 'Public'
  updateParent()
}

const ToggleUserMenu = () => {
  currentState.value = currentState.value === 'User' ? 'Neutral' : 'User'
  updateParent()
}


onMounted(() => {
  applyDefaultForViewport()
  const mq = window.matchMedia(LARGE_MQ)
  // modern browsers
  mq.addEventListener?.('change', applyDefaultForViewport)
  // fallback
  // mq.addListener?.(applyDefaultForViewport)
  onUnmounted(() => {
    mq.removeEventListener?.('change', applyDefaultForViewport)
  })
})

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
            <router-link to="/timeline" class="main-header__utility-link">Timeline</router-link>
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
          <button class="main-header__quick-write-btn" @click="modalStore.push('CreateTale', 'Create Tale')">
             <SvgIcons name="edit" :size="20" />
          </button>

        <!-- Slot E: Studio Actions & Draft CTA (Desktop Right) -->
        <div class="main-header__studio-slot">
           <router-link to="/tales/editor" class="main-header__utility-link">
           Saved Drafts
          </router-link>
         
          <button class="btn btn--secondary" @click="modalStore.push('CreateTale', 'Create Tale')">
            Create a Draft
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
          <router-link to="/search" class="main-header__editorial-link main-header__search-trigger" @click="isMenuOpen = false">
            <SvgIcons name="search" :size="20" />
            <span>Search</span>
          </router-link>
        </nav>

        <!-- Mobile Accordion Content (Slots A & E mirrored on Mobile Expand) -->
        <div class="main-header__mobile-account-group">
          <div class="main-header__mobile-section-label">Account</div>
           <template v-if="isLoggedIn">
            <router-link to="/profile" class="main-header__mobile-link" @click="isMenuOpen = false">
              <SvgIcons name="user" /> Profile
            </router-link>
            <router-link to="/timeline" class="main-header__mobile-link" @click="isMenuOpen = false">
              <SvgIcons name="clock" /> Timeline
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login"  class="main-header__mobile-link" @click="isMenuOpen = false">Log In</router-link>
            <router-link to="/register"  class="main-header__mobile-link main-header__mobile-link--highlight" @click="isMenuOpen = false">Sign Up For Free</router-link>
          </template>
        </div>

        <div class="main-header__mobile-studio-group">
           <button class="main-header__mobile-cta-btn" @click="modalStore.push('CreateTale', 'Create Tale')">
               <span>Create a Draft</span>
            </button>
          <router-link to="/drafts" class="main-header__mobile-link" @click="isMenuOpen = false">
            <SvgIcons name="archive" /> Saved Drafts
          </router-link>
          <router-link v-if="isLoggedIn" to="/logout" class="main-header__mobile-link main-header__mobile-link--logout" @click="isMenuOpen = false">
            Logout
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