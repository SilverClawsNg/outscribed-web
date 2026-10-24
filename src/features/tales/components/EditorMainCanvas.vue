<script setup lang="ts">
import { computed, markRaw } from 'vue'
import { useTaleDraftStore } from '@/features/tales/stores/TaleDraftStore'; 
import PageStatusMessage from '@/components/PageStatusMessage.vue'

import BasicInfoForm from '../forms/BasicInfoForm.vue'
import PhotoUploaderForm from '../forms/PhotoUploaderForm.vue'
import TagsManagerForm from '../forms/TagsManagerForm.vue'
import StoryEditorForm from '../forms/StoryEditorForm.vue'
import RealityCheckForm from '../forms/RealityCheckForm.vue'
import EditorConfirmationForm from '../forms/EditorConfirmationForm.vue';
import AddendumManager from '../forms/AddendumManager.vue';
import StoryPreviewComponent from './StoryPreviewComponent.vue';
import EditorHelpComponent from './EditorHelpComponent.vue';
import TaleMetricsComponent from './TaleMetricsComponent.vue';
import SnapshotListModal from '@/features/engagements/modals/SnapshotListModal.vue';

const taleStore = useTaleDraftStore()

</script>

<template>

     <template v-if="taleStore.currentMainView === 'basic'">

        <BasicInfoForm />

    </template>

      <template v-else-if="taleStore.currentMainView === 'photo'">

        <PhotoUploaderForm />

    </template>

      <template v-else-if="taleStore.currentMainView === 'reality'">

        <RealityCheckForm />

    </template>

     <template v-else-if="taleStore.currentMainView === 'details'">

        <StoryEditorForm />

    </template>

    <template v-else-if="['publish', 'archive', 'delete'].includes(taleStore.currentMainView)">

        <!-- Simple Single-Checkbox Confirmation Forms -->
    <EditorConfirmationForm
      :mode="(taleStore.currentMainView as 'publish' | 'archive' | 'delete')"
    />

    </template>

      <template v-else-if="taleStore.currentMainView === 'tags'">

        <TagsManagerForm />

    </template>

    
      <template v-else-if="taleStore.currentMainView === 'addendum'">

        <AddendumManager />

    </template>

        <template v-else-if="taleStore.currentMainView === 'preview'">

        <StoryPreviewComponent />

    </template>

        <template v-else-if="taleStore.currentMainView === 'help'">

        <EditorHelpComponent />

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

      <template v-else>
            <PageStatusMessage
            title="No Component Selected!"
            message="No tale component has been selected. Select a component from the strip or the side menu"
            icon="inbox"
            :is-standalone="true" />
            </template>

</template>


<style lang="less" scoped>
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