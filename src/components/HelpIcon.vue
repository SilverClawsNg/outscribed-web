<script setup>
import { useModalStore } from '@/stores/modalStore'; // Adjust to your actual store import

const props = defineProps({
  topic: {
    type: String,
    required: true // e.g., "CreateAccount"
  },
  title: {
    type: String,
    default: 'Help Topics'
  }
});

const modalStore = useModalStore();

function openHelp() {
  modalStore.push('HelpTopics', props.title, props.topic);
}
</script>

<template>
  <button type="button" class="help-icon-btn" @click="openHelp" title="Click for help">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  </button>
</template>

<style scoped lang="less">
.help-icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  display: inline-flex;
  align-items: center;
  color: #6c757d;

  &:hover {
    color: #0d6efd;
  }
}
</style>