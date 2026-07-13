<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Register from '../components/RegisterComponent.vue'

const router = useRouter()
const route = useRoute()

function handleRegisterSuccess() {
  // Grab the returnUrl query token if it exists (e.g., /login?returnUrl=/profile)
  const destination = (route.query.returnUrl as string) || '/timelines'
  router.push(destination)
}
</script>

<template>
      <Register 
      :is-page="true" 
      @success="handleRegisterSuccess" 
      />
</template>