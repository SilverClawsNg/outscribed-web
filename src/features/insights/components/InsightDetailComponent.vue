<script setup lang="ts">

import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useInsightDetailStore } from '../stores/InsightDetailStore';
import { useEngagement } from '@/composables/useEngagement';
import LatestCommentComponent from '@/features/engagements/components/LatestCommentComponent.vue'
import TaleBriefComponent from '@/features/tales/components/TaleBriefComponent.vue'
import { useRouter } from 'vue-router';

import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import { mediaHelper } from '@/utils/mediaHelper'
import { getEngagementMetadata, type ActiveContentContext } from '@/features/engagements/types/EngagementTypes'
import { type InsightDetailDto } from '../types/InsightsTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { sanitizeHtml } from '@/utils/markupHelper';
import ShareBar from '@/components/ShareBar.vue';

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

  <article class="content-details">

    <header class="content-details__header-container">

      <div class="content-details__header">
        <h1 class="content-details__title">{{ insight.title }}</h1>

        <div class="content-details__writer">
          By 
          <button 
           type="button"
             class="content-details__writer-link at" 
            @click="modalStore.push('Profile', 'Profile', insight.creator.accountId)"
          >
            {{ insight.creator.username }}
          </button>
           On <time>{{ toShortDate(insight.createdAt) }}</time>
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

            <div class="content-details__actions">
            <button 
              type="button"
              class="content-details__menu-btn" 
              click="modalStore.push('InsightStats', 'Insight Stats', insight)"
              title="Options"
            >
              <span class="content-details__menu-dot"></span>
              <span class="content-details__menu-dot"></span>
              <span class="content-details__menu-dot"></span>
            </button>
          </div>

        </div>

        <section class="content-details__summary">
          {{ insight.summary }}
        </section>
      </div>
    </header>

    <div class="content-details__main">
      <figure v-if="insight.photo" class="content-details__media">
        <img 
        :src="mediaHelper.getUrl(insight.photo, 'insights', 'full') || undefined" 
        :alt="insight.photoCaption" 
         class="content-details__image" />
        <figcaption class="content-details__image-caption">
          {{ insight.photoCaption }}
        </figcaption>
      </figure>

      <section class="content-details__reading-time">
        — {{ insight.readingTime }} Minutes Read
      </section>

      <template v-if="insight.isArchived">
          <div class="content-details__archived-banner">
        <p>
           This insight has been archived by the author and is no longer publicly visible. We are showing you this archived version as a reference for the discussions and learnings that have stemmed from it. Certain features such as upvoting, downvoting, favoriting, and commenting have been disabled to respect the author's decision to archive. We encourage you to explore the author's other insights and insights for more of their perspectives and contributions.
        </p>
      </div>
     
      </template>

      <!-- Renders safe HTML details -->
      <div class="shared__rich-text" v-html="sanitizeHtml(insight.detail)"></div>

      <div v-if="insight.addendum && insight.addendumDate"  class="content-details__addendum">
        <h4 class="content-details__section-title">Addendum - Last Updated {{ toShortDate(insight.addendumDate) }}</h4>
        <ol class="content-details__addendum-list">
          <li v-for="(entry, index) in formatAddendum(insight.addendum)" :key="index">
            {{ entry }}
          </li>
        </ol>
      </div>

      <section v-if="insight.tags && insight.tags.length > 0" class="content-details__tags">
        <h4 class="content-details__tag-title">Tagged In</h4>
        <span class="divider line"></span>
       <span v-for="tag in insight.tags" :key="tag.slug" class="content-details__tag-item">
          #<router-link :to="`/insights?tag=${tag.slug}`">{{ tag.name }}</router-link>
        </span>
      </section>

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

           <div class="content-details__creator-stats">
            <router-link 
              :to="`/tales?username=${insight.creator.username}`" 
              class="btn secondary" 
              title="Tales"
            >
              <span class="value">{{ formatCounts(insight.creator.talesCount) }}</span> 
              <span class="field">Tales</span>
            </router-link>
            <router-link 
              :to="`/insights?username=${insight.creator.username}`" 
              class="btn secondary" 
              title="Insights"
            >
              <span class="value">{{ formatCounts(insight.creator.insightsCount) }}</span> 
              <span class="field">Insights</span>
            </router-link>
            <router-link 
              :to="`/comments?username=${insight.creator.username}`" 
              class="btn secondary" 
              title="Comments"
            >
              <span class="value">{{ formatCounts(insight.creator.engagement.commentsCount) }}</span> 
              <span class="field">Comments</span>
            </router-link>
          </div>
        </div>
      </div>

      <header class="page-header">
        <h1>Inspired By</h1>
           <button 
           type="button"
              @click="router.push(`/tale/${insight.source.slug}`)" 
              class="btn primary">
              View Tale
      </button>
       
    </header>

       <TaleBriefComponent 
            :tale="insight.source" 
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
      </div>

     <div class="content-details__enrichment-action">
        <p class="content-details__enrichment-prompt">
          If this insight has exposed the symptoms, comments help diagnose the cause. Join the on-going discussions and offer your perspectives on variety of issues raised by this insight.
        </p>
        <button 
        type="button" 
         :disabled="insight.isArchived"
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