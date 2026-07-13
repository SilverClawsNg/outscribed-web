<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue';
import { useContentCommentsStore } from '../stores/ContentCommentsStore.ts';
import { useContentCommentsFilterStore } from '../stores/ContentCommentsFilterStore.ts'; 
import { APIError } from '@/api/apiTypes.ts'
import PageStatusMessage from '@/components/PageStatusMessage.vue' // 🎯 Integrated safely
import { type GeneralSortType } from '@/utils/enumHelper.ts'
import { GeneralSortTypeDescriptions } from '@/utils/descriptors'
import InfiniteScroller from '@/components/InfiniteScroller.vue'
import Comment from './CommentModal.vue'
import { useLoginHint } from '@/utils/authHelper'

import { useModalStore } from '@/stores/modalStore';
import {type CommentListDto, type GetContentCommentsResponse, initializeCommentListEngagement, 
    type GetCommentThreadResponse, type CreateCommentRequest, type CommentCreatedResponse, type ReplyCommentRequest,
    type Engageable, type GetEngagementIdsResponse, type ActiveContentContext, type GetCommentRepliesResponse,
    type LoadingCommentsResponse
} from '../types/EngagementTypes.ts';


// --- DEFINE FORM DATA ---
const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const activeComment = computed(() => props.payload as CommentListDto)

class HashSetOrSet extends Set<string> {}

const isLoggedIn = useLoginHint()

const baseRoute = computed(() => `api/comments/replies/${activeComment.value.commentId}`)

const commentsStore = useContentCommentsStore();
const commentFilterStore = useContentCommentsFilterStore();

  const pinnedComment = ref<CommentListDto | null>(null);

const modalStore = useModalStore();

const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const loadingMoreError = ref<APIError | null>(null)

const showFilterDropdown = ref(false);
const currentSort = ref<GeneralSortType>('MostRecent');

const showAncestry = ref(false)

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

const parentSnapshot = {
  ...activeComment.value,
  pinnedReply: null, // 🛡️ Sever the link down to prevent cyclic loops
  ancestors: activeComment.value.ancestors || []
};


// 2. Extract only the newly appended proxies from the target stream
const pushedProxies = comments.value.slice(-response.comments.length);

// 3. Populate the extensions efficiently
pushedProxies.forEach(comment => {
  comment.title = activeComment.value.title;
  
  // 🎯 Every child gets the exact same historical path without reference sharing bugs
  comment.ancestors = [...parentSnapshot.ancestors, parentSnapshot];
  console.log(`Comment's ancestors count is ${comment.ancestors.length}`)

});

 await commentsStore.hydratePersonals(pushedProxies)
  
    
      // Always activate the engagement buttons to lift loading skeletons/spinners
    //commentsStore.activateEngagementButtons(pushedProxies)
      }


// 📋 Flatten and snapshot the live state to see if hydration stuck
  //console.log('--- Vue State Snapshot inside view---', JSON.parse(JSON.stringify(comments.value)));

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
  const response = await commentsStore.loadComments(apiPath)

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

// 1. Create a single, read-only snapshot of the parent ONCE outside the loop.
// This completely breaks any potential circular reference chains.
const parentSnapshot = {
  ...activeComment.value,
  pinnedReply: null, // 🛡️ Sever the link down to prevent cyclic loops
  ancestors: activeComment.value.ancestors || []
};

// 2. Extract only the newly appended proxies from the target stream
const pushedProxies = comments.value.slice(-response.comments.length);

// 3. Populate the extensions efficiently
pushedProxies.forEach(comment => {
  comment.title = activeComment.value.title;
  
  // 🎯 Every child gets the exact same historical path without reference sharing bugs
  comment.ancestors = [...parentSnapshot.ancestors, parentSnapshot];
});

             await commentsStore.hydratePersonals(pushedProxies)

    }


  
  }
  
}


function replyComment() {
  modalStore.push('ReplyComment', 'Reply Comment', activeComment.value)
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


console.log('--- Vue State Snapshot inside view---', JSON.parse(JSON.stringify(activeComment.value)));

  // Check if coming from a new comment modal i.e. not 
   if(activeComment.value.hasReplied){

    // Close the previous modal which is likely the create modal form
    modalStore.popPrevious()

    }

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
      :message="loadingError.detail || 'An unexpected error occurred.'">
    </PageStatusMessage>

  </template>

   <template v-else>
   
    <article class="comments-list">

    <div class="comments-list__ancestry-container">

      <h3>
        {{ activeComment.title }}
      </h3>

     <div :class="['comments-list__ancestry', showAncestry ? 'show' : null]">

     <template v-if="activeComment.ancestors && activeComment.ancestors.length > 0">
     
      <Comment 
            v-for="comment in activeComment.ancestors" 
            :is-ancestor="true"
            :key="comment.commentId" 
            :comment="comment" />

      </template>

       <Comment :comment="activeComment"  :is-focus="true" />

      </div>

    </div>

      <section class="comments-list__filter-container">

        <div class="comments-list__filter">

          <div class="comments-list__filter-text">Sort By</div>

          <div class="comments-list__filter-buttons">

            <button class="comments-list__show-filter" @click="showFilterDropdown = !showFilterDropdown">

              <span> {{ GeneralSortTypeDescriptions[currentSort] }}</span>

              <span :class="['caret', { active: showFilterDropdown }]"></span>

            </button>

            <div :class="['comments-list__filter-options', { active: showFilterDropdown }]">

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

        <div class="comments-list__top-action">
          <button 
            class="show-ancestry btn primary" 
            :class="{ 'active': showAncestry }" 
            @click="showAncestry = !showAncestry">
          </button>
        </div>
      </section>

    <template v-if="!comments || comments.length === 0">

      <PageStatusMessage 
        title="No Content!"
      message="No comments was found matching your search filters."
      >
        <template #actions>
          <button class="btn primary" @click="resetFilters">Reset</button>
        </template>
      </PageStatusMessage>

    </template>

    <template v-else>

      <article v-if="activeComment.pinnedReply" class="comments-list__card pinned">
        <Comment :comment="activeComment.pinnedReply" />
      </article>
 
       <InfiniteScroller
        :has-next="hasNext"
        :is-fetching="isFetchingMore"
        :error="loadingMoreError"
        @load-more="loadMoreData"
        @retry="loadMoreData">
        
        <Comment 
          v-for="comment in (activeComment.pinnedReply ? comments.filter(c => c.commentId !== activeComment.pinnedReply?.commentId) : comments)" 
          :key="comment.commentId" 
          :comment="comment" 
        />
 
       </InfiniteScroller>

  
    </template>

  </article>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/comment-lists.less";

</style>
