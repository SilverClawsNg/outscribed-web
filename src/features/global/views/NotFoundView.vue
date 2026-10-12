<script setup lang="ts">
import SvgIcons from '@/components/SvgIcons.vue'
</script>

<!-- src/views/NotFoundView.vue -->
<template>
 
    <SvgIcons 
        name='broken-chain'
        class="plain-page__card--icon" 
      />
       <h1 class="plain-page__card--title">404</h1>
      <p class="plain-page__card--text">The story, page, or resource you are looking for doesn't exist or has been moved.</p>

    <router-link to="/" class="btn btn--secondary plain-page__card--action">
      Return Home
    </router-link>
  
</template>
