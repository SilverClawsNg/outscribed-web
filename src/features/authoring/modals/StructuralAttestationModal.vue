<script setup lang="ts">
import { useAuthoringStore } from '../stores/AuthoringStore'
import { useModalStore } from '@/stores/modalStore'

const authoringStore = useAuthoringStore()
const modalStore = useModalStore()

function handleAcknowledgeAndClose() {
  // 🟢 Set the flag directly from this deep modal window context
  authoringStore.structureAcknowledged = true
  
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
    I understand that OutScribed is a niche publishing platform whose structure helps to maintain its
    uniqueness and importance as a effective information conveyance tool.
</li>
<li>
    I understand that an OutScribed Tale is an imaginative yet logically constructed narrative based on real-world events, 
    past trends, or future indicators. It is designed to clarify complex issues, reframe perspectives, and spark 
    constructive dialogue.
</li>
<li>
    I understand that the primary goal of an OutScribed Tale is to explore ideas, expose systemic issues, and 
    debate policies or proposals. 
</li>
<li>
    I understand that an OutScribed Tale aims to provide clarity, highlight societal and environmental issues, 
    evoke constructive conversations, and entertain while educating. They are tools for insight, not deception.
</li>
<li>
    I understand that an OutScribed Tale aims to preserve its integrity by adhering to real trends, data, or historical 
    patterns.
</li>
<li>
I understand that an OutScribed Tale's title can be compelling and descriptive without being deliberately 
misleading or sensationalized to evoke ragebait or clickbait.
</li>

<li>
I understand that an OutScribed Tale must include a Reality Check section at the end linking to one or more credible 
source articles that cover the real event or issue being explored. This anchors the Tale in truth.
</li>
<li>
I understand that an OutScribed Tale must maintain respectful, unprovocative language that encourages thoughtful 
community debate rather than incite hate speech, extreme violence, or harassment.
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