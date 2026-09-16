<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import Login from '../components/LoginComponent.vue'
import { useEngagement } from '@/composables/useEngagement';
const modalStore = useModalStore()
const { resumePendingAction } = useEngagement();

async function handleLoginSuccess() {
  // 🎯 Simply drop the modal window visibility state frame.
  // The viewport background stays exactly where the user left off!
  modalStore.pop()
  await resumePendingAction(); // Automatically executes queued vote, save, or flag modal opening
}

function navigateToReset() {
  modalStore.push('ResetPassword', 'Reset Password') 
}

function navigateToRegister() {
  modalStore.push('RegisterUser', 'Create Account') 
}

</script>

<template>
     <Login
        :is-page="false" 
        message="Login is required to perform action"
        @success="handleLoginSuccess" 
        @forgot-password="navigateToReset"
        @create-account="navigateToRegister"
      />
</template>
