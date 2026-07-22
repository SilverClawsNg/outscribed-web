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
<p>
    I declare that I am the author and sole owner of the content I submit, or that I have secured all 
    necessary permissions and licenses to publish it.
</p>
<p>
    I acknowledge that I am solely responsible for the content, opinions, and narratives expressed in my Tales, 
    Insights, and Comments and holds OutScribed harmless from any legal claims, 
    liabilities, or expenses arising from my published content.
</p>
<p>
    I understand that Outscribed is a platform for creative, issue-focused storytelling and not a venue for defamation, hate speech, or misinformation. 
    I agree not to publish content that: targets individuals with false or malicious statements, incites violence or illegal activity, or
deliberately misleads readers about facts (beyond the artistic framing of the Tale).
</p>
<p>
    I accept that OutScribed relies on community moderation. I understand that my content may be automatically hidden 
    if heavily flagged for violations, and that once engaged with by other users (via votes, comments, flags, or saves), 
    editing is permanently disabled to preserve the integrity of the discussion (though I retain the right to add Addendums or Archive the content).
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