<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import Register from '../components/RegisterComponent.vue'

const modalStore = useModalStore()

function handleRegisterSuccess() {
  // 🎯 Simply drop the modal window visibility state frame.
  // The viewport background stays exactly where the user left off!
  modalStore.pop()
}

</script>

<template>
     <Register
        :is-page="false" 
        @success="handleRegisterSuccess" 
      />
</template>
