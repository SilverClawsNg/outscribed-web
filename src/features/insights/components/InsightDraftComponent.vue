<script setup lang="ts">
import { type InsightDraftListDto } from '../types/InsightsTypes';
import { InsightStatusDescriptions, CategoryDescriptions, CountryDescriptions, 
    InsightStatusClass } from '@/utils/descriptors'
import { toRelativeTime } from '@/utils/dateExtensions'
import { useModalStore } from '@/stores/modalStore'
import { useInsightDraftStore } from '../stores/InsightDraftStore';

import { computed } from 'vue'

const modalStore = useModalStore()
const insightStore = useInsightDraftStore();

// Declare compile-time parameter contract boundaries
interface Props {
  insight: InsightDraftListDto
}

const props = defineProps<Props>()

// --- VISUAL ROUTING AND MODAL EMULATORS ---
async function handleModalUpdate(type: string, title: string) {
  // 1. Tell the store: "This is the insight we are working on right now"
  insightStore.setActiveInsight(props.insight);

  // 2. Launch the modal. The component doesn't need to await a response anymore!
  console.log(`Launching modal type: ${type} for active insight context.`);
   modalStore.push(type, title); 
}

</script>

<template>
      
  <article class="content-lists__card">
    <div class="shared__content-status">
      <span class="status-title">Status</span>
       <span :class=InsightStatusClass[insight.status]>
         {{ InsightStatusDescriptions[insight.status] }}
      </span>
    </div>

    <h1 class="content-lists__title">
      {{ insight.title }}
    </h1>

    <section class="content-lists__metadata">
        {{ toRelativeTime(insight.createdAt) }}
      <span class="divider circle"></span>
        {{ CategoryDescriptions[insight.category] }}
      
      <template v-if="insight.country">
        <span class="divider circle"></span>
         {{ CountryDescriptions[insight.country] }}
      </template>
    </section>

    <section class="content-lists__summary">
      <p v-if="insight.summary">{{ insight.summary }}</p>
      <p v-else class="shared__no-content">Your summary goes here</p>
    </section>

    <section class="btn-group">
      
      <template v-if="insight.status !== 'ArchivedByAdmin'">
        
        <template v-if="insight.status !== 'HiddenByAdmin' && insight.status !== 'HiddenByModeration'">
          
          <template v-if="insight.hasEngagement">
            <button class="btn primary" @click="handleModalUpdate('UpdateInsightAddendum', 'Addendum')">
              Addendum
            </button>
          </template>
          
          <template v-else>
            <button class="btn primary" @click="handleModalUpdate('UpdateInsight', 'Update Insight Basic')">
              Basic
            </button>
            <button class="btn primary" @click="handleModalUpdate('UpdateInsightSummary', 'Update Insight Summary')">
              Summary
            </button>
            <button class="btn primary" @click="handleModalUpdate('UpdateInsightCountry', 'Update Insight Country')">
              Country
            </button>
            <button class="btn primary" @click="handleModalUpdate('UpdateInsightPhoto', 'Update Insight Photo')">
              Photo
            </button>
            <button class="btn primary" @click="handleModalUpdate('UpdateInsightDetail', 'Update Insight Detail')">
              Detail
            </button>
          </template>

          <button class="btn primary" @click="handleModalUpdate('UpdateInsightTags', 'Update Insight Tags')">
            Tags
          </button>
        </template>

        <template v-if="insight.status === 'Created'">
          <button class="btn secondary" @click="handleModalUpdate('LaunchInsight', 'Publish Insight')">
            Publish
          </button>
          <button class="btn secondary" @click="handleModalUpdate('DeleteInsight', 'Delete Insight')">
            Delete
          </button>
        </template>

        <template v-else>
          <template v-if="insight.status === 'LaunchedByCreator' || insight.status === 'CertifiedByAdmin'">
            <button class="btn secondary" @click="handleModalUpdate('ArchiveInsight', 'Archive Insight')">
              Archive
            </button>
          </template>

          <template v-if="insight.status === 'LaunchedToArchivedByCreator' || insight.status === 'CertifiedToArchivedByCreator'">
            <button class="btn secondary" @click="handleModalUpdate('UnarchiveInsight', 'Unarchive Insight')">
              Unarchive
            </button>
          </template>

          <template v-if="insight.status !== 'HiddenByAdmin' && insight.status !== 'HiddenByModeration'">
            <router-link :to="`/insight/${insight.slug}`" class="btn secondary">
              Go To Page
            </router-link>
          </template>
        </template>

      </template>

      <button class="btn secondary" @click="handleModalUpdate('InsightPreview', 'Preview Insight')">
        Preview
      </button>

    </section>
  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/content-lists.less";
</style>