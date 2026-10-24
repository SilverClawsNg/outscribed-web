<!-- components/studio/TaleMetricsModal.vue -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { useSnapshotStore } from '@/features/engagements/stores/SnapshotStore';
import { toLongDate, toShortDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useTaleDraftStore, type MainCanvasView } from '@/features/tales/stores/TaleDraftStore'; 

const snapshotStore = useSnapshotStore();
const snapshot = computed(() => snapshotStore.snapshot)
const taleStore = useTaleDraftStore()

const snapshotId = computed(() => taleStore.activeSnapshotId)

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

    if(!snapshotId.value) return;

  // 3. Fetch from store
  const { success, error } = await snapshotStore.loadSnapshot(snapshotId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving snapshots. Refresh page and try again.'
      );
  }
  }

  // No matter the result, stop loading
  isLoading.value = false

}

// Watch activeSnapshotId to trigger async loading on demand
watch(snapshotId, async (newId) => {
  if (!newId) {
    return
  }

 await initPage();
})

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})

function closeModal() {
  // 1. Reset TaleDraftStore ID state
  taleStore.closeSnapshotModal()
  // 2. Clear SnapshotStore cached detail model
  snapshotStore.snapshot = null
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && snapshot.value) {
    closeModal
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="snapshot"
      class="studio-modal-backdrop"
      @click="closeModal"
    >
      <div
        class="studio-modal"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="studio-modal__brand-ribbon"></div>

        <header class="studio-modal__header">
          <div class="studio-modal__meta">
            <span class="studio-modal__badge studio-modal__badge--success">{{ snapshot.totalCounts }} Total</span>
            <h2 class="studio-modal__title">{{ toShortDate(snapshot.date) }}</h2>
          </div>

          <button
            type="button"
            class="studio-modal__close"
            aria-label="Close metrics dialog"
            @click="closeModal"
          >
            <SvgIcons name="close" :size="30" />
          </button>
        </header>

        <main class="studio-modal__body">
          <div class="studio-modal__definition-card studio-modal__definition-card--success">
            <span class="studio-modal__section-label studio-modal__section-label--success"">Traffic & Activity</span>
            <dl class="metrics-grid">
              <div v-if="snapshot.viewsCount" class="metrics-pair"><dt>Views</dt><dd>{{ snapshot.viewsCount }}</dd></div>
              <div v-if="snapshot.authViewsCount" class="metrics-pair"><dt>Auth. Views</dt><dd>{{ snapshot.authViewsCount }}</dd></div>
              <div v-if="snapshot.commentsCount" class="metrics-pair"><dt>Comments</dt><dd>{{ snapshot.commentsCount }}</dd></div>
              <div v-if="snapshot.sharesCount" class="metrics-pair"><dt>Shares</dt><dd>{{ snapshot.sharesCount }}</dd></div>
              <div v-if="snapshot.favoritesCount" class="metrics-pair"><dt>Favorites</dt><dd>{{ snapshot.favoritesCount }}</dd></div>
              <div v-if="snapshot.flagsCount" class="metrics-pair"><dt>Reports</dt><dd>{{ snapshot.flagsCount }}</dd></div>
            </dl>
          </div>

          <div 
            v-if="
              snapshot.transformedPerspectivesCount || 
              snapshot.exposesRealitiesCount || 
              snapshot.sparksDebatesCount || 
              snapshot.missedCriticalContextsCount || 
              snapshot.lacksRealWorldRelevancesCount
            "
            class="studio-modal__definition-card studio-modal__definition-card--success"
          >
            <span class="studio-modal__section-label studio-modal__section-label--success">Story Impact Reactions</span>
            <dl class="metrics-grid">
              <div v-if="snapshot.transformedPerspectivesCount" class="metrics-pair"><dt>Perspectives Transformed</dt><dd>{{ snapshot.transformedPerspectivesCount }}</dd></div>
              <div v-if="snapshot.exposesRealitiesCount" class="metrics-pair"><dt>Reality Exposed</dt><dd>{{ snapshot.exposesRealitiesCount }}</dd></div>
              <div v-if="snapshot.sparksDebatesCount" class="metrics-pair"><dt>Debate Sparked</dt><dd>{{ snapshot.sparksDebatesCount }}</dd></div>
              <div v-if="snapshot.missedCriticalContextsCount" class="metrics-pair"><dt>Context Evaluated</dt><dd>{{ snapshot.missedCriticalContextsCount }}</dd></div>
              <div v-if="snapshot.lacksRealWorldRelevancesCount" class="metrics-pair"><dt>Real-World Relevance</dt><dd>{{ snapshot.lacksRealWorldRelevancesCount }}</dd></div>
            </dl>
          </div>
        </main>
      </div>
    </div>
  </Transition>
</template>

<style lang="less" scoped>
@import "@/assets/css/editor-modal.less";

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 0.5rem 0 0 0;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.metrics-pair {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;

  dt {
    font-weight: 500;
    color: var(--muted-text-color);
    margin: 0;
  }

  dd {
    font-weight: 700;
    color: var(--muted-text-color);
    margin: 0;
  }
}
</style>