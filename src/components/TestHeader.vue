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

<header class="test-header">

    <div class="top-header-wrapper">

     <div class="top-header">

        <div class="top-header__consolidated">

    <div class="top-header__brand-slot">
        <router-link to="/" class="top-header__brand-link" title="OutScribed Home">
            <SvgIcons name="logo"  />
          </router-link>
    </div>

      <div class="top-header__account-slot web-only">
          <template v-if="isLoggedIn">
            <router-link to="/profile" class="top-header__account-link">Profile</router-link>
            <span class="top-header__utility-divider">/</span>
            <router-link to="/timelines" class="top-header__account-link">Timeline</router-link>
            <span class="top-header__utility-divider">/</span>
            <router-link to="/logout" class="top-header__account-link">Logout</router-link>
          </template>
          <template v-else>
            <p class="top-header__auth-prompt">
              <span>Get Started. </span>
              <router-link to="/login" class="top-header__editorial-link" @click="isMenuOpen = false">Log In </router-link>
              <span>or </span>
              <router-link to="/register" class="top-header__auth-btn top-header__auth-btn--highlight" @click="isMenuOpen = false">Sign Up</router-link>
            </p>
          </template>
        </div>
        
        </div>

        <!-- Slot E: Studio Actions & Draft CTA (Desktop Right) -->
        <div class="top-header__studio-slot">

           <button type="button" @click="handleSavedDraftsClick" class="btn btn--primary web-only">
           Saved Drafts
           </button>

          <button 
              type="button" 
              class="btn btn--secondary btn--outscribe"
              @click="handleCreateDraftClick"
              title="OutScribe a new tale"
            >
            OutScribe
            </button>

            <button 
              class="top-header__menu-toggle mobile-only" 
              :class="{ 'top-header__menu-toggle--active': isMenuOpen }"
              aria-label="Toggle Navigation Menu"
              @click="isMenuOpen = !isMenuOpen"
            >
              <SvgIcons name="menu" :size="25" />
            </button>
        </div>

    </div>
    </div>

    <div class="nav-wrapper" :class="{ 'nav-wrapper--expanded': isMenuOpen }">

     <nav class="nav-header__editorial-links">
          <router-link to="/tales" class="nav-header__editorial-link" @click="isMenuOpen = false">
            <span class="web-only">Tales</span>
            <span class="mobile-only">Discover Tales</span>
          </router-link>
          <router-link to="/writers" class="nav-header__editorial-link" @click="isMenuOpen = false">
             <span class="web-only">Writers</span>
            <span class="mobile-only">Meet The Writers</span>
          </router-link>
          <router-link to="/faqs" class="nav-header__editorial-link" @click="isMenuOpen = false">
             <span class="web-only">About Us</span>
            <span class="mobile-only">Learn More About OutScribed</span>
          </router-link>
          <button type="button" class="nav-header__editorial-link" @click="handleSearchClick">
             <span class="web-only">Search</span>
            <span class="mobile-only">Search OutScribed</span>
          </button>

          <div class="mobile-only mobile-only--stretch">

            <div class="divider-multi"><span></span></div>

              <button type="button" class="nav-header__editorial-link nav-header__editorial-link--icon" @click="handleCreateDraftClick">
              <SvgIcons name="edit" :size="22" /> Create Draft
            </button>
          <button type="button" @click="handleSavedDraftsClick" class="nav-header__editorial-link nav-header__editorial-link--icon">
            <SvgIcons name="archive" :size="22" /> Saved Drafts
          </button>

            <div class="divider-multi"><span></span></div>
            
              <template v-if="isLoggedIn">
            <router-link to="/profile" class="nav-header__editorial-link nav-header__editorial-link--icon" @click="isMenuOpen = false">
              <SvgIcons name="user" :size="22" /> Profile
            </router-link>
            <router-link to="/timelines" class="nav-header__editorial-link nav-header__editorial-link--icon" @click="isMenuOpen = false">
              <SvgIcons name="clock" :size="22" /> Timeline
            </router-link>
              <router-link to="/logout" class="nav-header__editorial-link nav-header__editorial-link--icon" @click="isMenuOpen = false">
           <SvgIcons name="padlock" :size="25" /> Logout
          </router-link>
          </template>
          <template v-else>
            <router-link to="/login"  class="nav-header__editorial-link nav-header__editorial-link--icon" @click="isMenuOpen = false">
              <SvgIcons name="user" :size="22" /> Log In
            </router-link>
            <router-link to="/register"  class="nav-header__editorial-link nav-header__editorial-link--icon" @click="isMenuOpen = false">
             <SvgIcons name="archive" :size="22" />  Sign Up For Free
            </router-link>
          </template>

          </div>


        </nav>

    </div>

</header>

</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

.web-only{
  @media @smallDevice {
    display: none !important;
  }
}

.mobile-only{
  @media @largeDevice {
    display: none !important;
  }

  &--stretch{
    width: 100%;
  }
}

.test-header{
  position: fixed;
  z-index: 5000;
  background-color: var(--background-color);
  width: 100%;
  height: auto;
}

.top-header-wrapper{
 
  height: 60px;
  width: 100%;
  border-bottom: 1px solid var(--border-color);

}



.top-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  width: 1300px;
  max-width: calc(100% - 20px);
  //border-bottom: 1px solid var(--border-color);
  margin: 0 auto;

  &__consolidated{
    display: flex;
    align-items: center;
    gap: 2rem;
  }


  &__menu-toggle{
    border-radius: 4px;
    height: 2.5rem;
    display: flex;
align-items:center;
padding: 0 0.5rem;

 color: var(--text-color);
    background: var(--background-color);
    border: 2px solid var(--border-color);
    box-shadow: var(--box-shadow);
    background-color:@white-color;
    color:@black-color;

&:hover{
  color:@link-color;
  background-color: var(--light-background-color);
}
    
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
            height: 26px;
        }

        @media @largeDevice {
            height: 28px; /* Your desired height */
        }
    }
  }

    &__account-slot {
    grid-area: account;
    display: flex;
    align-items: center;
    gap: 0.5rem;

  }

  &__studio-slot {
    grid-area: studio;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
   
  }

}


.nav-wrapper{
  width: 100%;
  
  border-bottom: 1px solid var(--border-color);
   transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  @media @smallDevice {
      height: 0; // Collapsed on mobile
      overflow: hidden;
      
      &--expanded {
        height: calc(100lvh - 50px);
        overflow-y: auto;
      }
    }

    @media @largeDevice{
       height: 40px;
    }

}

nav.nav-header__editorial-links {
  display: flex;
  justify-content: center;
  align-items: center;
 
  margin: 0 auto;

  @media @smallDevice{
       flex-direction: column;
       width: 100%;

    }

   @media @largeDevice{
       height: 40px;
       width: @max-width;
       max-width: calc(100% - 20px);
    }
}

.nav-header__editorial-link {
  display: flex;
  align-items: center;
  width: 100%;
 
  //font-family: IBM Plex Mono, Arial, sans-serif;
  font-size: 1.1rem;
  font-weight: normal;
  line-height: 150%;
  text-transform: capitalize;
 

  


  &--icon{
    column-gap: 0.5rem;
  }
 

    @media @smallDevice{
      height: 3rem;
      padding: 0 0.5rem;
      font-size: 1.2rem;
       border-left: 5px solid transparent;

       &.router-link-exact-active {
     border-left-color: @link-color;
     pointer-events: none;
     opacity: 0.6;
    }
       
    }

   @media @largeDevice{
    height: 40px;
      justify-content: center;
        border-bottom: 3px solid transparent;

        &.router-link-exact-active {
      border-bottom-color: @link-color;
      pointer-events: none;
       opacity: 0.6;
      }

     border-right: 1px solid var(--border-color);
        &:first-child {
    border-left: 1px solid var(--border-color);
    
  }
    }

    &:hover{
      background-color:var(--light-background-color);
      color:@link-color;
    }

}


</style>