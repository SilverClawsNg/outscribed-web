<script setup>
import { useModalStore } from '@/stores/modalStore';
import SvgIcons from './SvgIcons.vue';

const props = defineProps({
  topic: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Help Topics'
  },
  useIcon: {
    type: Boolean,
    default: false
  }
});

const modalStore = useModalStore();

function openHelp() {
  modalStore.push('HelpTopics', props.title, props.topic);
}
</script>

<template>
  <button 
    type="button" 
    class="help-icon-btn" 
    title="Click for help" 
    @click="openHelp"
  >
    <SvgIcons v-if="useIcon" name="help" :size="20" />
    <template v-else>Help?</template>
  </button>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

button.help-icon-btn {
  color: @link-color;
  background: transparent;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 3px 5px;

  &:hover {
    color: @link-alt-color;

     & svg{
      color: @link-alt-color;
    }
  }

  & svg{
    stroke-width: 2;
    color: var(--text-color);
  }
}
</style>