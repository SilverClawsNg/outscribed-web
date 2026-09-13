<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageStatusMessage from '@/components/PageStatusMessage.vue';
import { useHomeStore } from '../stores/HomeStore'; 
import { toLongDate } from '@/utils/dateExtensions'
import { APIError } from '@/api/apiTypes';
import { useModalStore } from '@/stores/modalStore';
import type { TagDetailDto } from '../types/GlobalTypes';

const props = defineProps<{
  payload: unknown 
}>()

const tagId = computed(() => props.payload as string)

const homepageStore = useHomeStore();
const modalStore = useModalStore();

// --- Component Reactive State ---
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const tageDetail = ref<TagDetailDto | null>(null)

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  // 3. Fetch from store
  const { tag, success, error } = await homepageStore.loadTag(tagId.value)

  if (!success) {
    if (error) {
    loadingError.value = error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving tags. Refresh page and try again.'
      );
  }
  } else{
    tageDetail.value = tag
  }

  // No matter the result, stop loading
  isLoading.value = false

}

// --- MOUNT PAGE ---
onMounted(async () => {
  await initPage();
})


</script>

<template>
 
 <template v-if="isLoading">

   <div class="shared__page-title">
    <h1>Loading Tags... </h1>
      <p class="shared__loader"></p>
    </div>

  </template>

 <template v-else-if="loadingError">

    <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
    </PageStatusMessage>

  </template>

  <!-- Core Body View Template -->
  <template v-else-if="tageDetail">

    <dl>
      <dt>Date</dt>
      <dd>{{ toLongDate(tageDetail.createdAt) }}</dd>
    </dl>

     <dl>
      <dt>Last Updated</dt>
      <dd>{{ toLongDate(tageDetail.lastUpdatedAt) }}</dd>
    </dl>

    <dl>
      <dt>Name</dt>
      <dd>{{ tageDetail.name }}</dd>
    </dl>

    <dl>
      <dt>Slug</dt>
      <dd>{{ tageDetail.slug }}</dd>
    </dl>
 
    <dl>
      <dt>Tale</dt>
      <dd>{{ tageDetail.talesCounter }}
          <RouterLink 
          :to="`/tales?tag=${tageDetail.slug}`" 
          title="View Tales"
        >
          View Tales
        </RouterLink>
      </dd>
    </dl>
   
    <dl>
      <dt>Insights</dt>
      <dd>{{ tageDetail.insightsCounter }}
         <RouterLink 
          :to="`/insights?tag=${tageDetail.slug}`" 
          title="View Insights"
        >
          View Insights
        </RouterLink>
      </dd>
    </dl>
   
  </template>

<template v-else>

     <PageStatusMessage 
              title="Unknown Error!" 
              message="An unknown error occurred while retrieving the tageDetail. Refresh page and try again."
              icon="broken-chain" 
            />

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/description-list";
</style>