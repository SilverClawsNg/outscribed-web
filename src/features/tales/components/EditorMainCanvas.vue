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
import { useRouter, useRoute } from 'vue-router'
import { APIError } from '@/api/apiTypes.ts';

const taleStore = useTaleDraftStore()

const router = useRouter()
const route = useRoute()

// --- DEFINE PAGE FUNCTIONS ---
const currentPath = encodeURIComponent(route.fullPath)

function redirectToLogin() {
  router.push(`/login?returnUrl=${currentPath}`)
}

function openProblemDefinition() {
  taleStore.openModal(taleStore.loadingError ?? new APIError(500, 'Error Loading Drafts', 'Failed to retrieve drafts from server.'))
}

</script>

<template>

  <template v-if="taleStore.isInitializing">

            <div class="loader" role="status" aria-label="Initializing">
            <p class="loader__dot"></p>
            </div>

        </template>

        <template v-else-if="taleStore.loadingError">

            <PageStatusMessage 
            :title="taleStore.loadingError.title || 'Error Loading Drafts'" 
            :message="taleStore.loadingError.detail || 'An unexpected error occurred.'"
            icon="broken-chain"
            :is-standalone="true">
            <template v-if="taleStore.loadingError.status == 401" #actions>
                <button class="btn btn--primary"  @click="redirectToLogin">Login</button>
            </template>
                <template v-else-if="taleStore.loadingError.definition" #actions>
               <button class="btn btn--primary"  @click="openProblemDefinition"  >
            More Details
          </button>
                </template>
            </PageStatusMessage>

        </template>

         <template v-else-if="!taleStore.activeTale">

            <PageStatusMessage 
            title="No Draft Selected" 
            message="There are no active draft to update. Select a draft from the list or create a new one."
            icon="broken-chain"
            :is-standalone="true">
         
            </PageStatusMessage>

        </template>

     <template v-else-if="taleStore.currentMainView === 'basic'">

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

      <TaleMetricsComponent />

    </template>

      <template v-else>
            <PageStatusMessage
            title="No Component Selected!"
            message="No tale component has been selected. Select a component from the strip or the side menu"
            icon="inbox"
            :is-standalone="true" />
            </template>

</template>
