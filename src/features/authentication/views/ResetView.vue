<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Reset from '../components/ResetComponent.vue'

const router = useRouter()
const route = useRoute()
const returnUrl = route.query.returnUrl as string;

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