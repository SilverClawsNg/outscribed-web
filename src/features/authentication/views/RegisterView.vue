<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Register from '../components/RegisterComponent.vue'

const router = useRouter()
const route = useRoute()
const returnUrl = route.query.returnUrl as string;

function handleRegisterSuccess() {
  // Grab the returnUrl query token if it exists (e.g., /login?returnUrl=/profile)
  const destination = returnUrl || '/timelines'
  router.push(destination)
}

function navigateToLogin() {
  router.replace({
    path: '/login',
    query: returnUrl ? { returnUrl } : undefined
  });
}

</script>

<template>
      <Register 
      :is-page="true" 
      @success="handleRegisterSuccess" 
      @log-in="navigateToLogin"
      />
</template>