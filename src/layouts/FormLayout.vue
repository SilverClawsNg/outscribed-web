<script setup lang="ts">
import ModalContainer from '@/components/ModalContainer.vue'

import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'

const route = useRoute()
const modalStore = useModalStore()

watch(() => route.path, () => modalStore.closeAll())

</script>

<template>
 
  <ModalContainer />
  
  <div class="form-page">

    <main class="form-layout">

      <RouterView />
      <!-- Footer -->
    
      
    </main>
   <footer class="form-footer">
       <div class="footer-brand">
       <SvgIcons name="logo" class="brand-logo" :size="25" />
      </div>
      <div class="footer-links">
        <a href="/terms">Terms of Use</a>
        <a href="/privacy">Privacy</a>
        <a href="/disclaimers">Disclaimers</a>
       
      </div>
      <div class="footer-copyright">
      Copyright@2026 All. Rights Reserved.
      </div>
    </footer>
  </div>

</template>