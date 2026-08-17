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

<h4 class="writer-onboarding__instruction">
    Carefully read the following text and click on the "Continue" button at the bottom
    of the page to proceed to the next step of your writer onboarding
</h4>

<ol class="writer-onboarding__items">
    
<li>
    This section covers your liabilities as an OutScribed writer and includes;
 legal responsibilities, originality & attribution, comunity standards, 
 privacy & data use
</li>
<li>
    I declare that I am the author and sole owner of the content I submit, or that I have secured all 
    necessary permissions and licenses to publish it.
</li>
<li>
    I acknowledge that I am solely responsible for the content, opinions, and narratives expressed in my Tales, 
    Insights, and Comments and holds OutScribed harmless from any legal claims, 
    liabilities, or expenses arising from my published content.
</li>
<li>
    I understand that Outscribed is a platform for creative, issue-focused storytelling and not a venue for defamation, hate speech, or misinformation. 
    I agree not to publish content that: targets individuals with false or malicious statements, incites violence or illegal activity, or
deliberately misleads readers about facts (beyond the artistic framing of the Tale).
</li>
<li>
    I accept that OutScribed relies on community moderation. I understand that my content may be automatically hidden 
    if heavily flagged for violations, and that once engaged with by other users (via votes, comments, flags, or saves), 
    editing is permanently disabled to preserve the integrity of the discussion (though I retain the right to add Addendums or Archive the content).
</li>
</ol>

<div class="btn-holder">
    <button class="btn primary" @click="handleAcknowledgeAndClose">
        Continue
    </button>
</div>
  
</template>

<style lang="less" scoped>
@import "@/assets/css/writer-onboarding.less";
</style>