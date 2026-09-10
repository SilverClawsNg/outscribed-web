<script setup lang="ts">

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useTaleDetailStore } from '../stores/TaleDetailStore';
import { useEngagement } from '@/composables/useEngagement';
import LatestCommentComponent from '@/features/engagements/components/LatestCommentComponent.vue'
import LatestInsightComponent from '@/features/insights/components/LatestInsightComponent.vue'

import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime, toShortDate } from '@/utils/dateExtensions'
import { mediaHelper } from '@/utils/mediaHelper'
import { getEngagementMetadata, type ActiveContentContext } from '@/features/engagements/types/EngagementTypes'
import { type TaleDetailDto } from '../types/TalesTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { sanitizeHtml } from '@/utils/markupHelper';
import ShareBar from '@/components/ShareBar.vue';

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

  <article class="content-details">

    <!-- Header Section -->
    <header class="content-details__header-container">

      <div class="content-details__header">
        <h1 class="content-details__title">{{ tale.title }}</h1>

        <div class="content-details__writer">
          By 
          <button 
            type="button"
            class="content-details__writer-link at" 
            @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
          >
            {{ tale.creator.username }}
          </button>
        </div>

        <div class="content-details__meta">
          <div class="content-details__meta-item">
            <SvgIcons name="clock" />
            <time>{{ toShortDate(tale.createdAt) }}</time>
          </div>

          <div class="content-details__meta-item">
            <SvgIcons name="tag" /> 
            <RouterLink 
              :to="`/tales?category=${tale.category}`" 
              class="content-details__meta-link"
            >
              {{ CategoryDescriptions[tale.category] }}
            </RouterLink>
          </div>

          <div v-if="tale.country" class="content-details__meta-item">
            <SvgIcons name="globe" />
            <RouterLink 
              :to="`/tales?country=${tale.country}`" 
              class="content-details__meta-link"
            >
              {{ CountryDescriptions[tale.country] }}            
            </RouterLink>
          </div>

          <div class="content-details__actions">
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
        </div>

        <p class="content-details__summary">
          {{ tale.summary }}
        </p>
      </div>
    </header>

    <!-- Main Content Container -->
    <div class="content-details__main">
      <!-- Media Figure -->
      <figure v-if="tale.photo" class="content-details__media">
        <img 
          :src="mediaHelper.getUrl(tale.photo, 'tales', 'full') || undefined" 
          :alt="tale.photoCaption || tale.title" 
          class="content-details__image"
        />
        <figcaption v-if="tale.photoCaption" class="content-details__caption">
          {{ tale.photoCaption }}
        </figcaption>
      </figure>

      <!-- Reading Time Indicator -->
      <div class="content-details__reading-time">
        — {{ tale.readingTime }} Minutes Read
      </div>

      <!-- Archive Banner -->
      <div v-if="tale.isArchived" class="content-details__archived-banner">
        <p>
          This tale has been archived by the author and is no longer publicly visible. We are showing you this archived version as a reference for discussions. Certain features such as voting, saving, and commenting have been disabled.
        </p>
      </div>

      <!-- Safe Rich Text Content -->
      <div class="shared__rich-text" v-html="sanitizeHtml(tale.detail)"></div>

      <!-- Addendum Section -->
      <div v-if="tale.addendum && tale.addendumDate" class="content-details__addendum">
        <h4 class="content-details__section-title">Addendum - Last Updated {{ toShortDate(tale.addendumDate) }}</h4>
        <ol class="content-details__addendum-list">
          <li v-for="(entry, index) in formatAddendum(tale.addendum)" :key="index">
            {{ entry }}
          </li>
        </ol>
      </div>

      <!-- Reality Check Section -->
      <div v-if="tale.realityCheckTitle" class="content-details__realitycheck">
        <div class="content-details__realitycheck-header">
          <h2 class="content-details__realitycheck-heading">Reality Check</h2>
          <span class="content-details__realitycheck-source">{{ tale.realityCheckSource }}</span>
        </div>
        
        <h3 class="content-details__realitycheck-title">
          {{ tale.realityCheckTitle }}
        </h3>
        
        <div class="content-details__realitycheck-body">
          <p>{{ tale.realityCheckSummary }}</p>

          <div class="content-details__realitycheck-actions">
            <button type="button" class="btn secondary" @click="showExternalLink = !showExternalLink">
              Visit Source
            </button>
          </div>

          <div v-if="showExternalLink" class="shared__popover">
            <div class="shared__popover-arrow"></div>
            <p class="shared__popover-text">You will be redirected to {{ tale.realityCheckUrl }}</p>
            <div class="shared__popover-actions">
              <a :href="tale.realityCheckUrl" target="_blank" rel="noopener" @click="showExternalLink = false">Yes</a>
              <button type="button" @click="showExternalLink = false">No</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Taxonomy Tags -->
      <div v-if="tale.tags && tale.tags.length > 0" class="content-details__tags">
        <h4 class="content-details__section-title">Tagged In</h4>
        <span class="divider line"></span>
        <span v-for="tag in tale.tags" :key="tag.slug" class="content-details__tag-item">
          #<RouterLink :to="`/tales?tag=${tag.slug}`">{{ tag.name }}</RouterLink>
        </span>
      </div>

      <!-- Legal Disclaimer -->
      <div class="content-details__disclaimer">
        Disclaimer: This content represents artistic expression and writer perspective. 
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
              @click="modalStore.push('FlagContent', 'Flag Content', tale.engagement)"
            >
              <SvgIcons name="flag" />
              <span>{{ uiMeta.flagLongText }}</span>
            </button>

            <button 
              type="button"
              class="content-details__utility-btn"
              @click="modalStore.push('ContentStats', 'Stats', tale)"
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
              class="content-details__writer-link"
              @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
            >
              @{{ tale.creator.username }}
            </button>
          </div>

          <div class="content-details__creator-actions">
            <button 
              type="button"
              @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
            >
              <SvgIcons name="user" /> Profile
            </button>

            <button 
              type="button"
              :disabled="creatorUiMeta.isFavoriteDisabled"
              @click="engage.favorite(tale.creator.engagement)"
            >
              <SvgIcons name="bookmark" /> {{ creatorUiMeta.favoriteAltText }}
            </button>
          </div>

          <div class="content-details__creator-stats">
            <RouterLink :to="`/tales?username=${tale.creator.username}`" class="btn secondary">
              <span class="value">{{ formatCounts(tale.creator.talesCount) }}</span> 
              <span class="field">Tales</span>
            </RouterLink>
            <RouterLink :to="`/insights?username=${tale.creator.username}`" class="btn secondary">
              <span class="value">{{ formatCounts(tale.creator.insightsCount) }}</span> 
              <span class="field">Insights</span>
            </RouterLink>
            <RouterLink :to="`/comments?username=${tale.creator.username}`" class="btn secondary">
              <span class="value">{{ formatCounts(tale.creator.engagement.commentsCount) }}</span> 
              <span class="field">Comments</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Recent Insights Enrichment Block -->
      <header class="page-header container">
        <h1>Recent Insights</h1>
        <RouterLink 
          v-if="tale.engagement.insightsCount > 0" 
          :to="`/insights?taleId=${tale.taleId}`" 
          class="page-header__action"
        >
          View {{ formatCounts(tale.engagement.insightsCount) }}
        </RouterLink>
        <button v-else type="button" class="page-header__action" disabled>
          View {{ tale.engagement.insightsCount }}
        </button>
      </header>

      <div :class="['content-details__enrichment', taleStore.hasLoadedEnrichment ? 'content-details__enrichment--visible' : '']">
        <template v-if="taleStore.hasLoadedEnrichment">
          <LatestInsightComponent 
            v-for="insight in taleStore.latestInsights" 
            :key="insight.insightId" 
            :insight="insight" 
          />
        </template>
      </div>

      <div class="content-details__enrichment-action">
        <p class="content-details__enrichment-prompt">
          If this piece started a fire, use an insight to direct the heat. Present evidence-based analysis, real-world consequences, or matters arising.
        </p>
        <button 
          type="button" 
          class="content-details__action-btn"
          @click="modalStore.push('CreateInsight', 'Create Insight', { taleId: tale.taleId, category: tale.category })"
        >
          <SvgIcons name="edit" /> Write an insight
        </button>
      </div>

      <!-- Recent Comments Enrichment Block -->
      <header class="page-header container">
        <h1>Recent Comments</h1>
        <button 
          type="button"
          class="page-header__action" 
          :disabled="tale.engagement.commentsCount === 0"
          @click="viewComments"
        >
          View {{ formatCounts(tale.engagement.commentsCount) }}
        </button>
      </header>

      <div :class="['content-details__enrichment', taleStore.hasLoadedEnrichment ? 'content-details__enrichment--visible' : '']">
        <template v-if="taleStore.hasLoadedEnrichment">
          <LatestCommentComponent 
            v-for="comment in taleStore.latestComments" 
            :key="comment.commentId" 
            :comment="comment" 
          />
        </template>
      </div>

      <div class="content-details__enrichment-action">
        <p class="content-details__enrichment-prompt">
          If this content exposed the symptoms, comments help diagnose the cause. Join ongoing discussions and share your perspective.
        </p>
        <button 
          type="button" 
          class="content-details__action-btn"
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
