<!-- components/studio/TaleDisplayComponent.vue -->
<script setup lang="ts">
import { useTaleDraftStore } from '@/features/tales/stores/TaleDraftStore'; 
import SnapshotListModal from '@/features/engagements/modals/SnapshotListModal.vue';

const taleStore = useTaleDraftStore()

</script>

<template>

     <template v-if="taleStore.activeTale?.status == 'Created'">

          <PageStatusMessage
          title="Action Not Available"
          message="Daily metrics are available after your story has been published."
          type="warning"
          icon="warning"
          :is-standalone="true"
        >

         <template #actions>
            <button
              class="btn btn--primary"
              @click="taleStore.setCurrentMainView('preview')"
            >
              Preview
            </button>
              <button
              class="btn btn--secondary"
              @click="taleStore.setCurrentMainView('publish')"
            >
              Publish
            </button>
          </template>
        
        </PageStatusMessage>

    </template>

      <template v-else-if="taleStore.currentMainView === 'metrics'">

        <div class="snapshot-container">

          <h1 class="snapshot-container__title">Daily Metrics</h1>
          <p class="snapshot-container__description">

            These are records of the tale's daily engagements including views, reactions, comments, 
            saves, flags, and shares. Click on a row to view a breakdown of a day's engagements.
          </p>
          
        <SnapshotListModal :payload="taleStore.activeTale?.taleId" :is-editor="true"  />

        </div>

    </template>

</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";

.snapshot-container{
  width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;
  padding: 2rem 0;

   &__title {
      font-size: clamp(2.2rem, 5vw, 2.8rem);
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
    }

    &__description {
    color: var(--muted-text-color);
  }
}

</style>