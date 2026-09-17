<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useContentCommentsStore } from '../stores/ContentCommentsStore.ts';
import { useContentCommentsFilterStore } from '../stores/ContentCommentsFilterStore.ts'; 
import { APIError } from '@/api/apiTypes.ts'
import PageStatusMessage from '@/components/PageStatusMessage.vue' // 🎯 Integrated safely
import { type GeneralSortType } from '@/utils/enumHelper.ts'
import { GeneralSortTypeDescriptions } from '@/utils/descriptors'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import Comment from '../components/CommentComponent.vue'

import { useModalStore } from '@/stores/modalStore';
import {type CommentListDto, 
    
    type ActiveContentContext
    } from '../types/EngagementTypes.ts';

const commentsStore = useContentCommentsStore();
const activeContent = computed(() => commentsStore.activeContent);

const baseRoute = computed(() => `api/comments/content/${activeContent.value?.id}`)

const commentFilterStore = useContentCommentsFilterStore();

class HashSetOrSet extends Set<string> {}

const modalStore = useModalStore();

const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const loadingMoreError = ref<APIError | null>(null)

const showFilterDropdown = ref(false);
const currentSort = ref<GeneralSortType>('MostRecent');


  // Pagination & Flow Guards
  const hasNext = ref<boolean>(false);
  const pointer = ref<string | null>('1');
  const anchor = ref<string | null>(null);
  const isFetchingMore = ref<boolean>(false);

  const comments = ref<CommentListDto[]>([]);
  

//Gets data
async function loadData() {
  
const apiPath = commentFilterStore.buildApiPath(baseRoute.value);

    isLoading.value = true;
    loadingError.value = null;

  // 3. Fetch from store
  const response = await commentsStore.loadComments(apiPath)

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

  hasNext.value = response.hasNext
  pointer.value = response.pointer
  anchor.value = response.anchor

   if (response.comments && response.comments.length !== 0) {

      comments.value = response.comments

    await commentsStore.hydratePersonals(comments.value)

      }


// 📋 Flatten and snapshot the live state to see if hydration stuck
  console.log('--- Vue State Snapshot contents comment view --', JSON.parse(JSON.stringify(comments.value)));

  // No matter the result, stop loading
  isLoading.value = false
}

//Gets data
async function loadMoreData() {
  
   if (isFetchingMore.value || !hasNext.value || !comments) return;

       isFetchingMore.value = true;

const apiPath = commentFilterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value);

    loadingMoreError.value = null;

  // 3. Fetch from store
  const response = await commentsStore.loadComments(apiPath, true)

  if (!response.success) {
    if (response.error) {
    loadingMoreError.value = response.error
  }
  else{
    loadingMoreError.value = new APIError(
        500,
        'Unknown Error!',
        'Unknown error occured while retrieving comments. Refresh page and try again.'
      );
  }
  }

  hasNext.value = response.hasNext
  pointer.value = response.pointer

  if(response.comments && response.comments.length !== 0){

          // Filter duplicates already caught by state or top navigation creations
          const existingIds = new HashSetOrSet(comments.value.map(t => t.commentId));

        // 1. Filter out duplicates and immediately shape the raw inputs into valid DTO structures
        const uniqueComments = response.comments
          .filter((t: any) => !existingIds.has(t.commentId));

          if (uniqueComments.length > 0) {
     

comments.value.push(...uniqueComments);

// 2. 🎯 Slice out the exact reactive PROXIES that Vue just created at the end of the array
const pushedProxies = comments.value.slice(response.comments.length);
             await commentsStore.hydratePersonals(pushedProxies)
    }
    
  }
  
}

function createComment() {
  modalStore.push('CreateComment', 'New Comment')
}

async function resetFilters() {
 
   commentFilterStore.reset();

  await loadData()
}
  
async function applySort(type: GeneralSortType) {
  currentSort.value = type;
  showFilterDropdown.value = false;
  // Trigger your backend sort action reload logic here...

  commentFilterStore.reset();
  commentFilterStore.sort = type;

  await loadData()
}

async function openAdvancedFilter() {
  showFilterDropdown.value = false;

  // ⏳ Await the modal lifecycle loop completion!
  const filtersApplied = await modalStore.push('ContentCommentsFilter', 'Filter Comments', null, true);

  // 🔄 If the user confirmed their search/filter changes, reload the feed
  if (filtersApplied) {
    await loadData();
  }
}

onMounted(async () => {
  // Clean & simple: Zero modal stack manipulation required!
  await loadData();
});

</script>

<template>
 
  <template v-if="isLoading">

   <div class="loader" role="status" aria-label="Loading comments">
  <p class="loader__dot"></p>
  <span class="sr-only">Loading Comments...</span>
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

   <template v-else-if="activeContent">
   
    <article class="comments-container">

    <div class="comments-container__ancestry-container">

      <h3 class="comments-container__ancestry-container-heading">
        {{ activeContent.title }}
      </h3>

      <article v-if="activeContent.pinnedComment" class="comments-container__pinned">
        <Comment :comment="activeContent.pinnedComment" :content="activeContent" :is-focus="false" />
      </article>

    </div>

    <template v-if="!comments || comments.length === 0">

      <PageStatusMessage 
        title="No Comment Found!"
      message="We counld not retrieve any comment matching your search filters."
      :is-standalone="true"
      >
        <template #actions>
          <button class="btn btn--primary"  @click="resetFilters">Reset</button>
        </template>
      </PageStatusMessage>

    </template>

    <template v-else>

      <section class="comments-container__filter-container">

        <div class="comments-container__filter">

          <div class="comments-container__filter-text">Sort By</div>

          <div class="comments-container__filter-buttons">

            <button class="comments-container__show-filter" @click="showFilterDropdown = !showFilterDropdown">

              <span> {{ GeneralSortTypeDescriptions[currentSort] }}</span>

              <span :class="['caret', { active: showFilterDropdown }]"></span>

            </button>

            <div :class="['comments-container__filter-options', { active: showFilterDropdown }]">

              <button 
                @click="applySort('MostRecent')" 
                :class="{ active: currentSort === 'MostRecent' }"
              >
                Most Recent
              </button>
              <button 
                @click="applySort('LeastRecent')" 
                :class="{ active: currentSort === 'LeastRecent' }"
              >
                Least Recent
              </button>
              <button @click="openAdvancedFilter">
                Advanced Filter
              </button>
            </div>
          </div>
        </div>

        <div class="comments-container__top-action">
          <button class="btn btn--primary"  @click="createComment">Write Comment</button>
        </div>
      </section>
 
       <InfiniteScroller
        :has-next="hasNext"
        :is-fetching="isFetchingMore"
        :error="loadingMoreError"
        @load-more="loadMoreData"
        @retry="loadMoreData">
        
        <Comment 
          v-for="comment in (activeContent.pinnedComment ? comments.filter(c => c.commentId !== activeContent?.pinnedComment?.commentId) : comments)" 
         :key="comment.commentId" 
        :comment="comment"
        />
 
       </InfiniteScroller>
  
    </template>

  </article>

  </template>

   <template v-else>
    <PageStatusMessage
      title="Unknown Error!"
      message="Unknown error occured while loading comments. Refresh page and try again."
      icon="warning"
      :is-standalone="true"
      />
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/comments-container.less";
</style>
