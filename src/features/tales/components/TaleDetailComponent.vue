<script setup lang="ts">

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useTaleDetailStore } from '../stores/TaleDetailStore';
import { useEngagement } from '@/composables/useEngagement';
import LatestCommentComponent from '@/features/engagements/components/LatestCommentComponent.vue'

import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import { mediaHelper } from '@/utils/mediaHelper'
import { getEngagementMetadata, type ActiveContentContext } from '@/features/engagements/types/EngagementTypes'
import { type TaleDetailDto } from '../types/TalesTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { sanitizeHtml } from '@/utils/markupHelper';
import ShareBar from '@/components/ShareBar.vue';
import Content from '@/components/Content.vue'
import WriterStats from '@/components/WriterStats.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

const taleStore = useTaleDetailStore();

const showExternalLink = ref(false);

// 🔒 Safely unwrap the guaranteed store object cleanly
const tale = computed(() => taleStore.tale as TaleDetailDto);

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(tale.value.engagement));

// Transform state properties reactively on demand
const creatorUiMeta = computed(() => getEngagementMetadata(tale.value.creator.engagement));

const content: ActiveContentContext = {
    id: tale.value.taleId,
    title: tale.value.title,
    contentType: 'Tale',
    engagement: tale.value.engagement, // Live reactive proxy reference
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

    <!-- Header Section -->
    <header class="content-details__header-container">

      <div class="content-details__header">

        <h1 class="content-details__title">{{ tale.title }}</h1>

        <div class="content-details__top-meta">

        <div class="content-details__writer">
          By 
          <button 
            type="button"
            class="content-details__writer-link at" 
            @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
          >
            {{ tale.creator.username }}
          </button>
          — <time>{{ toShortDate(tale.createdAt) }}</time>
          
        </div>
        
           <button 
              type="button"
              class="content-details__menu-btn" 
              @click="modalStore.push('TaleStats', 'Stats', tale)"
              title="Options"
            >
              <span class="content-details__menu-dot"></span>
              <span class="content-details__menu-dot"></span>
              <span class="content-details__menu-dot"></span>
            </button>

        </div>

        <div class="content-details__meta">
        
          <div class="content-details__meta-item">
            <SvgIcons name="tag" /> 
            <RouterLink 
              :to="`/tales?category=${tale.category}`" 
              class="content-details__meta-link"
            >
              {{ CategoryDescriptions[tale.category] }}
            </RouterLink>
          </div>

          <template  v-if="tale.country">

          <div class="content-details__meta-item">
            <SvgIcons name="globe" />
            <RouterLink 
              :to="`/tales?country=${tale.country}`" 
              class="content-details__meta-link"
            >
              {{ CountryDescriptions[tale.country] }}            
            </RouterLink>
          </div>

          </template>

        </div>

        <p class="content-details__summary">
          {{ tale.summary }}
        </p>
      </div>
    </header>

    <!-- Main Content Container -->
    <div class="content-details__main">
      <!-- Media Figure -->
        <template v-if="tale.photo">
           <figure v-if="tale.photo" class="content-details__media">
        <img 
          :src="mediaHelper.getUrl(tale.photo, 'tales', 'full') || undefined" 
          :alt="tale.photoCaption || tale.title" 
          class="content-details__image"
        />
        <figcaption class="content-details__caption">
          {{ tale.photoCaption }}
        </figcaption>
      </figure>
        </template>
    

      <!-- Reading Time Indicator -->
      <p class="content-details__reading-time">
        — {{ tale.readingTime }} Minutes Read
      </p>

      <!-- Archive Banner -->
        <template v-if="tale.isArchived">
            <PageStatusMessage 
              title="Tale is archived!" 
              message="This tale has been archived by the author and is no longer publicly visible. We are showing you this archived version as a reference for discussions. Certain features such as voting, saving, and commenting have been disabled."
              icon="archive" 
              :is-bordered="true"
            />
      </template>

      <!-- Safe Rich Text Content -->
      <div class="shared__rich-text" v-html="sanitizeHtml(tale.detail)"></div>

      <!-- Addendum Section -->
        <template v-if="tale.addendum && tale.addendumDate">
        <div class="content-details__addendum">
        <h4 class="content-details__section-title">Addendum - Last Updated {{ toShortDate(tale.addendumDate) }}</h4>
        <ol class="content-details__addendum-list">
          <li v-for="(entry, index) in formatAddendum(tale.addendum)" :key="index">
            {{ entry }}
          </li>
        </ol>
      </div>
      </template>

      <!-- Reality Check Section -->
      <div class="content-details__realitycheck">
        <h2 class="content-details__realitycheck-heading">Reality Check
          <span>✓</span>
        </h2>
        
        <h3 class="content-details__realitycheck-title">
          {{ tale.realityCheckTitle }}
        </h3>
        
        <div class="content-details__realitycheck-body">
          <p>
            <span class="content-details__realitycheck-source">{{ tale.realityCheckSource }}</span> -
            {{ tale.realityCheckSummary }}
          </p>

          <div class="content-details__realitycheck-actions">
            <button type="button" class="btn secondary" @click="showExternalLink = !showExternalLink">
              Visit Source
            </button>
          </div>

          <div v-if="showExternalLink" class="shared__popover">
            <div class="shared__popover-arrow"></div>
            <p class="shared__popover-text">You will be redirected to {{ tale.realityCheckUrl }}</p>
            <div class="shared__popover-actions">
              <a :href="tale.realityCheckUrl" target="_blank" rel="noopener" class="btn primary" @click="showExternalLink = false">Yes</a>
              <button type="button" class="btn secondary" @click="showExternalLink = false">No</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Taxonomy Tags -->
       
       <template v-if="tale.tags && tale.tags.length > 0">
        <div class="content-details__tags">
            <h4 class="content-details__tag-title">Tagged In</h4>
            <span class="shared__divider shared__divider--line"></span>
            <span v-for="tag in tale.tags" :key="tag.slug" class="content-details__tag-item">
              #<RouterLink :to="`/tales?tag=${tag.slug}`">{{ tag.name }}</RouterLink>
            </span>
          </div>

        </template>
     
      <!-- Legal Disclaimer -->
      <div class="content-details__disclaimer">
        <span class="content-details__disclaimer-heading">Disclaimer</span>: This content represents the writer's perspective and exercise of artistic freedom. 
        <button type="button" class="content-details__disclaimer-btn" @click="modalStore.push('DisclaimerModal', 'Disclaimer')">
          [Read full disclaimer]
        </button>
      </div>

      <!-- Engagement & Creator Card Container -->
      <div class="content-details__engagement-grid">
        <!-- Interactive Engagement Block -->
        <div class="content-details__engagement">
          <h4 class="content-details__engagement-title">Was this helpful?</h4>

          <div class="content-details__vote-actions">
            <button 
              type="button"
              class="btn primary" 
              :disabled="uiMeta.isVoteDisabled || tale.isArchived"
              @click="engage.vote(tale.engagement, 'Upvote')"
            >
              <span :class="['check-box', uiMeta.isUpvoteChecked]">✓</span>
              <span class="label">Yes</span>
              <span class="stats">{{ formatCounts(tale.engagement.upvotesCount) }}</span>
            </button>

            <button 
              type="button"
              class="btn secondary" 
              :disabled="uiMeta.isVoteDisabled || tale.isArchived"
              @click="engage.vote(tale.engagement, 'Downvote')"
            >
              <span :class="['check-box', uiMeta.isDownvoteChecked]">✓</span>
              <span class="label">No</span>
              <span class="stats">{{ formatCounts(tale.engagement.downvotesCount) }}</span>
            </button>
          </div>

          <div class="content-details__utility-actions">
            <button 
              type="button"
              class="content-details__utility-btn"
              :disabled="uiMeta.isFavoriteDisabled || tale.isArchived" 
              title="Bookmark"
              aria-label="Bookmark this tale"
              @click="engage.favorite(tale.engagement)"
            >
              <SvgIcons name="bookmark" />
              <span>{{ uiMeta.favoriteLongText }}</span>
            </button>

            <button 
              type="button"
              class="content-details__utility-btn"
              :disabled="uiMeta.isFlagDisabled" 
              title="Report"
              aria-label="Report this tale"
              @click="modalStore.push('FlagContent', 'Flag Content', tale.engagement)"
            >
              <SvgIcons name="flag" />
              <span>{{ uiMeta.flagLongText }}</span>
            </button>

            <button 
              type="button"
              class="content-details__utility-btn"
              @click="modalStore.push('TaleStats', 'Stats', tale)"
            >
              <SvgIcons name="stats" />
              <span>View stats</span>
            </button>
          </div>

         <ShareBar 
            :title="tale.title"
            :summary="tale.summary"
            :url="tale.slug"
            :content-id="tale.taleId"
            content-type='Tale'
            :engageable="tale.engagement"
          />

        </div>

        <!-- Creator Profile Meta Card -->
        <div class="content-details__creator-card">
          <div class="content-details__creator-header">
            <h4>Scribed By</h4>
            <button 
              type="button"
              class="content-details__writer-link at"
              @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
            >
              {{ tale.creator.username }}
            </button>
          </div>

          <div class="content-details__creator-actions">
            <button 
              type="button"
              title="Creator Profile"
              @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
            >
              <SvgIcons name="user" /> Profile
            </button>

            <button 
              type="button"
              title="Follow Creator"
              :disabled="creatorUiMeta.isFavoriteDisabled"
              @click="engage.favorite(tale.creator.engagement)"
            >
              <SvgIcons name="bookmark" /> {{ creatorUiMeta.favoriteAltText }}
            </button>
          </div>

            <WriterStats 
            :username="tale.creator.username"
            :tales-count="tale.creator.talesCount"
            :insights-count="tale.creator.insightsCount"
            :comments-count="tale.creator.commentsCount"
          />

        </div>
      </div>

    </div>

  <div class="content-details__footer">
    
      <!-- Recent Insights Enrichment Block -->
      <header class="page-header">
        <h1>Recent Insights</h1>
        <RouterLink 
          v-if="tale.engagement.insightsCount > 0" 
          :to="`/insights?taleId=${tale.taleId}`" 
          class="btn primary"
        >
          View {{ formatCounts(tale.engagement.insightsCount) }}
        </RouterLink>
        <button v-else type="button" class="btn primary" disabled>
          View {{ tale.engagement.insightsCount }}
        </button>
      </header>

     <div :class="['content-details__enrichment', taleStore.hasLoadedEnrichment ? 'content-details__enrichment--visible' : '']">
      <template v-if="taleStore.hasLoadedEnrichment && taleStore.latestInsights?.length">
        <Content 
          v-for="(insight, index) in taleStore.latestInsights" 
          :key="insight.insightId || insight.slug" 
          :title="insight.title"
          :slug="insight.slug"
          :creator-id="insight.creatorId"
          :creator-username="insight.creatorUsername"
          :created-at="insight.createdAt"
          content-type="insight"
          :summary="insight.summary"
          :is-bordered="true"
        />
      </template>

      <template v-else>
      <PageStatusMessage 
        title="No Insights Found!" 
        message="There are currently no insights attached to this tale."
        icon="inbox" 
        :is-bordered="true"
      />
      </template>
    </div>

      <div class="content-details__enrichment-action">
        <p class="content-details__enrichment-prompt">
          Insights are used to direct the heats of fires started by tales. Present evidence-based analysis, real-world consequences, or matters arising.
        </p>
        <button 
          type="button" 
          class="btn secondary with-icon"
          @click="modalStore.push('CreateInsight', 'Create Insight', { taleId: tale.taleId, category: tale.category })"
        >
          <SvgIcons name="edit" /> Write an insight
        </button>
      </div>

      <!-- Recent Comments Enrichment Block -->
      <header class="page-header">
        <h1>Recent Comments</h1>
        <button 
          type="button"
          class="btn primary" 
          :disabled="tale.engagement.commentsCount === 0"
          @click="viewComments"
        >
          View {{ formatCounts(tale.engagement.commentsCount) }}
        </button>
      </header>

      <div :class="['content-details__enrichment', taleStore.hasLoadedEnrichment ? 'content-details__enrichment--visible' : '']">
        <template v-if="taleStore.hasLoadedEnrichment && taleStore.latestComments?.length">
          <LatestCommentComponent 
            v-for="comment in taleStore.latestComments" 
            :key="comment.commentId" 
            :comment="comment" 
          />
        </template>
         <template v-else>
          <PageStatusMessage 
            title="No Comments Found!" 
            message="There are currently no comments attached to this tale."
            icon="inbox" 
          />
          </template>
      </div>

      <div class="content-details__enrichment-action">
        <p class="content-details__enrichment-prompt">
        Comments help diagnose the causes of rots exposed by tales. Join ongoing discussions and share your perspective on variety of issues raised by this tale.
        </p>
        <button 
          type="button" 
          class="btn secondary with-icon"
          :disabled="tale.isArchived"
          @click="createComment"
        >
          <SvgIcons name="edit" /> Write a comment
        </button>
      </div>
  </div>

  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/content-details.less";
@import "@/assets/css/rich-text.less";
</style>
