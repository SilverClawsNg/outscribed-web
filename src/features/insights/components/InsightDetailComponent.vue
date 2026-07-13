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
    <section class="content-details__header-container">
      <div class="content-details__header">
        <h1 class="content-details__title">{{ insight.title }}</h1>

        <div class="content-details__metadata-writer">
          By 
          <button 
            class="at" 
            @click="modalStore.push('Profile', 'Profile', insight.creator.accountId)"
          >
            {{ insight.creator.username }}
          </button>
        </div>

        <section class="content-details__metadata">
          <div class="content-details__metadata-date">
            <SvgIcons name='clock' /> {{ toShortDate(insight.createdAt) }}
          </div>

          <div class="content-details__metadata-category">
           <SvgIcons name='tag' /> 
            <router-link 
              :to="`/insights?category=${insight.category}`" 
              class="content-details__category">
              {{ CategoryDescriptions[insight.category] }}
            </router-link>
          </div>

          <div v-if="insight.country" class="content-details__metadata-country">
             <SvgIcons name='globe' />
            <router-link 
              :to="`/insights?country=${insight.country}`" 
              class="content-details__country"
            >
              {{ CountryDescriptions[insight.country] }}            
              </router-link>
          </div>

          <div class="content-details__hamburger">
            <button @click="modalStore.push('InsightStats', 'Insight Stats', insight)">
              <div></div><div></div><div></div>
            </button>
          </div>
        </section>

        <section class="content-details__summary">
          {{ insight.summary }}
        </section>
      </div>
    </section>

    <section class="content-details__main-container">
      <figure v-if="insight.photo" class="content-details__image">
        <img :src="mediaHelper.getUrl(insight.photo, 'insights', 'full') || undefined" :alt="insight.photoCaption" />
        <figcaption class="content-details__image-caption">
          {{ insight.photoCaption }}
        </figcaption>
      </figure>

      <section class="content-details__reading-time">
        — {{ insight.readingTime }} Minutes Read
      </section>

      <template v-if="insight.isArchived">
        <section class="content-details__warning">
            <p>
                This insight has been archived by the author and is no longer publicly visible. We are showing you this archived version as a reference for the discussions and learnings that have stemmed from it. Certain features such as upvoting, downvoting, favoriting, and commenting have been disabled to respect the author's decision to archive. We encourage you to explore the author's other insights and insights for more of their perspectives and contributions.
            </p>
        </section>
      </template>

      <!-- Renders safe HTML details -->
      <section class="content-details__text rich" v-html="sanitizeHtml(insight.detail)"></section>

      <section v-if="insight.addendum && insight.addendumDate" class="content-details__addendum">
        <h4>Addendum - Last Updated {{ toShortDate(insight.addendumDate) }}</h4>
        <ol>
          <li v-for="(addendum, index) in formatAddendum(insight.addendum)" :key="index">
            {{ addendum }}
          </li>
        </ol>
      </section>

      <section v-if="insight.tags && insight.tags.length > 0" class="content-details__tags">
        <h4>Tagged In:</h4>
        <span class="divider line"></span>
        <span v-for="tag in insight.tags" :key="tag.tagId">
          #<router-link :to="`/insights?tag=${tag.tagId}`">{{ tag.name }}</router-link>
        </span>
      </section>

      <section class="content-details__engagement-container">
        <div class="content-details__engagement">
          <h4>Was this insight helpful?</h4>

          <div class="content-details__engagement-rating-buttons">
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

          <div class="content-details__engagement-favorite">
            <button 
              :disabled="uiMeta.isFavoriteDisabled || insight.isArchived" 
              aria-label="Bookmark this insight"
              title="Bookmark"
               @click="engage.favorite(insight.engagement)"
            >
              <SvgIcons name="bookmark" /> {{ uiMeta.favoriteLongText }}
            </button>
          </div>

          <div class="content-details__engagement-flag">
            <button 
              :disabled="uiMeta.isFlagDisabled" 
              aria-label="Report this insight"
              title="Flag"
                @click="modalStore.push('FlagContent', 'Flag Insight', insight.engagement)"
            >
             <SvgIcons name="flag" /> {{ uiMeta.flagLongText }}
            </button>
          </div>

          <div class="content-details__engagement-stats">
            <button @click="modalStore.push('InsightStats', 'Insight Stats', insight)">
               <SvgIcons name="stats" />  View full stats for insight
            </button>
          </div>

          <div class="content-details__engagement-share">
            <h5> <SvgIcons name="share" />Tell others about this insight</h5>
            <div class="content-details__engagement-share-buttons">
              <button><SvgIcons name="facebook" /></button>
              <button><SvgIcons name="twitter" /></button>
              <button><SvgIcons name="linkedin" /></button>
              <button><SvgIcons name="email" /></button>
            </div>
          </div>

        </div>

        <div class="content-details__creator-details">
          <div class="content-details__creator-details-title">
            <h4>Written By</h4>
            <button 
              title="Creator Profile"
              class="at"
              @click="modalStore.push('Profile', 'Profile', insight.creator.accountId)"
            >
              {{ insight.creator.username }}
            </button>
          </div>

          <section class="content-details__creator-details-actions">
            <button 
              title="Creator Profile"
              @click="modalStore.push('Profile', 'Profile', insight.creator.accountId)"
            >
              <span class="icon-user"></span> Profile
            </button>

            <button 
              title="Follow Creator"
              :disabled="creatorUiMeta.isFavoriteDisabled"
              @click="engage.favorite(insight.creator.engagement)"
            >
              <span class="icon-bookmark"></span> {{ creatorUiMeta.favoriteAltText }}
            </button>
          </section>

          <div class="content-details__creator-details-links">
            <router-link 
              :to="`/insights?username=${insight.creator.username}`" 
              class="btn secondary" 
              title="Insights"
            >
              <span class="value">{{ formatCounts(insight.creator.insightsCount) }}</span> 
              <span class="field">Insights</span>
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
      </section>

      <div class="shared__page-title">
        <h1>Inspired By</h1>
           <button 
              @click="router.push(`/tale/${insight.source.slug}`)" 
              class="btn primary">
              View Tale
      </button>
       
      </div>

       <TaleBriefComponent 
            :tale="insight.source" 
          />

      <section :class="['content-details__enrichment', insightStore.hasLoadedEnrichment ? 'show' : '']">

        <template v-if="insightStore.hasLoadedEnrichment">
          <LatestInsightComponent 
            v-for="insight in insightStore.latestInsights" 
            :key="insight.insightId" 
            :insight="insight" 
          />
        </template>

      </section>

      <section class="content-details__enrichment-action">
        <h5>
          If this insight has started a fire, use an insight to direct the heat. With insights, you can present evidence-based analysis of issues raised by insights, explore its real world consequences, and address matters arising.
        </h5>
        <button title="Create Insight" @click="modalStore.push('CreateInsight', 'Create Insight', insight)">
          <span class="icon-edit"></span> Write an insight
        </button>
      </section>

      <div class="shared__page-title">
        <h1>Featured Comments</h1>
        <button 
          v-if="insight.engagement.commentsCount > 0" 
          class="btn primary" 
          @click="viewComments"
        >
          View {{ formatCounts(insight.engagement.commentsCount) }}
        </button>
        <button v-else class="btn primary" disabled>
          View {{ insight.engagement.commentsCount }}
        </button>
      </div>

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
        <h5>
          If this insight has exposed the symptoms, comments help diagnose the cause. Join the on-going discussions and offer your perspectives on variety of issues raised by this insight.
        </h5>
        <button 
         :disabled="insight.isArchived"
        title="Create Comment" 
        @click="createComment">
          <span class="icon-edit"></span> Write a comment
        </button>
      </div>
    </section>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/content-details.less";

</style>