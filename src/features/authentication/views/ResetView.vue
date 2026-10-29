<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Reset from '../components/ResetComponent.vue'

const router = useRouter()
const route = useRoute()

// 1. Capture and normalize the returnUrl at the top level so all functions share it.
// This checks both casing variations and strips any accidental quotes.
const rawQueryReturn = route.query.returnUrl || route.query.returnurl;
const returnUrl = typeof rawQueryReturn === 'string' 
  ? rawQueryReturn.replace(/["']/g, '') 
  : null;

function handleResetSuccess() {
  // Grab the returnUrl query token if it exists (e.g., /login?returnUrl=/profile)
   router.replace({
    path: '/login',
    query: returnUrl ? { returnUrl } : undefined
  });

}

function navigateToLogin() {
  router.replace({
    path: '/login',
    query: returnUrl ? { returnUrl } : undefined
  });
}

</script>

<template>
      <Reset 
      :is-page="true" 
      @success="handleResetSuccess" 
      @log-in="navigateToLogin"
      />
</template>