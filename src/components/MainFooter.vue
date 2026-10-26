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

    <div class="divider-multi divider-multi--thick"><span></span></div>

      <!-- Navigation Columns -->
      <div class="footer-nav">
        <div class="nav-column">
          <h3 class="nav-column__title">Explore</h3>
          <ul class="nav-column__list">
            <li><router-link to="/tales">Browse Tales</router-link></li>
             <li><router-link to="/writers">Browse Writers</router-link></li>
            <li><button type="button" @click="modalStore.push('Search', 'Search')" >Search OutScribed</button></li>
            <li><button type="button" @click="modalStore.push('CreateTale', 'Create Tale')">Create A tale Draft</button></li>
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
      </div>

         <div class="divider-multi divider-multi--thick"><span></span></div>

      <!-- Bottom Bar: Copyright -->
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} OutScribed. All rights reserved.</p>
      </div>

    </div>
  </footer>
</template>
