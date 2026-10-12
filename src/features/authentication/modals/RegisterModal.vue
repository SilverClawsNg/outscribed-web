<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import Register from '../components/RegisterComponent.vue'
import { useEngagement } from '@/composables/useEngagement';
const modalStore = useModalStore()
const { resumePendingAction } = useEngagement();

async function handleRegisterSuccess() {
  // 🎯 Simply drop the modal window visibility state frame.
  // The viewport background stays exactly where the user left off!
  modalStore.pop()
  await resumePendingAction(); // Automatically executes queued vote, save, or flag modal opening

}

function navigateToLogin() {
  modalStore.replace('Login', 'Log In') 
}

</script>

<template>
     <Register
        :is-page="false" 
        message="to become an OutScriber"
        @success="handleRegisterSuccess" 
        @log-in="navigateToLogin"
      />
</template>
