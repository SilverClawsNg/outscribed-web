<!-- components/editor/EditorPreview.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useTaleDraftStore } from '../stores/TaleDraftStore'
import type { TaleDraftListDto } from '../types/TalesTypes';
import { calculateReadingTime } from '@/utils/readingTimeHelper';
import StoryContent from './StoryContentComponent.vue';

const taleStore = useTaleDraftStore()
const tale = computed(() => taleStore.activeTale as TaleDraftListDto);

const summaryText = computed(() => 
 tale.value?.summary || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
)

const defaultFormattedProse = `
  <h1>What in a heading is it that the men must come into town before the dusk walks back</h1>
  
  <p>Personal development can you send me an invite?, for fast track upstream selling. New economy feed the algorithm, what do you feel you would bring to the table if you were hired for this position, yet everyone thinks the soup tastes. We need to crystallize a plan translating our vision of having a market leading platform, for level the playing field proceduralize a better understanding of usage can aid in prioritizing future efforts.</p>

  <h2>Section I: Deciphering the Digital Signals</h2>
  
  <p>High touch client I'll book a meeting so we can solution this before the sprint is over. I just wanted to give you a heads-up. High touch client drive awareness to increase engagement win-win-win baseline service as core &amp; innovations as power makes our brand. You better eat a <strong>reality sandwich</strong> before you walk back in that boardroom let's put a pin in that.</p>

  <p>Translating our vision of having a market leading platform requires absolute alignment across all operational slices. <em>Baseline root-and-branch review</em>, but marketing, illustration baseline the procedure and samepage your department synergistic actionables.</p>

  <blockquote>
    "Streamline granularity, but how much bandwidth do you have, nor organic growth, but imagineer, nor can we jump on a zoom. Draft policy proposal sorry I was triple muted agile, nor granularity."
  </blockquote>

  <h2>Section II: Tactical Execution &amp; Community Directives</h2>

  <p>Pro-sumer software. Up the flagpole bazooka that run it past the boss jump right in and banzai attack will they won't they its all greek to me unless they bother until the end of time maybe vis a vis too many cooks over the line where.</p>

  <ol>
    <li><strong>Initial Discovery:</strong> This vendor is incompetent green technology and climate change. We can't hear you digital literacy drill down, yet can you run this by clearance?</li>
    <li><strong>Framework Formalization:</strong> Prairie dogging if you could do that, that would be great. Bob called an all-hands this afternoon overcome key issues to meet key milestones.</li>
    <li><strong>Operational Rollout:</strong> Three-martini lunch can we jump on a zoom, nor donuts in the break room, or UX cloud strategy, for agile, and finance.</li>
  </ol>

  <p>Shelfware roll back strategy pixel pushing. Vec. No scraps hit the floor let's circle back to that. Cross functional teams enable out of the box brainstorming translating our vision of having a market leading platform. <u>Underlined emphasis</u> and <s>deprecated structural points</s> help maintain editorial clarity.</p>

  <ul>
    <li>Unranked operational vector for audience engagement models.</li>
    <li>Quantitative assessment of debate sparks and perspective shifts.</li>
    <li>Asynchronous synchronization across distributed editorial channels.</li>
  </ul>
`

const storyProseHtml = computed(() => {
  const rawDetail = tale.value?.detail?.trim()
  return rawDetail && rawDetail !== '<p><br></p>' ? rawDetail : defaultFormattedProse
})

// Reality Check fallbacks
const realityCheckTitle = computed(() => 
  'Donald Trump was not impeached in his second tenure'
)

const realityCheckSummary = computed(() => 
  tale.value?.realityCheckSummary?.trim() || 
  'This vendor is incompetent green technology and climate change. We can\'t hear you digital literacy drill down, yet can you run this by clearance?'
)

// Supply placeholder values when draft fields are empty
const preparedPhoto = computed(() => tale.value.photo || '***placeholder***')
const preparedSummary = computed(() => tale.value.summary || summaryText.value)
const preparedBody = computed(() => tale.value.detail || storyProseHtml.value)
const preparedRealityCheckTitle = computed(() => tale.value.realityCheckTitle || realityCheckTitle.value)
const preparedRealityCheckSummary = computed(() => tale.value.realityCheckSummary || realityCheckSummary.value)

const readTimeText = computed(() => calculateReadingTime(preparedBody.value))

</script>

<template>
  <article class="story">
    <StoryContent 
      :title="tale.title"
      :date="tale.createdAt"
      :summary="preparedSummary"
      :photo="preparedPhoto"
      :photo-caption="tale.photoCaption"
      :content="preparedBody"
      :reading-time="readTimeText"
      :reality-check-title="preparedRealityCheckTitle"
      :reality-check-summary="preparedRealityCheckSummary"
      :reality-check-source="tale.realityCheckSource"
      :reality-check-url="tale.realityCheckUrl"
      :category="tale.category"
      :country="tale.country"
      :tags="tale.tags"
      :addendum="tale.addendum"
      :addendum-date="tale.addendumDate"
    />
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/rich-text.less";


.story {
  width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;
  padding: 3rem 0;
  background-color: var(--background-color);
}

</style>
