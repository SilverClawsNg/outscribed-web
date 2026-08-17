<script setup lang="ts">
// 1. Import your custom SVG icon registry we built earlier
import SvgIcons from '@/components/SvgIcons.vue'

// 2. Define your component parameters (Props)
defineProps<{
  title?: string
  message?: string
  isSuccess?: boolean
}>()
</script>

<template>

  <div class="page-status-message-container">

    <div class="page-status-message">

      <template  v-if="isSuccess === true">

       <SvgIcons name="check" />

      </template>

      <template  v-else>

       <SvgIcons name="broken-chain" />

      </template>

      <h1 v-if="title">{{ title }}</h1>
      
      <p v-if="message">{{ message }}</p>

      <div v-if="$slots.actions" class="actions">

        <slot name="actions" />
        
      </div>

    </div>

  </div>

</template>

<style lang="less" scoped>
   @import "../assets/css/page-status-message.less";
</style>