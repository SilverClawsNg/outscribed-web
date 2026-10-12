<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import SvgIcons from '@/components/SvgIcons.vue'

const route = useRoute()
const isError = ref(false)
const message = ref('')

onMounted(() => {
  const status = route.query.status as string
  message.value = (route.query.message as string) || ''

  if (status === 'error') {
    isError.value = true
  }

  // Optionally notify parent window immediately via PostMessage
  if (window.opener) {
    window.opener.postMessage({ type: 'OAUTH_RESPONSE', status, message: message.value }, '*')
  }

  // Automatically close popup window after a brief delay
  setTimeout(() => {
    window.close()
  }, isError.value ? 2500 : 500)
})
</script>


<!-- src/views/NotFoundView.vue -->
<template>
 
    <SvgIcons 
        :name="isError ? 'broken-chain' : 'check'" 
        class="plain-page__card--icon" 
      />
       <h1 class="plain-page__card--title"> {{ isError ? 'Authentication Failed' : 'Completing Sign-In...' }}</h1>
      <p class="plain-page__card--text">{{ message || 'You can close this window if it does not close automatically.' }}</p>

</template>
