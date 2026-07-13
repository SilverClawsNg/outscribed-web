<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useLoginHint } from '@/utils/authHelper'

// 1. Setup your services/stores
const modalStore = useModalStore()
const isLoggedIn = useLoginHint()

// 2. Define your component inputs and outputs (Props & Emits)
const emit = defineEmits<{
  (e: 'headerClassChanged', className: string): void
}>()

// 3. Replicate the HeaderState Enum using string values
type HeaderState = 'Neutral' | 'Public' | 'User'

const currentState = ref<HeaderState>('Neutral')

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
  currentState.value = 'Neutral'
  updateParent()
}

const TogglePublicMenu = () => {
  currentState.value = currentState.value === 'Public' ? 'Neutral' : 'Public'
  updateParent()
}

const ToggleUserMenu = () => {
  currentState.value = currentState.value === 'User' ? 'Neutral' : 'User'
  updateParent()
}

</script>

<template>

  <header class="main-header" id="main-header">

    <div class="main-header__wrapper" :class="activeStateClass">
      
      <section class="main-header__top-navigation-container">

        <section class="main-header__top-navigation">
          
          <div class="main-header__top-navigation-left">

            <button class="hamburger" @click="TogglePublicMenu">
              <div></div><div></div><div></div>
            </button>

            <button class="icon-btn" @click="ToggleUserMenu" aria-label="User Menu">
             <SvgIcons name="user" :size="20" />
            </button>

          </div>

          <div class="main-header__top-navigation-center">

            <h1 class="logo">
             <SvgIcons name="logo" />
            </h1>

          </div>

          <div class="main-header__top-navigation-right">

            <button class="btn primary" @click="modalStore.push('Search', 'Search Contents')">
               <SvgIcons name="search" :size="20" /> <span>Search</span>
            </button>

            <button class="btn secondary" @click="modalStore.push('CreateTale', 'Create Tale')">
              <SvgIcons name="edit" :size="20" /> <span>Spin-A-Tale</span>
            </button>

          </div>

        </section>

      </section>

      <section class="main-header__menu-container">

        <button href="#" class="close-all" @click="CloseMenu">X</button>

        <div class="main-header__menu">
          
          <nav class="main-header__public-menu">

            <RouterLink to="/" title="Home" @click="CloseMenu">Home</RouterLink>

            <RouterLink to="/tales" title="Tales" @click="CloseMenu">Tales</RouterLink>

            <RouterLink to="/insights" title="Insights" @click="CloseMenu">Insights</RouterLink>

            <RouterLink to="/comments" title="Comments" @click="CloseMenu">Comments</RouterLink>

            <RouterLink to="/writers" title="Writers" @click="CloseMenu">Writers</RouterLink>

            <RouterLink to="/faqs" title="FAQs" @click="CloseMenu">FAQs</RouterLink>
            
            <template v-if="isLoggedIn">

              <RouterLink to="/logout" @click="CloseMenu">Logout</RouterLink>

            </template>

            <template v-else>

              <RouterLink to="/login" title="Login" @click="CloseMenu">Login</RouterLink>

              <RouterLink to="/register" title="Register" @click="CloseMenu">Create Account</RouterLink>

            </template>

          </nav>

          <nav class="main-header__user-menu">

            <template v-if="isLoggedIn">

              <RouterLink to="/profile" title="Profile" @click="CloseMenu">Profile</RouterLink>

              <RouterLink to="/timelines" title="Timeline" @click="CloseMenu">Timeline</RouterLink>

              <RouterLink to="/tales/editor" title="Tale Drafts" @click="CloseMenu">Tales</RouterLink>

              <RouterLink to="/insights/editor" title="Insight Drafts" @click="CloseMenu">Insights</RouterLink>

              <RouterLink to="/comments/editor" title="Comment Drafts" @click="CloseMenu">Comments</RouterLink>

            </template>

            <template v-else>

              <p class="login-required-instruction">

                <RouterLink to="/login" title="Login" @click="CloseMenu">Login to view account</RouterLink>

                or

                <RouterLink to="/register" title="Register" @click="CloseMenu">Register in quick steps.</RouterLink>

              </p>

            </template>

          </nav>

        </div>

      </section>

    </div>

  </header>

</template>

<style lang="less" scoped>
   @import "../assets/css/header.less";
</style>