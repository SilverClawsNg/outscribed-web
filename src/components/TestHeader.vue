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

<header class="main-header">

  <div class="sub-nav-wrapper web-only">

    <nav class="sub-nav">

        <router-link to="/about-us" class="sub-nav__link" @click="isMenuOpen = false">
         <SvgIcons name="about" :size="18" />  About Us
        </router-link>
        
        <button type="button" class="sub-nav__link"  @click="handleSearchClick">
         <SvgIcons name="search" :size="18" />  Search
        </button>
        <span class="divider divider--line"></span>
        <template v-if="isLoggedIn">
          <router-link to="/profile"  class="sub-nav__link">
            <SvgIcons name="user" :size="18" /> Profile
          </router-link>
         
          <router-link to="/timelines"  class="sub-nav__link">
            <SvgIcons name="timeline" :size="18" /> Timeline
          </router-link>
          <router-link to="/logout"  class="sub-nav__link">
            <SvgIcons name="logout" :size="18" /> Logout
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login" class="sub-nav__link" @click="isMenuOpen = false">
            <SvgIcons name="login" :size="18" />  Log In 
          </router-link>
          <router-link to="/register" class="sub-nav__link" @click="isMenuOpen = false">
            <SvgIcons name="register" :size="18" />  Sign Up
          </router-link>
        </template>


    </nav>

  </div>

  <div class="main-nav-wrapper">

    <div class="main-nav">

      <div class="main-nav__consolidated">

     <div class="main-nav__brand-slot">
        <button 
              class="main-nav__menu-toggle mobile-only" 
              :class="{ 'main-nav__menu-toggle--active': isMenuOpen }"
              aria-label="Toggle Navigation Menu"
              @click="isMenuOpen = !isMenuOpen"
            >
              <SvgIcons name="menu" :size="22" />
        </button>
        <router-link to="/" class="main-nav__brand-link" title="OutScribed Home">
            <SvgIcons name="logo"  />
        </router-link>
    </div>

      <button type="button" class="outscribe-link mobile-only" @click="handleCreateDraftClick"
        title="OutScribe a new tale">
        OutScribe
      </button>
      </div>

       <div class="main-nav__links-wrapper" :class="{ 'main-nav__links-wrapper--expanded': isMenuOpen }">
        
    <nav class="main-nav__links">
      <router-link  class="main-nav__link" to="/tales" @click="isMenuOpen = false">
        <SvgIcons name="tale" :size="22" />  Tales
      </router-link>
      <router-link  class="main-nav__link" to="/writers" @click="isMenuOpen = false">
       <SvgIcons name="writers" :size="22" />  Writers
      </router-link>
      <button  class="main-nav__link" type="button" @click="handleSavedDraftsClick">
        <SvgIcons name="edit" :size="22" />  Write Studio
      </button>

        <button type="button" class="outscribe-link web-only" @click="handleCreateDraftClick"
        title="OutScribe a new tale">
        OutScribe
      </button>

      <div class="divider-multi divider-multi--link mobile-only"><span></span></div>

         <template v-if="isLoggedIn">
          <router-link to="/profile"  class="main-nav__link mobile-only">
             <SvgIcons name="user" :size="22" /> Profile
            </router-link>
          <router-link to="/timelines"  class="main-nav__link mobile-only">
             <SvgIcons name="timeline" :size="22" /> Timeline
            </router-link>
          <router-link to="/logout"  class="main-nav__link mobile-only">
             <SvgIcons name="logout" :size="22" /> Logout
            </router-link>
        </template>
        <template v-else>
           <router-link to="/login" class="main-nav__link mobile-only" @click="isMenuOpen = false">
             <SvgIcons name="login" :size="22" /> Log In 
            </router-link>
          <router-link to="/register" class="main-nav__link mobile-only" @click="isMenuOpen = false">
             <SvgIcons name="register" :size="22" /> Sign Up
            </router-link>
        </template>

         <div class="divider-multi divider-multi--link mobile-only"><span></span></div>
        
        <router-link to="/about-us" class="main-nav__link mobile-only" @click="isMenuOpen = false">
        <SvgIcons name="about" :size="22" /> About Us
        </router-link>
        
          <router-link to="/faqs" class="main-nav__link mobile-only" @click="isMenuOpen = false">
           <SvgIcons name="help" :size="22" /> Frequently Asked Questions
          </router-link>
          <router-link to="/use-cases" class="main-nav__link mobile-only" @click="isMenuOpen = false">
            <SvgIcons name="usecase" :size="22" /> Use Cases
          </router-link>
      

         <div class="divider-multi divider-multi--link mobile-only"><span></span></div>
         
  <button type="button" class="main-nav__link mobile-only"  @click="handleSearchClick">
         <SvgIcons name="search" :size="22" /> Search
        </button>
          <router-link to="/categories" class="main-nav__link mobile-only" @click="isMenuOpen = false">
          <SvgIcons name="category" :size="22" />  Categories
          </router-link>
           <router-link to="/countries" class="main-nav__link mobile-only" @click="isMenuOpen = false">
            <SvgIcons name="globe" :size="22" /> Countries
          </router-link>
           <router-link to="/tags" class="main-nav__link mobile-only" @click="isMenuOpen = false">
            <SvgIcons name="tag" :size="22" /> Trending Tags
          </router-link>
     
    </nav>

      </div>

  </div>

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

.main-header{
  position: fixed;
  z-index: 5001;
   background-color: @link-background-color;
  width: 100%;
  height: auto;
  color:@white-color;
  
}

.sub-nav-wrapper{
  background-color: var(--background-color);
  width: 100%;
  height: 40px;
}

.sub-nav{
  height: 100%;
  width: @max-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items:center;
  column-gap: 1rem;

  &__link{
    color: var(--heading-text-color); 
    display: flex;
    align-items:center;
    column-gap: 0.25rem;

    & svg{
      stroke-width: 1.5;
    }
  }
}

.main-nav-wrapper{
  width: 100%;
}

.main-nav{
  width: @max-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;
  display: flex;
  padding: 0.5rem 0;
 height:60px;

   @media @smallDevice {
    height: auto;
    flex-direction: column;
  }

    @media @largeDevice{
     height: 60px;
      justify-content: space-between;
    }
  
  &__consolidated{
    display: flex;
    align-items: center;
    gap: 2rem;
     justify-content: space-between;
    
  }

  &__brand-slot{
    display: flex;
    column-gap: 0.5rem;
    align-items: center;
  }
   
  &__brand-link {
    display: flex;
    text-decoration: none;

     & svg {
        fill: @white-color;
        width: auto;

       @media @phone {
           height: 26px;
        }

         @media @phablet {
            height: 27px;
        }

        @media @largeDevice {
            height: 30px;
        }
    }
  }
   
  &__menu-toggle{
    height: 2.5rem;
    display: flex;
    align-items:center;
    padding: 0 0.5rem;
    color: @white-color;
    background-color:transparent;

    &:hover{
      opacity: 0.65;
    }
        
  }
 
  
&__links-wrapper{

  transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  @media @smallDevice {
      height: 0; // Collapsed on mobile
      overflow: hidden;
        width: 100%;
      
      &--expanded {
        height: calc(100lvh - 60px);
        overflow-y: auto;
      }
    }

    @media @largeDevice{
       height: 100%;
         width: auto;
    }

}

&__links{
  width: auto;
  display: flex;

  @media @smallDevice {
      flex-direction: column;
      row-gap: 0.25rem;
       padding: 0.75rem 0 5rem 0;
    
    }

    @media @largeDevice{
      height: 100%;
      column-gap: 0.25rem;
    }
}

  &__link{
    border-radius: 8px;
    background-color: @link-color;
    border: 2px solid @link-border-color;
    display: flex;
    align-items:center;
    
    padding: 0 0.75rem;
    color: @white-color;
    

     @media @smallDevice {
    height: 60px;
     width: 100%;
     row-gap: 0.5rem;

    }

    @media @largeDevice{
     height: 100%;
      width: 160px;
      column-gap: 0.5rem;
      justify-content: center;
    }

    &:hover {
      background-color: #273e63;
      color: @white-color;
    }

    & svg{
      stroke-width: 2;
    }

  }
}

.outscribe-link {
      background-color: #D99B00; // Swap to #2e4a75 or #f26522 if preferred
      border: 2px solid @link-border-color;
      
      font-weight: 700;
    display: flex;
    align-items:center;
    justify-content: center;
    padding: 0 0.75rem;
    color: @white-color;
    column-gap: 0.5rem;
     border-radius: 8px;

         @media @smallDevice {
    height: 40px;
     width: auto;
    }

    @media @largeDevice{
     height: 100%;
      width: 160px;
     
    }

      &:hover {
        //background-color: #E6A800;
        //color: @link-border-color;
        opacity:0.65;
      }

      &::before {
        content: "+";
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 20px;
        height: 100%;
        font-size: 1.6rem;
        font-weight: inherit;
        line-height: 1;
        //margin-top: -0.25rem;
        color:inherit;
        border-radius: 50%;
        transition: transform 0.2s ease;
      }
    }

</style>