<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { useContentVotesStore } from '../stores/ContentVotesStore.ts';
import { useContentVotesFilterStore } from '../stores/ContentVotesFilterStore.ts'; 
import { APIError } from '@/api/apiTypes.ts'
import PageStatusMessage from '@/components/PageStatusMessage.vue' // 🎯 Integrated safely
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import Vote from '../components/VoteListComponent.vue'

// --- DEFINE FORM DATA ---
const props = defineProps<{
  payload: unknown 
}>()

const contentId = computed(() => props.payload as string)

const baseRoute = computed(() => `api/contents/${contentId.value}/upvotes`)

const voteFilterStore = useContentVotesFilterStore();
const votesStore = useContentVotesStore();

const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

// --- 2. PAGE INITIALIZATION ---
async function initPage() {
 

  // Build clean API path with endpoint URL and active filters
const apiPath = voteFilterStore.buildApiPath(baseRoute.value);

  // Set the base url for loadmore in list store
  votesStore.setBaseRoute(baseRoute.value)

  // Fetch data
  isLoading.value = true
  const { success, error } = await votesStore.loadVotes(apiPath)

  if (!success) {
    loadingError.value = error || new APIError(
      500,
      'Unknown Error!',
      'Unknown error occurred while retrieving votes. Refresh page and try again.'
    );
  }

  isLoading.value = false

}


// --- MOUNT & WATCHERS ---
onMounted(async () => {
  await initPage();
})

onUnmounted(() => {
  votesStore.abort();
});

</script>

<template>
 
  <template v-if="isLoading">

    <div class="loader-container">
      <p class="loader"></p>
    </div>

  </template>

  <template v-else-if="loadingError">

    <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'">
    </PageStatusMessage>

  </template>

   <template v-else>
   
    <article class="votes-list">

    <template v-if="!votesStore.votes || votesStore.votes.length === 0">

      <PageStatusMessage 
        title="No Content!"
      message="No votes was found."
      >
      
      </PageStatusMessage>

    </template>

    <template v-else>

       <InfiniteScroller
        :has-next="votesStore.hasNext"
        :is-fetching="votesStore.isFetchingMore"
        :error="votesStore.loadMoreError"
        @load-more="votesStore.loadMoreVotes"
        @retry="votesStore.loadMoreVotes">
        
        <Vote 
          v-for="vote in votesStore.votes" 
          :key="vote.voteId" 
          :vote="vote" 
        />
 
       </InfiniteScroller>

    </template>

  </article>

  </template>

</template>
