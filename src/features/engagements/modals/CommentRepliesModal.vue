<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useContentCommentsStore } from '../stores/ContentCommentsStore.ts';
import { useContentCommentsFilterStore } from '../stores/ContentCommentsFilterStore.ts'; 
import { APIError } from '@/api/apiTypes.ts';
import PageStatusMessage from '@/components/PageStatusMessage.vue';
import { type GeneralSortType } from '@/utils/enumHelper.ts';
import { GeneralSortTypeDescriptions } from '@/utils/descriptors';
import InfiniteScroller from '@/components/InfiniteScroller.vue';
import Comment from '../components/CommentComponent.vue';
import { useModalStore } from '@/stores/modalStore';
import { type CommentListDto } from '../types/EngagementTypes.ts';

// --- DEFINE FORM DATA ---


class HashSetOrSet extends Set<string> {}

const commentsStore = useContentCommentsStore();
const commentFilterStore = useContentCommentsFilterStore();
const modalStore = useModalStore();

const activeContent = computed(() => commentsStore.activeContent);
const activeComment = ref<CommentListDto | null>(null);

  const ancestors = computed(() => {
  if (!activeComment.value) return [];
  return commentsStore.getAncestorsForComment(activeComment.value.commentId);
});

const baseRoute = computed(() => `api/comments/replies/${activeComment.value?.commentId}`);

const isLoading = ref(true);
const loadingError = ref<APIError | null>(null);
const loadingMoreError = ref<APIError | null>(null);

const showFilterDropdown = ref(false);
const currentSort = ref<GeneralSortType>('MostRecent');

const showAncestry = ref(false);

// Pagination & Flow Guards
const hasNext = ref<boolean>(false);
const pointer = ref<string | null>('1');
const anchor = ref<string | null>(null);
const isFetchingMore = ref<boolean>(false);

const comments = ref<CommentListDto[]>([]);

// Gets data
async function loadData() {

  const apiPath = commentFilterStore.buildApiPath(baseRoute.value);

  isLoading.value = true;
  loadingError.value = null;

  const response = await commentsStore.loadReplies(apiPath);

  if (!response.success) {
    loadingError.value = response.error || new APIError(
      500,
      'Unknown Error!',
      'Unknown error occurred while retrieving comments. Refresh page and try again.'
    );
  }

  hasNext.value = response.hasNext;
  pointer.value = response.pointer;
  anchor.value = response.anchor;

  if (response.comments && response.comments.length !== 0) {
    comments.value = response.comments;

   
  console.log('--- Vue State Snapshot comment replies view --', JSON.parse(JSON.stringify(comments.value)));

    await commentsStore.hydratePersonals(comments.value);
  }

  isLoading.value = false;
}

// Gets more data (pagination)
async function loadMoreData() {
  if (isFetchingMore.value || !hasNext.value || !comments.value) return;

  isFetchingMore.value = true;
  const apiPath = commentFilterStore.buildApiPath(baseRoute.value, pointer.value, anchor.value);

  loadingMoreError.value = null;

  const response = await commentsStore.loadReplies(apiPath);

  if (!response.success) {
    loadingMoreError.value = response.error || new APIError(
      500,
      'Unknown Error!',
      'Unknown error occurred while retrieving comments. Refresh page and try again.'
    );
  }

  hasNext.value = response.hasNext;
  pointer.value = response.pointer;

  if (response.comments && response.comments.length !== 0) {
    const existingIds = new HashSetOrSet(comments.value.map(t => t.commentId));
    const uniqueComments = response.comments.filter((t: any) => !existingIds.has(t.commentId));

    if (uniqueComments.length > 0) {
      comments.value.push(...uniqueComments);

      // 🎯 Fix index calculation using uniqueComments length instead of total response length
      const pushedProxies = comments.value.slice(-uniqueComments.length);


      await commentsStore.hydratePersonals(pushedProxies);
    }
  }

  isFetchingMore.value = false;
}

async function resetFilters() {
  commentFilterStore.reset();
  await loadData();
}

async function applySort(type: GeneralSortType) {
  currentSort.value = type;
  showFilterDropdown.value = false;
  commentFilterStore.reset();
  commentFilterStore.sort = type;
  await loadData();
}

async function openAdvancedFilter() {
  showFilterDropdown.value = false;
  const filtersApplied = await modalStore.push('ContentCommentsFilter', 'Filter Comments', null, true);

  if (filtersApplied) {
    await loadData();
  }
}

onMounted(async () => {

// 🎯 Consume transitional context handed off by store
  const activeCommentFromStore = commentsStore.activeComment;
  
  if (activeCommentFromStore) {
    activeComment.value = activeCommentFromStore;
  }

  await loadData();
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

   <template v-else-if="activeComment && activeContent">
   
     <article class="comments-container">

    <div class="comments-container__ancestry-container">

      <h3 class="comments-container__ancestry-container-heading">
        {{ activeContent.title }}
      </h3>

     <div :class="['comments-container__ancestry', showAncestry ? 'show' : null]">

     <template v-if="ancestors && ancestors.length > 0">
     
      <Comment 
            v-for="comment in ancestors" 
            :is-ancestor="true"
            :key="comment.commentId" 
            :comment="comment" />

      </template>

       <Comment :comment="activeComment"  :is-focus="true" />

      </div>

    </div>

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
          <button 
            class="comments-container__show-ancestry btn primary" 
            :class="{ 'active': showAncestry }" 
            @click="showAncestry = !showAncestry">
          </button>
        </div>
      </section>

    <template v-if="!comments || comments.length === 0">

    <PageStatusMessage 
        title="No Comment Found!"
      message="We could not retrieve any comment matching your search filters."
      :is-standalone="true"
      icon="inbox"
      >
        <template #actions>
          <button class="btn primary" @click="resetFilters">Reset</button>
        </template>
      </PageStatusMessage>

    </template>

    <template v-else>

      <article v-if="activeComment.pinnedReply" class="comments-container__pinned">
        <Comment :comment="activeComment.pinnedReply" />
      </article>
 
       <InfiniteScroller
        :has-next="hasNext"
        :is-fetching="isFetchingMore"
        :error="loadingMoreError"
        @load-more="loadMoreData"
        @retry="loadMoreData">
        
        <Comment 
          v-for="comment in (activeComment.pinnedReply ? comments.filter(c => c.commentId !== activeComment?.pinnedReply?.commentId) : comments)" 
          :key="comment.commentId" 
          :comment="comment" 
        />
 
       </InfiniteScroller>

    </template>

  </article>

  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/comments-container.less";
</style>
