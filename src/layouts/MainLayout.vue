<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import MainHeader from '@/components/MainHeader.vue'
import ModalContainer from '@/components/ModalContainer.vue'
import Alert from '@/components/Alert.vue'; // 👈 Import alert store
import MainFooter from '@/components/MainFooter.vue'
import { useRouter } from 'vue-router'

const route = useRoute()
const modalStore = useModalStore()

// Automatically dismiss open modals on page navigation
watch(() => route.path, () => modalStore.closeAll())

</script>

<template>

  <div class="main-layout-wrapper">

    <Alert />

    <ModalContainer />
    
    <MainHeader />

    <main class="main-layout">
      <RouterView />
    </main>

    <MainFooter />

  </div>

</template>