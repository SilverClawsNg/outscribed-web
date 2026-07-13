<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

import Login from '../components/LoginComponent.vue'

const router = useRouter()
const route = useRoute()

function handleLoginSuccess() {
  // Grab the returnUrl query token if it exists (e.g., /login?returnUrl=/profile)
  const destination = (route.query.returnUrl as string) || '/timelines'
  router.push(destination)
}

// 🗺️ DICTIONARY MAP: Easily scaled for any new features down the line
const CONTEXT_MESSAGES: Record<string, {message: string }> = {
  view_timelines: {
    message: 'Login to view your timeline'
  },
  view_profile: {
    message: 'Login to view and update your profile'
  },
  my_tales: {
    message: 'Login to view your tales engagements'
  },
  my_insights: {
    message: 'Login to view your insights engagements'
  },
   my_comments: {
    message: 'Login to view your comments engagements'
  },
   my_users: {
    message: 'Login to view your followers and follows'
  },
  create_tales: {
    message: 'Login to create and update your tales'
  },
  create_insights: {
    message: 'Login to create and update your insights'
  },
  create_comments: {
    message: 'Login to create and update your comments'
  },
  archived_tales: {
    message: 'Login to view archived tales'
  },
  archived_insights: {
    message: 'Login to view archived insights'
  },
  session_expired: {
    message: 'Your session has timed out. Please sign in again to save your current work.'
  }
}

// 🎯 DYNAMIC RENDERING: Read from query parameters or fallback to default message layout
const activeContext = computed(() => {
const contextKey = route.query.context as string
  
  return CONTEXT_MESSAGES[contextKey] || null
})

</script>

<template>
      <Login 
      :is-page="true" 
      :message="activeContext?.message"
      @success="handleLoginSuccess" 
      />
</template>