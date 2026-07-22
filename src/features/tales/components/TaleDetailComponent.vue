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
    <section class="content-details__header-container">
      <div class="content-details__header">
        <h1 class="content-details__title">{{ tale.title }}</h1>

        <div class="content-details__metadata-writer">
          By 
          <button 
            class="at" 
            @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
          >
            {{ tale.creator.username }}
          </button>
        </div>

        <section class="content-details__metadata">
          <div class="content-details__metadata-date">
            <SvgIcons name='clock' /> {{ toShortDate(tale.createdAt) }}
          </div>

          <div class="content-details__metadata-category">
           <SvgIcons name='tag' /> 
            <router-link 
              :to="`/tales?category=${tale.category}`" 
              class="content-details__category">
              {{ CategoryDescriptions[tale.category] }}
            </router-link>
          </div>

          <div v-if="tale.country" class="content-details__metadata-country">
             <SvgIcons name='globe' />
            <router-link 
              :to="`/tales?country=${tale.country}`" 
              class="content-details__country"
            >
              {{ CountryDescriptions[tale.country] }}            
              </router-link>
          </div>

          <div class="content-details__hamburger">
            <button @click="modalStore.push('TaleStats', 'Tale Stats', tale)">
              <div></div><div></div><div></div>
            </button>
          </div>
        </section>

        <section class="content-details__summary">
          {{ tale.summary }}
        </section>
      </div>
    </section>

    <section class="content-details__main-container">
      <figure v-if="tale.photo" class="content-details__image">
        <img :src="mediaHelper.getUrl(tale.photo, 'tales', 'full') || undefined" :alt="tale.photoCaption" />
        <figcaption class="content-details__image-caption">
          {{ tale.photoCaption }}
        </figcaption>
      </figure>

      <section class="content-details__reading-time">
        — {{ tale.readingTime }} Minutes Read
      </section>

      <template v-if="tale.isArchived">
        <section class="content-details__warning">
            <p>
                This tale has been archived by the author and is no longer publicly visible. We are showing you this archived version as a reference for the discussions and learnings that have stemmed from it. Certain features such as upvoting, downvoting, favoriting, and commenting have been disabled to respect the author's decision to archive. We encourage you to explore the author's other insights and tales for more of their perspectives and contributions.
            </p>
        </section>
      </template>

      <!-- Renders safe HTML details -->
      <section class="shared__rich-text" v-html="sanitizeHtml(tale.detail)"></section>

      <section v-if="tale.addendum && tale.addendumDate" class="content-details__addendum">
        <h4>Addendum - Last Updated {{ toShortDate(tale.addendumDate) }}</h4>
        <ol>
          <li v-for="(addendum, index) in formatAddendum(tale.addendum)" :key="index">
            {{ addendum }}
          </li>
        </ol>
      </section>

      <section v-if="tale.watchlistTitle" class="content-details__watchlist">
       
        <h2 class="content-details__watchlist-source">
         / fact check / {{ tale.watchlistSource }}
        </h2>
  <h3 class="content-details__watchlist-title">
          {{ tale.watchlistTitle }}
        </h3>
        <div class="content-details__watchlist-summary">
          {{ tale.watchlistSummary }}
          <button @click="showExternalLink = !showExternalLink">...Continue Reading</button>
          
          <div v-if="showExternalLink" class="shared__popover">
            <div class="shared__popover-arrow"></div>
            <p class="shared__popover-text">You would be redirected to {{ tale.watchlistUrl }}</p>
            <div class="shared__popover-actions">
              <a 
                :href="tale.watchlistUrl" 
                target="_blank" 
                class="content-details__watchlist-action"
                @click="showExternalLink = false">
                Yes
              </a>
              <button class="btn-cancel" @click="showExternalLink = false">No</button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="tale.tags && tale.tags.length > 0" class="content-details__tags">
        <h4>Tagged In:</h4>
        <span class="divider line"></span>
        <span v-for="tag in tale.tags" :key="tag.tagId">
          #<router-link :to="`/tales?tag=${tag.tagId}`">{{ tag.name }}</router-link>
        </span>
      </section>

      <section class="content-disclaimer">
        Disclaimer: OutScribed tales are informed speculative narratives. 
         <button @click="modalStore.push('TaleDisclaimer', 'Disclaimer')">
              [Read full disclaimer]
            </button>
      </section>

      <section class="content-details__engagement-container">
        <div class="content-details__engagement">
          <h4>Was this tale helpful?</h4>

          <div class="content-details__engagement-rating-buttons">
            <button 
              class="btn primary" 
              :disabled="uiMeta.isVoteDisabled || tale.isArchived"
              @click="engage.vote(tale.engagement, 'Upvote')"
            >
              <span :class="['check-box', uiMeta.isUpvoteChecked]">✓</span>
              <span class="label">Yes</span>
              <span class="stats">{{ formatCounts(tale.engagement.upvotesCount) }}</span>
            </button>

            <button 
              class="btn secondary" 
              :disabled="uiMeta.isVoteDisabled || tale.isArchived"
              @click="engage.vote(tale.engagement, 'Downvote')"
            >
              <span :class="['check-box', uiMeta.isDownvoteChecked]">✓</span>
              <span class="label">No</span>
              <span class="stats">{{ formatCounts(tale.engagement.downvotesCount) }}</span>
            </button>
          </div>

          <div class="content-details__engagement-favorite">
            <button 
              :disabled="uiMeta.isFavoriteDisabled || tale.isArchived" 
              aria-label="Bookmark this tale"
              title="Bookmark"
               @click="engage.favorite(tale.engagement)"
            >
             <SvgIcons name="bookmark" /> {{ uiMeta.favoriteLongText }}
            </button>
          </div>

          <div class="content-details__engagement-flag">
            <button 
              :disabled="uiMeta.isFlagDisabled" 
              aria-label="Report this tale"
              title="Flag"
                @click="modalStore.push('FlagContent', 'Flag Tale', tale.engagement)"
            >
              <SvgIcons name="flag" /> {{ uiMeta.flagLongText }}
            </button>
          </div>

          <div class="content-details__engagement-stats">
            <button @click="modalStore.push('TaleStats', 'Tale Stats', tale)">
              <SvgIcons name="stats" /> View full stats for tale
            </button>
          </div>

          <div class="content-details__engagement-share">
            <h5> <SvgIcons name="share" />Tell others about this tale</h5>
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
              @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
            >
              {{ tale.creator.username }}
            </button>
          </div>

          <section class="content-details__creator-details-actions">
            <button 
              title="Creator Profile"
              @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
            >
              <span class="icon-user"></span> Profile
            </button>

            <button 
              title="Follow Creator"
              :disabled="creatorUiMeta.isFavoriteDisabled"
              @click="engage.favorite(tale.creator.engagement)"
            >
              <span class="icon-bookmark"></span> {{ creatorUiMeta.favoriteAltText }}
            </button>
          </section>

          <div class="content-details__creator-details-links">
            <router-link 
              :to="`/tales?username=${tale.creator.username}`" 
              class="btn secondary" 
              title="Tales"
            >
              <span class="value">{{ formatCounts(tale.creator.talesCount) }}</span> 
              <span class="field">Tales</span>
            </router-link>
            <router-link 
              :to="`/insights?username=${tale.creator.username}`" 
              class="btn secondary" 
              title="Insights"
            >
              <span class="value">{{ formatCounts(tale.creator.insightsCount) }}</span> 
              <span class="field">Insights</span>
            </router-link>
            <router-link 
              :to="`/comments?username=${tale.creator.username}`" 
              class="btn secondary" 
              title="Comments"
            >
              <span class="value">{{ formatCounts(tale.creator.engagement.commentsCount) }}</span> 
              <span class="field">Comments</span>
            </router-link>
          </div>
        </div>
      </section>

      <div class="shared__page-title">
        <h1>Featured Insights</h1>
        <router-link 
          v-if="tale.engagement.insightsCount > 0" 
          :to="`/insights?taleId=${tale.taleId}`" 
          class="btn primary" 
          title="View Insights"
        >
          View {{ formatCounts(tale.engagement.insightsCount) }}
        </router-link>
        <a 
          v-else 
          href="#" 
          title="No Insights" 
          class="disabled btn primary" 
          @click.prevent
        >
          View {{ tale.engagement.insightsCount }}
        </a>
      </div>

      <section :class="['content-details__enrichment', taleStore.hasLoadedEnrichment ? 'show' : '']">

        <template v-if="taleStore.hasLoadedEnrichment">
          <LatestInsightComponent 
            v-for="insight in taleStore.latestInsights" 
            :key="insight.insightId" 
            :insight="insight" 
          />
        </template>

      </section>

      <section class="content-details__enrichment-action">
        <h5>
          If this tale has started a fire, use an insight to direct the heat. With insights, you can present evidence-based analysis of issues raised by tales, explore its real world consequences, and address matters arising.
        </h5>
        <button title="Create Insight" @click="modalStore.push('CreateInsight', 'Create Insight', { taleId: tale.taleId, category: tale.category })">
          <SvgIcons name="edit" /> Write an insight
        </button>
      </section>

      <div class="shared__page-title">
        <h1>Featured Comments</h1>
        <button 
          v-if="tale.engagement.commentsCount > 0" 
          class="btn primary" 
          @click="viewComments"
        >
          View {{ formatCounts(tale.engagement.commentsCount) }}
        </button>
        <button v-else class="btn primary" disabled>
          View {{ tale.engagement.commentsCount }}
        </button>
      </div>

      <div :class="['content-details__enrichment', taleStore.hasLoadedEnrichment ? 'show' : '']">
        <template v-if="taleStore.hasLoadedEnrichment">
          <LatestCommentComponent 
            v-for="comment in taleStore.latestComments" 
            :key="comment.commentId" 
            :comment="comment" 
          />
        </template>
      </div>

      <div class="content-details__enrichment-action">
        <h5>
          If this tale has exposed the symptoms, comments help diagnose the cause. Join the on-going discussions and offer your perspectives on variety of issues raised by this tale.
        </h5>
        <button 
         :disabled="tale.isArchived"
        title="Create Comment" 
        @click="createComment">
          <SvgIcons name="edit" /> Write a comment
        </button>
      </div>
    </section>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/content-details.less";
@import "@/assets/css/rich-text.less";
</style>