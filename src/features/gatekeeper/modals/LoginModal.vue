<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import Login from '../components/LoginComponent.vue'

const modalStore = useModalStore()

function handleLoginSuccess() {
  // 🎯 Simply drop the modal window visibility state frame.
  // The viewport background stays exactly where the user left off!
  modalStore.pop()
}

function navigateToReset() {
  modalStore.push('ResetPassword', 'Reset Password') 
}
</script>

<template>
     <Login
        :is-page="false" 
        @success="handleLoginSuccess" 
        @forgot-password="navigateToReset"
      />
</template>
