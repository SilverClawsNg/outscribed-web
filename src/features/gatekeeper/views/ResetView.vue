<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Reset from '../components/ResetComponent.vue'

const router = useRouter()
const route = useRoute()

function handleResetSuccess() {
  // Grab the returnUrl query token if it exists (e.g., /login?returnUrl=/profile)
  router.push('/login')
}
</script>

<template>
      <Reset 
      :is-page="true" 
      @success="handleResetSuccess" 
      />
</template>