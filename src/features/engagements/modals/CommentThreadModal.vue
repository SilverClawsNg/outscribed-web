<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useCommentThreadStore } from '../stores/CommentThreadStore.ts';
import { APIError } from '@/api/apiTypes.ts'
import PageStatusMessage from '@/components/PageStatusMessage.vue' 
import Comment from '../components/CommentComponent.vue'

import {type CommentListDto,  type SourceContentDto} from '../types/EngagementTypes.ts';
import Content from '@/components/Content.vue'

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const commentId = computed(() => props.payload as string)

const baseRoute = computed(() => `api/comments/thread/${commentId.value}`)

const commentsStore = useCommentThreadStore();

const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)

  // Pagination & Flow Guards
  const source = ref<SourceContentDto | null>(null);
  const focus = ref<CommentListDto | null>(null);
  const ancestors = ref<CommentListDto[]>([]);
  
//Gets data
async function loadData() {
  
    isLoading.value = true;
    loadingError.value = null;

  // 3. Fetch from store
  const response = await commentsStore.loadThread(baseRoute.value)

  if (!response.success) {
    if (response.error) {
    loadingError.value = response.error
  }
  else{
    loadingError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving comments. Refresh page and try again.'
      );
  }
  }
  else{

  source.value = response.source
  focus.value = response.focus
  ancestors.value = response.ancestors

    console.log('--- Vue State Snapshot inside view---', JSON.parse(JSON.stringify(response.focus)));
    
// 2. Combine them into a single temporary execution batch
const hydrationBatch: CommentListDto[] = [];

if (focus.value) {
  hydrationBatch.push(focus.value);
}

if (ancestors.value.length > 0) {
  hydrationBatch.push(...ancestors.value);
}

if (hydrationBatch.length !== 0) {

  await commentsStore.hydratePersonals(hydrationBatch)

// 📋 Flatten and snapshot the live state to see if hydration stuck
  console.log('--- Vue State Snapshot inside view---', JSON.parse(JSON.stringify(hydrationBatch)));

}

}

  // No matter the result, stop loading
  isLoading.value = false
}

onMounted(async () => {

    await loadData()

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
      :message="loadingError.detail || 'An unexpected error occurred.'"
        icon="warning"
      :is-standalone="true">
    </PageStatusMessage>

  </template>

  <template v-else>

      <template v-if="source">
             <Content
            :title="source.title"
            :slug="source.slug"
            :creator-id="source.creatorId"
            :creator-username="source.creatorUsername"
            :created-at="source.date"
            :content-type="source.contentType"
            :summary="source.summary"
            :is-bordered="true"
          />
        </template>

        <template v-if="ancestors">
          <Comment 
            v-for="comment in ancestors" 
            :key="comment.commentId" 
            :comment="comment"/>
        </template>

        <template v-if="focus">
          <Comment :comment="focus"/>
        </template>

  <template v-if="ancestors">
   
     <Comment 
        v-for="comment in ancestors" 
        :key="comment.commentId" 
        :comment="comment"/>

  </template>

   <template v-if="focus">
   
     <Comment :comment="focus"/>

  </template>

</template>

</template>
