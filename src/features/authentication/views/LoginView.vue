<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

import Login from '../components/LoginComponent.vue'

const router = useRouter()
const route = useRoute()

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

// 1. Capture and normalize the returnUrl at the top level so all functions share it.
// This checks both casing variations and strips any accidental quotes.
const rawQueryReturn = route.query.returnUrl || route.query.returnurl;
const returnUrl = typeof rawQueryReturn === 'string' 
  ? rawQueryReturn.replace(/["']/g, '') 
  : null;

// 2. Your reset and register navigations will now correctly forward it!
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

// 4. On successful login, use it as the destination (falling back to /timelines)
function handleLoginSuccess() {
  const destination = returnUrl || '/timelines';
  router.push(destination);
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