<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore'
import Reset from '../components/ResetComponent.vue'

const modalStore = useModalStore()

function handleResetSuccess() {
  // 🎯 Simply drop the modal window visibility state frame.
  // The viewport background stays exactly where the user left off!
  modalStore.pop()
}

</script>

<template>
     <Reset
        :is-page="false" 
        @success="handleResetSuccess" 
      />
</template>