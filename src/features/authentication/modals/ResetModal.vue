<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import Reset from '../components/ResetComponent.vue'

const modalStore = useModalStore()

function handleResetSuccess() {
  // 🎯 Simply drop the modal window visibility state frame.
  // The viewport background stays exactly where the user left off!
  //modalStore.pop()
   modalStore.replace('ResetPassword', 'Reset Password') 
}

function navigateToLogin() {
  modalStore.replace('Login', 'Log In') 
}

</script>

<template>
     <Reset
        :is-page="false" 
        message="to update your login details"
        @success="handleResetSuccess" 
        @log-in="navigateToLogin"
      />
</template>