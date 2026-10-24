<!-- components/studio/TaleDisplayComponent.vue -->
<script setup lang="ts">
import { APIError } from '@/api/apiTypes';
import type { TaleSnapshotListDto } from '@/features/engagements/types/EngagementTypes';
import { useSnapshotStore } from '@/features/engagements/stores/SnapshotStore';
import { useSnapshotFilterStore } from '@/features/engagements/stores/SnapshotFilterStore'; 
import { useTaleDraftStore, type MainCanvasView } from '@/features/tales/stores/TaleDraftStore'; 

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { toLongDate } from '@/utils/dateExtensions';

const taleStore = useTaleDraftStore()
const snapshotStore = useSnapshotStore();
const snapshotFilterStore = useSnapshotFilterStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const baseRoute = computed(() => `api/snapshots/tale/list/${taleStore.activeTale?.taleId}`)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // Build clean API path with endpoint URL and active filters
const apiPath = snapshotFilterStore.buildApiPath(baseRoute.value);

  // Set the base url for loadmore in list store
  snapshotStore.setBaseRoute(baseRoute.value)

  // 3. Fetch from store
  const { success, error } = await snapshotStore.loadTaleSnapshots(apiPath)

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

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})


// inside your HomeView.vue
onUnmounted(() => {
  snapshotStore.reset();
});









const emit = defineEmits<{
  (e: 'openMobileModal', item: TaleSnapshotListDto): void
}>()

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 640
}

function handleRowInteraction(item: TaleSnapshotListDto) {
  if (isMobile.value) {
    emit('openMobileModal', item)
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="table-container">
    <div class="table-responsive">
      <table class="tale-metrics-table">
        <thead>
          <tr>
            <th class="col-date">Date</th>
            <th class="col-total">Total</th>
            <th class="col-breakdown desktop-only">Daily Breakdown</th>
          </tr>
        </thead>
        
        <tbody>
          <tr
            v-for="item in snapshotStore.taleSnapshots"
            :key="item.id"
            :class="{ 
              'is-clickable': isMobile 
            }"
            :role="isMobile ? 'button' : undefined"
            :tabindex="isMobile ? 0 : undefined"
            :aria-label="isMobile ? 'View metric details for ' + item.date : undefined"
            @click="handleRowInteraction(item)"
            @keydown.enter="handleRowInteraction(item)"
          >
            <!-- DATE CELL -->
            <td class="col-date">{{ toLongDate(item.date) }}</td>

            <!-- TOTAL CELL -->
            <td class="col-total">
              <strong>{{ item.totalCounts }}</strong>
            </td>

            <!-- DESKTOP INLINE BREAKDOWN (>= 640px) -->
            <td class="col-breakdown desktop-only">
              <div class="metric-pills">
                <!-- General Traffic -->
                <span v-if="item.viewsCount" class="pill" title="Views">👁️ {{ item.viewsCount }}</span>
                <span v-if="item.commentsCount" class="pill" title="Comments">💬 {{ item.commentsCount }}</span>
                <span v-if="item.sharesCount" class="pill" title="Shares">🔗 {{ item.sharesCount }}</span>
                <span v-if="item.favoritesCount" class="pill" title="Favorites">⭐ {{ item.favoritesCount }}</span>

                <!-- 5 Specific Reaction Types -->
                <span v-if="item.transformedPerspectivesCount" class="pill pill--reaction" title="Perspective Shifted">
                  🧠 {{ item.transformedPerspectivesCount }}
                </span>
                <span v-if="item.exposesRealitiesCount" class="pill pill--reaction" title="Reality Exposed">
                  💡 {{ item.exposesRealitiesCount }}
                </span>
                <span v-if="item.sparksDebatesCount" class="pill pill--reaction" title="Debate Sparked">
                  🗣️ {{ item.sparksDebatesCount }}
                </span>
                <span v-if="item.missedCriticalContextsCount" class="pill pill--reaction" title="Context Evaluated">
                  🔍 {{ item.missedCriticalContextsCount }}
                </span>
                <span v-if="item.lacksRealWorldRelevancesCount" class="pill pill--reaction" title="Real-World Relevance">
                  ⚖️ {{ item.lacksRealWorldRelevancesCount }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/css/table.less";
@import "@/assets/css/variables.less";

.table-container{
 width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;
}

.tale-metrics-table {
 width: 100%;
  border-collapse: collapse;

  .desktop-only {
    display: none;

    @media (min-width: 640px) {
      display: table-cell;
    }
  }

  tr {
    &.is-clickable {
      cursor: pointer;

      &:hover {
        background-color: var(--color-bg-alt, #f8fafc);
      }
    }
  }

  .col-date {
    white-space: nowrap;
    font-size: @text-sm;
  }

  .col-total {
    font-size: @text-sm;
  }

  .metric-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;

    .pill {
      font-size: @text-xs;
      padding: 0.15rem 0.5rem;
      background-color: var(--color-bg-alt, #f1f5f9);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 4px;
      color: var(--text-color, #334155);

      &--reaction {
        background-color: rgba(147, 51, 234, 0.05);
        border-color: rgba(147, 51, 234, 0.2);
        color: @logo-purple;
        font-weight: 600;
      }
    }
  }
}
</style>