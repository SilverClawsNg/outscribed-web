<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import MainHeader from '@/components/MainHeader.vue'
import ModalContainer from '@/components/ModalContainer.vue'
import Alert from '@/components/Alert.vue'; // 👈 Import alert store

const route = useRoute()
const modalStore = useModalStore()
const currentHeaderClass = ref('state-neutral')

const handleHeaderClassChanged = (newClass: string) => {
  currentHeaderClass.value = newClass
}

// Automatically dismiss open modals on page navigation
watch(() => route.path, () => modalStore.closeAll())

</script>

<template>

  <div class="main-layout-wrapper">

    <Alert />

    <ModalContainer />
    
    <MainHeader @headerClassChanged="handleHeaderClassChanged" />

    <main class="main-layout" :class="currentHeaderClass">
      <RouterView />
    </main>

    <RouterLink to="/" title="Home" class="shared__site-icon">
      <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
    </RouterLink>

  </div>

</template>