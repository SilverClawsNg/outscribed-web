<script setup lang="ts">

import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useInsightDetailStore } from '../stores/InsightDetailStore';
import { useEngagement } from '@/composables/useEngagement';
import LatestCommentComponent from '@/features/engagements/components/LatestCommentComponent.vue'
import { useRouter } from 'vue-router';

import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import { mediaHelper } from '@/utils/mediaHelper'
import { getEngagementMetadata, type ActiveContentContext } from '@/features/engagements/types/EngagementTypes'
import { type InsightDetailDto } from '../types/InsightsTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { sanitizeHtml } from '@/utils/markupHelper';
import ShareBar from '@/components/ShareBar.vue';
import Content from '@/components/Content.vue'
import WriterStats from '@/components/WriterStats.vue'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()
const router = useRouter();

const insightStore = useInsightDetailStore();


// 🔒 Safely unwrap the guaranteed store object cleanly
const insight = computed(() => insightStore.insight as InsightDetailDto);

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(insight.value.engagement));

// Transform state properties reactively on demand
const creatorUiMeta = computed(() => getEngagementMetadata(insight.value.creator.engagement));

const content: ActiveContentContext = {
    id: insight.value.insightId,
    title: insight.value.title,
    contentType: 'Insight',
    engagement: insight.value.engagement, // Live reactive proxy reference
    writeCommentFromInline: false,
    pinnedComment: null
  };

function viewComments() {
  modalStore.push('ContentComments', 'Comments', content)
}

function createComment() {
  modalStore.push('CreateComment', 'New Comment', content)
}

</script>

<template>

  <article class="content-details shared__container">

    <header class="content-details__header-container">

      <div class="content-details__header">

        <h1 class="content-details__title">{{ insight.title }}</h1>

         <div class="content-details__top-meta">

        <div class="content-details__writer">
          By 
          <button 
           type="button"
             class="content-details__writer-link at" 
            @click="modalStore.push('Profile', 'Profile', insight.creator.accountId)"
          >
            {{ insight.creator.username }}
          </button>
           — <time>{{ toShortDate(insight.createdAt) }}</time>
        </div>

        <button 
              type="button"
              class="content-details__menu-btn" 
              @click="modalStore.push('InsightStats', 'Insight Stats', insight)"
              title="Options"
            >
              <span class="content-details__menu-dot"></span>
              <span class="content-details__menu-dot"></span>
              <span class="content-details__menu-dot"></span>
            </button>

        </div>

         <div class="content-details__meta">
         
          <div class="content-details__meta-item">
           <SvgIcons name='tag' /> 
            <router-link 
              :to="`/insights?category=${insight.category}`" 
              class="content-details__category">
              {{ CategoryDescriptions[insight.category] }}
            </router-link>
          </div>

          <template  v-if="insight.country">

          <div class="content-details__meta-item">
             <SvgIcons name='globe' />
            <router-link 
              :to="`/insights?country=${insight.country}`" 
              class="content-details__country"
            >
              {{ CountryDescriptions[insight.country] }}            
              </router-link>
          </div>

          </template>

        </div>

        <p class="content-details__summary">
          {{ insight.summary }}
        </p>
      </div>
    </header>

    <div class="content-details__main">

       <template v-if="insight.photo">
           
      <figure class="content-details__media">
        <img 
        :src="mediaHelper.getUrl(insight.photo, 'insights', 'full') || undefined" 
        :alt="insight.photoCaption" 
         class="content-details__image" />
        <figcaption class="content-details__image-caption">
          {{ insight.photoCaption }}
        </figcaption>
      </figure>

        </template>

      <p class="content-details__reading-time">
        — {{ insight.readingTime }} Minutes Read
      </p>

      <template v-if="insight.isArchived">
         <PageStatusMessage 
            title="Insight is archived!" 
            message="This insight has been archived by the author and is no longer publicly visible. We are showing you this archived version as a reference for discussions. Certain features such as voting, saving, and commenting have been disabled."
            icon="archive" 
            :is-bordered="true"
          />
      </template>

      <!-- Renders safe HTML details -->
      <div class="shared__rich-text" v-html="sanitizeHtml(insight.detail)"></div>

      <template v-if="insight.addendum && insight.addendumDate">
      <div  class="content-details__addendum">
        <h4 class="content-details__section-title">Addendum - Last Updated {{ toShortDate(insight.addendumDate) }}</h4>
        <ol class="content-details__addendum-list">
          <li v-for="(entry, index) in formatAddendum(insight.addendum)" :key="index">
            {{ entry }}
          </li>
        </ol>
      </div>

      </template>
    
       <template  v-if="insight.tags && insight.tags.length > 0">
          <div class="content-details__tags">
            <h4 class="content-details__tag-title">Tagged In</h4>
            <span class="shared__divider shared__divider--line"></span>
          <span v-for="tag in insight.tags" :key="tag.slug" class="content-details__tag-item">
              #<router-link :to="`/insights?tag=${tag.slug}`">{{ tag.name }}</router-link>
            </span>
          </div>
        </template>

      <div class="content-details__engagement-grid">

        <div class="content-details__engagement">
          <h4 class="content-details__engagement-title">Was this insight helpful?</h4>

            <div class="content-details__vote-actions">
            <button 
              class="btn primary" 
              :disabled="uiMeta.isVoteDisabled || insight.isArchived"
              @click="engage.vote(insight.engagement, 'Upvote')"
            >
              <span :class="['check-box', uiMeta.isUpvoteChecked]">✓</span>
              <span class="label">Yes</span>
              <span class="stats">{{ formatCounts(insight.engagement.upvotesCount) }}</span>
            </button>

            <button 
              class="btn secondary" 
              :disabled="uiMeta.isVoteDisabled || insight.isArchived"
              @click="engage.vote(insight.engagement, 'Downvote')"
            >
              <span :class="['check-box', uiMeta.isDownvoteChecked]">✓</span>
              <span class="label">No</span>
              <span class="stats">{{ formatCounts(insight.engagement.downvotesCount) }}</span>
            </button>
          </div>

           <div class="content-details__utility-actions">
            <button 
             type="button"
              class="content-details__utility-btn"
              :disabled="uiMeta.isFavoriteDisabled || insight.isArchived" 
              title="Bookmark"
               @click="engage.favorite(insight.engagement)"
            >
               <SvgIcons name="bookmark" />
              <span>{{ uiMeta.favoriteLongText }}</span>
            </button>
              <button 
             type="button"
              class="content-details__utility-btn"
              :disabled="uiMeta.isFlagDisabled" 
              aria-label="Report this insight"
              title="Flag"
                @click="modalStore.push('FlagContent', 'Flag Insight', insight.engagement)"
            >
            <SvgIcons name="flag" />
              <span>{{ uiMeta.flagLongText }}</span>
            </button>
  
              <button 
              type="button"
              class="content-details__utility-btn"
              @click="modalStore.push('InsightStats', 'Stats', insight)"
            >
              <SvgIcons name="stats" />
              <span>View stats</span>
            </button>

          </div>

          <div class="content-details__engagement-share">
            <ShareBar 
            :title="insight.title"
            :summary="insight.summary"
            :url="insight.slug"
            :content-id="insight.insightId"
            :engageable="insight.engagement"
            content-type='Insight'
          />
          </div>

        </div>

         <div class="content-details__creator-card">
          <div class="content-details__creator-header">
            <h4>Scribed By</h4>
            <button 
              title="Creator Profile"
               type="button"
              class="content-details__writer-link at"
              @click="modalStore.push('Profile', 'Profile', insight.creator.accountId)"
            >
              {{ insight.creator.username }}
            </button>
          </div>

          <div class="content-details__creator-actions">
            <button 
            type="button"
              title="Creator Profile"
              @click="modalStore.push('Profile', 'Profile', insight.creator.accountId)"
            >
              <SvgIcons name="user" /> Profile
            </button>

            <button 
             type="button"
              title="Follow Creator"
              :disabled="creatorUiMeta.isFavoriteDisabled"
              @click="engage.favorite(insight.creator.engagement)"
            >
              <SvgIcons name="bookmark" /> {{ creatorUiMeta.favoriteAltText }}
            </button>
          </div>

           <WriterStats
            :username="insight.creator.username"
            :tales-count="insight.creator.talesCount"
            :insights-count="insight.creator.insightsCount"
            :comments-count="insight.creator.commentsCount"
          />

        </div>
      </div>

    </div>

      <div class="content-details__footer">

      <header class="page-header">
        <h1>Inspired By</h1>
           <button 
           type="button"
              @click="router.push(`/tale/${insight.source.slug}`)" 
              class="btn primary">
              View Tale
      </button>
       
    </header>

          <Content
            :title="insight.source.title"
            :slug="insight.source.slug"
            :creator-id="insight.source.creatorId"
            :creator-username="insight.source.creatorUsername"
            :created-at="insight.source.createdAt"
            content-type='tale'
            :summary="insight.source.summary"
            :is-bordered="true"
          />

      <header class="page-header">
        <h1>Featured Comments</h1>
        <button 
        type="button"
          v-if="insight.engagement.commentsCount > 0" 
          class="btn primary" 
          @click="viewComments"
        >
          View {{ formatCounts(insight.engagement.commentsCount) }}
        </button>
        <button v-else class="btn primary" disabled>
          View {{ insight.engagement.commentsCount }}
        </button>
      </header>

      <div :class="['content-details__enrichment', insightStore.hasLoadedEnrichment ? 'show' : '']">
        <template v-if="insightStore.hasLoadedEnrichment">
          <LatestCommentComponent 
            v-for="comment in insightStore.latestComments" 
            :key="comment.commentId" 
            :comment="comment" 
          />
        </template>
          <template v-else>
          <PageStatusMessage 
            title="No Comments Found!" 
            message="There are currently no comments attached to this insight."
            icon="inbox" 
            :is-bordered="true"
          />
          </template>
      </div>

     <div class="content-details__enrichment-action">
        <p class="content-details__enrichment-prompt">
          Comments help diagnose the causes of rots exposed by insights. Join the on-going discussions and offer your perspectives on variety of issues raised by this insight.
        </p>
        <button 
        type="button" 
         :disabled="insight.isArchived"
         class="btn secondary with-icon"
        title="Create Comment" 
        @click="createComment">
          <span class="icon-edit"></span> Write a comment
        </button>
      </div>
      </div>

  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/content-details.less";
@import "@/assets/css/rich-text.less";
</style>