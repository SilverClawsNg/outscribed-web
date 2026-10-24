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
  tale.value?.summary || 'Draft a compelling 2 to 3 sentence hook here. Imagine you are whispering an untold alternative perspective to a curious stranger—tease the systemic twist or historical pivot of your tale without giving away the entire narrative arc.'
)
const defaultFormattedProse = `
  <h1>The Day the Protocol Shifted: A Chronicle of What-Ifs</h1>
  
  <p>Every Tale on OutScribed begins with a spark of reality, projecting a trend or historical pivot to its logical extreme. Use this opening paragraph to establish your scene, ground your characters, and introduce the alternative timeline your readers are stepping into.</p>

  <h2>Section I: Deciphering the Rules of Engagement</h2>
  
  <p>As you build your narrative, take advantage of rich formatting to guide your reader's eye. You can emphasize key terminology using <strong>bold text</strong> for core arguments, or <em>italics</em> when highlighting subtle internal shifts in perspective.</p>

  <p>Ensure your narrative remains structured and easy to digest by breaking dense blocks of exposition into clean, readable sections. <em>Root-and-branch clarity</em> keeps your audience engaged from the first sentence to the last.</p>

  <blockquote>
    "Use blockquotes to spotlight pivotal dialogue, simulated policy statements, or satirical decrees that capture the ideological heartbeat of your alternate reality."
  </blockquote>

  <h2>Section II: Tactical Execution &amp; Editorial Directives</h2>

  <p>When outlining sequential events, step-by-step administrative reforms, or multi-phased alternate histories, ordered lists provide immediate structural clarity:</p>

  <ol>
    <li><strong>Initial Discovery:</strong> Introduce the inciting incident or policy trigger that sets your alternate reality into motion.</li>
    <li><strong>Framework Formalization:</strong> Dramatize how institutions, leaders, or ordinary citizens react to the emerging systemic shift.</li>
    <li><strong>Operational Rollout:</strong> Illustrate the long-term consequences, proving how fiction can illuminate real-world facts.</li>
  </ol>

  <p>You can also use unranked breakdowns to explore parallel implications, such as cultural adaptations, economic ripple effects, or behavioral transformations. <u>Underlined text</u> can highlight critical mandates, while <s>strikethroughs</s> can playfully demonstrate abandoned bureaucratic policies.</p>

  <ul>
    <li>Unranked operational vectors for tracking societal adaptation models.</li>
    <li>Quantitative narrative assessments of debate sparks and perspective shifts.</li>
    <li>Asynchronous synchronization across distributed editorial channels.</li>
  </ul>
`
// Reality Check fallbacks
const realityCheckTitle = computed(() => 
  'The Constitutional Mechanics of Impeachment Precedents'
)

const realityCheckSummary = computed(() => 
  tale.value?.realityCheckSummary?.trim() || 
  'Every OutScribed Tale must be anchored in verifiable truth. Use this Reality Check section to link credible news sources, legal statutes, or historical data that inspired your alternate-reality narrative.'
)
const storyProseHtml = computed(() => {
  const rawDetail = tale.value?.detail?.trim()
  return rawDetail && rawDetail !== '<p><br></p>' ? rawDetail : defaultFormattedProse
})

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
