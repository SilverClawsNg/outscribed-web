<script setup lang="ts">
import { useAuthoringStore } from '../stores/AuthoringStore'
import { useModalStore } from '@/stores/modalStore'

const authoringStore = useAuthoringStore()
const modalStore = useModalStore()

function handleAcknowledgeAndClose() {
  // 🟢 Set the flag directly from this deep modal window context
  authoringStore.liabilityAcknowledged = true
  
  // Pop this modal off the stack to return back to the main layout checklist
  modalStore.pop()
}
</script>

<template>

<h4 class="instruct">
    Carefully read the following text and click on the "Continue" button at the bottom
    of the page to proceed to the next step of your writer onboarding
</h4>

<h3 class="modal-page-heading">The OutScribed Story Structure</h3>

<p>
    This section covers your liabilities as an OutScribed writer and includes;
 legal responsibilities, originality & attribution, comunity standards, 
 privacy & data use
</p>

<div class="btn-holder">
    <button class="btn primary" @click="handleAcknowledgeAndClose">
        Continue
    </button>
</div>
  
</template>

<style lang="less" scoped>
/* You can safely drop your layout timeline.less or unique home rules down here */
@import "@/assets/css/form-input.less";

</style>