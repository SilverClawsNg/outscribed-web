<script setup lang="ts">
import { computed, ref } from 'vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { useLoginHint } from '@/utils/authHelper'
import { useModalStore } from '@/stores/modalStore'
import { useAuthenticationStore } from '@/features/authentication/stores/AuthenticationStore';

import { useRouter } from 'vue-router'

// 1. Setup your services/stores
const modalStore = useModalStore()
const isLoggedIn = useLoginHint()
const authStore = useAuthenticationStore();
const router = useRouter()
const currentYear = computed(() => new Date().getFullYear())


function handleSavedDraftsClick() {
  if(!isLoggedIn.value || authStore.writerStatus === 'None'){
    modalStore.push('CreateTale', 'Create Tale')
  }
  else{
    router.push('/editor')
  }
}

</script>

<template>

  <footer class="site-footer">

    <div class="footer-container">
      
      <!-- Top Section: Brand & Disclaimer -->
      <div class="footer-top">
        
        <div class="brand-block">
              <div class="icon">
                <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
            </div>
          <div class="brand-block__logo">
           <h1 class="logo">
             <SvgIcons name="logo" />
           </h1>
             <p class="brand-block__tagline">The Facts, The Fiction, &amp; Everything In-between</p>
          </div>
        
        </div>

      <!--   <div class="disclaimer-block">
          <p>
            <strong>Editorial &amp; Satire Disclaimer:</strong> OutScribed features a mix of commentary, structural legal analysis, and allegorical fiction. Portions of content on this platform utilize alternate-reality narratives and artistic license to illuminate real-world legal principles. Unless explicitly designated as factual reporting, stories should be understood as fictional commentary rather than literal statements of fact.
          </p>
        </div> -->
      </div>

    <!--  <div class="divider-multi divider-multi--thick"><span></span></div> -->

    <div class="footer-bottom">
 <!-- Navigation Columns -->
      <nav class="footer-nav">
        <div class="nav-column">
          <h3 class="nav-column__title">Explore</h3>
          <ul class="nav-column__list">
            <li><router-link to="/tales">Browse Tales</router-link></li>
             <li><router-link to="/writers">Browse Writers</router-link></li>
            <li><button type="button" @click="modalStore.push('Search', 'Search')" >Search OutScribed</button></li>
            <li><button type="button" @click="modalStore.push('CreateTale', 'Create Tale')">Create A Draft</button></li>
          </ul>
        </div>

          <div class="nav-column">
          <h3 class="nav-column__title">Account</h3>
          <ul class="nav-column__list">
             <template v-if="isLoggedIn">
                <li><router-link to="/profile" class="main-header__utility-link">Profile</router-link></li>
                <li><router-link to="/timeline" class="main-header__utility-link">Timeline</router-link></li>
                 <li>
                     <button type="button" @click="handleSavedDraftsClick" class="main-header__utility-link">
                      Saved Drafts
                    </button>
                  </li>
            <li><router-link to="/logout">Log Out</router-link></li>
          </template>
          <template v-else>
             <li><router-link to="/login">Log In</router-link></li>
              <li><router-link to="/register">Sign Up</router-link></li>
          
          </template>
          
          </ul>
        </div>

        <div class="nav-column">
          <h3 class="nav-column__title">Legal &amp; Policy</h3>
          <ul class="nav-column__list">
            <li><router-link to="/terms-of-use">Terms of Use</router-link></li>
            <li><router-link to="/privacy-statement">Privacy Policy</router-link></li>
            <li><router-link to="/disclaimers">Satire &amp; Liability Disclaimer</router-link></li>
            <li><router-link to="/dmca-copyright-policies">DMCA / Copyright Policy</router-link></li>
            <li><router-link to="/writers-structural-guidelines">Writers' Structural Guidelines</router-link></li>
            <li><router-link to="/writers-liability-guidelines">Writers' Liability Guidelines</router-link></li>
          </ul>
        </div>

        <div class="nav-column">
          <h3 class="nav-column__title">Resources</h3>
          <ul class="nav-column__list">
            <li><router-link to="/faqs">About OutScribed</router-link></li>
            <li><router-link to="/contact-us">Contact &amp; Support</router-link></li>
          </ul>
        </div>
      </nav>

      <!-- Bottom Bar: Copyright -->
       <p class="copyright">&copy; {{ currentYear }} OutScribed. All rights reserved.</p>
    </div>

    </div>
  </footer>
</template>


<style scoped lang="less">
@import "@/assets/css/variables.less";


footer.site-footer {
  background-color: @link-color;
  border-top: 1px solid var(--border-color);
  padding: 2.5rem 0;
  font-size: 0.9rem;
  padding-bottom: 6rem;
  color:@white-color;
  background-image: url("@/assets/images/patterns-background(1).png");
  background-position-x: right;
  background-position-y: bottom;
  background-repeat: no-repeat;
  background-position: contain;
  
  @media @phone{
background-size: 40%;
  }

  .footer-container {
   
  max-width: calc(100% - 20px);
  margin: 0 auto;
   

    @media @smallDevice {
     width: @min-width;
    }

    @media @tablet {
       width: @mid-width;
    }

    @media @laptop {
       display: flex;
    column-gap: 1rem;
    align-items:center;
     width: @mid-width;
    }

     @media @desktop {
       display: flex;
    column-gap: 5rem;
    align-items:center;
     width: @max-width;
    }
  }

  .footer-top {
    
    display: flex;

     @media @smallDevice {
       justify-content:center;
       padding-bottom: 1rem;
       margin-bottom: 1rem;
       border-bottom: 1px solid @white-color;
    }
     @media @tablet {
       justify-content:center;
       padding-bottom: 1rem;
       margin-bottom: 1rem;
       border-bottom: 1px solid @white-color;
    }

    @media @laptop {
          align-items: stretch;
    }

     @media @desktop {
         align-items: stretch;
    }
  }

  .brand-block {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 0.75rem;
    row-gap: 1rem;
    text-align:center;
   
    & h1.logo{
      text-align:center;
      color:@white-color;

          & svg{
            width: 100%;
            height: auto;
            fill: @white-color;
          }
    }
      & .icon{
        margin-bottom: 0.5rem;

         img {
        height: 60px;
        width: auto;
      }
      }

    &__logo {
      margin-bottom: 0.5rem;
      }

    &__tagline {
      font-size: 0.85rem;
       text-align:center;
    }
  }

  .disclaimer-block {
    margin-bottom: 1.5rem;
    p {
      margin: 0;
      line-height: 1.5;
      font-size: 0.9rem;
    }

    strong {
      font-weight: 600;
    }
  }

  .footer-nav {
    display: grid;
    gap: 2rem;

    @media @smallDevice {
    grid-template-columns: repeat(1, 1fr);
    }

    @media @tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @media @laptop {
      grid-template-columns: repeat(2, 1fr);
    }

     @media @desktop {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .nav-column {
    &__title {
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    &__list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.6rem;
      }

      a, button {
        font-weight: 400;
        text-decoration: underline;
        color:@white-color;

        &:hover,
        &:focus {
          color: @white-color;
           text-decoration: none;
        }
      }
    }
  }

  .footer-bottom {
    width: auto;
  }

    p.copyright {
      font-size: 0.9rem;
      text-align:center;
      margin-top: 2rem;
      padding-top: 1rem;
      margin-top: 1rem;
      border-top: 1px solid @white-color;
    }
}

</style>
