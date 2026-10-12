<script setup lang="ts">
    import SvgIcons from '@/components/SvgIcons.vue'
</script>

<!-- src/layouts/PlainLayout.vue -->
<template>
  <div class="plain-page">
    <div class="plain-page__card">
      <router-view />
    </div>
      
   <footer class="plain-footer">
       <div class="footer-brand">
       <SvgIcons name="logo" class="brand-logo" :size="25" />
      </div>
      <div class="footer-copyright">
      Copyright@2026 All. Rights Reserved.
      </div>
    </footer>
  </div>
</template>
