<script setup lang="ts">
import { type TaleDraftListDto } from '../types/TalesTypes';
import { TaleStatusDescriptions, CategoryDescriptions, CountryDescriptions, 
    TaleStatusClass } from '@/utils/descriptors'
import { toRelativeTime } from '@/utils/dateExtensions'
import { useModalStore } from '@/stores/modalStore'
import { useTaleDraftStore } from '../stores/TaleDraftStore';

import { computed } from 'vue'

const modalStore = useModalStore()
const taleStore = useTaleDraftStore();

// Declare compile-time parameter contract boundaries
interface Props {
  tale: TaleDraftListDto
}

const props = defineProps<Props>()

// --- VISUAL ROUTING AND MODAL EMULATORS ---
async function handleModalUpdate(type: string, title: string) {
  // 1. Tell the store: "This is the tale we are working on right now"
  taleStore.setActiveTale(props.tale);

  // 2. Launch the modal. The component doesn't need to await a response anymore!
  console.log(`Launching modal type: ${type} for active tale context.`);
   modalStore.push(type, title); 
}

</script>

<template>
      
  <article class="content-lists__card">
    <div class="shared__content-status">
      <span class="status-title">Status</span>
       <span :class=TaleStatusClass[tale.status]>
         {{ TaleStatusDescriptions[tale.status] }}
      </span>
    </div>

    <h1 class="content-lists__title">
      {{ tale.title }}
    </h1>

    <section class="content-lists__metadata">
        {{ toRelativeTime(tale.createdAt) }}
      <span class="divider circle"></span>
        {{ CategoryDescriptions[tale.category] }}
      
      <template v-if="tale.country">
        <span class="divider circle"></span>
         {{ CountryDescriptions[tale.country] }}
      </template>
    </section>

    <section class="content-lists__summary">
      <p v-if="tale.summary">{{ tale.summary }}</p>
      <p v-else class="shared__no-content">Your summary goes here</p>
    </section>

    <section class="btn-group">
      
      <template v-if="tale.status !== 'ArchivedByAdmin'">
        
        <template v-if="tale.status !== 'HiddenByAdmin' && tale.status !== 'HiddenByModeration'">
          
          <template v-if="tale.hasEngagement">
            <button class="btn primary" @click="handleModalUpdate('UpdateTaleAddendum', 'Addendum')">
              Addendum
            </button>
          </template>
          
          <template v-else>
            <button class="btn primary" @click="handleModalUpdate('UpdateTale', 'Update Tale Basic')">
              Basic
            </button>
            <button class="btn primary" @click="handleModalUpdate('UpdateTaleSummary', 'Update Tale Summary')">
              Summary
            </button>
            <button class="btn primary" @click="handleModalUpdate('UpdateTaleCountry', 'Update Tale Country')">
              Country
            </button>
            <button class="btn primary" @click="handleModalUpdate('UpdateTalePhoto', 'Update Tale Photo')">
              Photo
            </button>
            <button class="btn primary" @click="handleModalUpdate('UpdateTaleDetail', 'Update Tale Detail')">
              Detail
            </button>
          </template>

          <button class="btn primary" @click="handleModalUpdate('UpdateTaleWatchlist', 'Update Tale Watchlist')">
            Watchlist
          </button>
          <button class="btn primary" @click="handleModalUpdate('UpdateTaleTags', 'Update Tale Tags')">
            Tags
          </button>
        </template>

        <template v-if="tale.status === 'Created'">
          <button class="btn secondary" @click="handleModalUpdate('LaunchTale', 'Publish Tale')">
            Publish
          </button>
          <button class="btn secondary" @click="handleModalUpdate('DeleteTale', 'Delete Tale')">
            Delete
          </button>
        </template>

        <template v-else>
          <template v-if="tale.status === 'LaunchedByCreator' || tale.status === 'CertifiedByAdmin'">
            <button class="btn secondary" @click="handleModalUpdate('ArchiveTale', 'Archive Tale')">
              Archive
            </button>
          </template>

          <template v-if="tale.status === 'LaunchedToArchivedByCreator' || tale.status === 'CertifiedToArchivedByCreator'">
            <button class="btn secondary" @click="handleModalUpdate('UnarchiveTale', 'Unarchive Tale')">
              Unarchive
            </button>
          </template>

          <template v-if="tale.status !== 'HiddenByAdmin' && tale.status !== 'HiddenByModeration'">
            <router-link :to="`/insight/${tale.slug}`" class="btn secondary">
              Go To Page
            </router-link>
          </template>
        </template>

      </template>

      <button class="btn secondary" @click="handleModalUpdate('TalePreview', 'Preview Tale')">
        Preview
      </button>

    </section>
  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/content-lists.less";
</style>