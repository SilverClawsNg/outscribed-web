<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

import Login from '../components/LoginComponent.vue'

const router = useRouter()
const route = useRoute()
const returnUrl = route.query.returnUrl as string;

function handleLoginSuccess() {
  // Grab the returnUrl query token if it exists (e.g., /login?returnUrl=/profile)
  const destination = returnUrl || '/timelines'
  router.push(destination)
}

// 🗺️ DICTIONARY MAP: Easily scaled for any new features down the line
const CONTEXT_MESSAGES: Record<string, {message: string }> = {
  view_timelines: {
    message: 'to view your timeline'
  },
  view_profile: {
    message: 'to view and update your profile'
  },
  my_tales: {
    message: 'to view your tales engagements'
  },
 
   my_comments: {
    message: 'to view your comments engagements'
  },
   my_users: {
    message: 'to view your followers and follows'
  },
  create_tales: {
    message: 'to create and update your tales'
  },
 
  create_comments: {
    message: 'to create and update your comments'
  },
  archived_tales: {
    message: 'to view archived tales'
  },
  
  session_expired: {
    message: 'Your session has timed out. Please sign in again to save your current work.'
  },
  account_resolution: {
    message: 'Please sign in to resolve your account status.'
  }
}

// 🎯 DYNAMIC RENDERING: Read from query parameters or fallback to default message layout
const activeContext = computed(() => {
const contextKey = route.query.context as string
  
  return CONTEXT_MESSAGES[contextKey] || null
})


function navigateToReset() {
  router.replace({
    path: '/reset',
    query: returnUrl ? { returnUrl } : undefined
  });
}


function navigateToRegister() {
  router.replace({
    path: '/register',
    query: returnUrl ? { returnUrl } : undefined
  });
}

</script>

<template>
      <Login
      :is-page="true" 
      :message="activeContext?.message"
      @success="handleLoginSuccess" 
      @forgot-password="navigateToReset"
      @sign-up="navigateToRegister"
      />
</template>