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


const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const content = computed(() => props.payload as ActiveContentContext)

 const isLoggedIn = useLoginHint()

const baseRoute = computed(() => `api/comments/content/${content.value.id}`)

const commentsStore = useContentCommentsStore();
const commentFilterStore = useContentCommentsFilterStore();

  const pinnedComment = ref<CommentListDto | null>(null);
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

      
// 2. Extract only the newly appended proxies from the target stream
const pushedProxies = comments.value.slice(-response.comments.length);

// 3. Populate the extensions efficiently
pushedProxies.forEach(comment => {
  comment.title = content.value.title;
  
  // 🎯 Every child gets the exact same historical path without reference sharing bugs
  console.log(`Comment's title is ${comment.title}`)

});

   
    await commentsStore.hydratePersonals(comments.value)

      // Always activate the engagement buttons to lift loading skeletons/spinners
    //commentsStore.activateEngagementButtons(comments.value)
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

// 2. 🎯 Slice out the exact reactive PROXIES that Vue just created at the end of the array
const pushedProxies = comments.value.slice(response.comments.length);

 // 3. 🚀 Hydrate the proxies! Now Vue intercepts every mutation and updates the UI instantly.


     pushedProxies.forEach(comment => {
           comment.title = content.value.title;
           comment.ancestors = []

    });

    
             await commentsStore.hydratePersonals(pushedProxies)



    }

    
  }
  
}

function createComment() {
  content.value.writeCommentFromInline = true;
  modalStore.push('CreateComment', 'New Comment', content.value)
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

  // Check if coming from a new comment modal i.e. not 
   if(!content.value.writeCommentFromInline){

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
        {{ content.title }}
      </h3>

      <article v-if="content.pinnedComment" class="comments-list__card pinned">
        <Comment :comment="content.pinnedComment" :content="content" :is-focus="false" />
      </article>

    </div>

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
          <button class="btn primary" @click="createComment">Write Comment</button>
        </div>
      </section>
 
       <InfiniteScroller
        :has-next="hasNext"
        :is-fetching="isFetchingMore"
        :error="loadingMoreError"
        @load-more="loadMoreData"
        @retry="loadMoreData">
        
        
        <Comment 
          v-for="comment in (content.pinnedComment ? comments.filter(c => c.commentId !== content.pinnedComment?.commentId) : comments)" 
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
