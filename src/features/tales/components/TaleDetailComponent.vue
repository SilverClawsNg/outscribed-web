<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useTaleDetailStore } from '../stores/TaleDetailStore';
import { useEngagement } from '@/composables/useEngagement';
import LatestCommentComponent from '@/features/engagements/components/LatestCommentComponent.vue'
import { useContentCommentsStore } from '@/features/engagements/stores/ContentCommentsStore.ts';

import { formatAddendum, formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime, toShortDate } from '@/utils/dateExtensions'
import { mediaHelper } from '@/utils/mediaHelper'
import { getEngagementMetadata, type ActiveContentContext, type Engageable } from '@/features/engagements/types/EngagementTypes'
import { type TaleDetailDto } from '../types/TalesTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { sanitizeHtml } from '@/utils/markupHelper';
import ShareBar from '@/components/ShareBar.vue';
import Content from '@/components/Content.vue'
import WriterStats from '@/components/WriterStats.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { postAsync } from '@/api/apiPostServices'
import { useLoginHint } from '@/utils/authHelper'
import type { ReactionType } from '@/utils/enumHelper';
import StoryContent from './StoryContentComponent.vue';

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()
const contentStore = useContentCommentsStore();

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
    pinnedComment: null
  };

function viewComments() {
  contentStore.setActiveContent(content);
  modalStore.push('ContentComments', 'Comments')
}

function createComment() {
  contentStore.setActiveContent(content);
  modalStore.push('CreateComment', 'New Comment')
}

interface ReactionConfig {
  reactionType: ReactionType
  label: string
  description: string
  countKey: keyof Engageable
}

const activeReaction = ref<string | null>(null)
const expandedHelpId = ref<string | null>(null)
const reactionConfigs: ReactionConfig[] = [
  {
    reactionType: 'TransformedPerspective',
    label: 'Transformed my perspective',
    description: 'This story completely changed how I see this issue and made me rethink what I used to believe.',
    countKey: 'transformedPerspectiveCount' as keyof Engageable
  },
  {
    reactionType: 'ExposesReality',
    label: 'Exposes crucial realities',
    description: 'Brings hidden rules, legal truths, or behind-the-scenes facts to light in a way that directly impacts everyday life.',
    countKey: 'exposesRealityCount' as keyof Engageable
  },
  {
    reactionType: 'SparksDebate',
    label: 'Sparks necessary debate',
    description: 'Raises important real-world questions that deserve open discussion, honest debate, and different points of view.',
    countKey: 'sparksDebateCount' as keyof Engageable
  },
  {
    reactionType: 'MissedCriticalContext',
    label: 'Missed critical context',
    description: 'Leaves out important background information or key legal facts needed to get the full picture.',
    countKey: 'missedCriticalContextCount' as keyof Engageable
  },
  {
    reactionType: 'LacksRealWorldRelevance',
    label: 'Lacks real-world relevance',
    description: 'Does not connect to actual everyday laws, practical situations, or real problems ordinary people face.',
    countKey: 'lacksRealWorldRelevanceCount' as keyof Engageable
  }
]
// Check active vote state directly against engagement model
function isVoteActive(type: ReactionType): boolean {
  return tale.value.engagement?.myReaction === type
}

function handleVoteClick(type: ReactionType) {
  if (uiMeta.value.isVoteDisabled || tale.value.isArchived) return
  engage.react(tale.value.engagement, type)
}

function toggleHelp(type: ReactionType) {
  expandedHelpId.value = expandedHelpId.value === type ? null : type
}

type SupportedIconName = 'whatsapp' | 'twitter' | 'linkedin' | 'facebook' | 'email' | 'chain' | 'bookmark' | 'stats' | 'flag' | 'share'

interface DirectShareLink {
  name: string
  type: string
  iconName: SupportedIconName
  url: string
  modifier: string
}

const isNativeShareSupported = ref(false)
const linkCopied = ref(false)
const isLoggedIn = useLoginHint()

onMounted(() => {
  isNativeShareSupported.value = !!navigator.share
})

// --- SHARE METRIC LOGGING ---
const logShareMetric = async (platformType: string) => {
  try {
    const endpoint = isLoggedIn.value ? 'api/sharing/authenticated' : 'api/sharing/anonymous'
    const outcome = await postAsync(
      endpoint,
      {
        contentId: tale.value.taleId,
        content: 'Tale',
        contact: platformType
      },
      isLoggedIn.value
    )

    if (outcome.value) {
      Object.assign(tale.value.engagement, outcome.value)
    }

    localStorage.removeItem('tale:anchor:shares')
  } catch (err) {
    console.warn('Failed to log share metric:', err)
  }
}

// --- NATIVE DEVICE SHARE ---
const handleNativeShare = async () => {
  try {
    await navigator.share({
      title: tale.value.title,
      text: tale.value.summary,
      url: tale.value.slug
    })
    await logShareMetric('native_share_sheet')
  } catch (err) {
    // User cancelled share sheet
  }
}

// --- COPY DIRECT LINK ---
const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(tale.value.slug)
    linkCopied.value = true
    await logShareMetric('CopyLink')

    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

// --- COMPUTED SOCIAL LINKS ---
const encodedUrl = computed(() => encodeURIComponent(tale.value.slug || ''))
const encodedTitle = computed(() => encodeURIComponent(tale.value.slug || ''))
const shareText = computed(() => encodeURIComponent(`${tale.value.title} - ${tale.value.slug}`))

const socialLinks = computed<DirectShareLink[]>(() => [
  {
    name: 'WhatsApp',
    type: 'WhatsApp',
    iconName: 'whatsapp',
    url: `https://api.whatsapp.com/send?text=${shareText.value}`,
    modifier: 'whatsapp'
  },
  {
    name: 'Facebook',
    type: 'Facebook',
    iconName: 'facebook',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`,
    modifier: 'facebook'
  },
  {
    name: 'X',
    type: 'Twitter',
    iconName: 'twitter',
    url: `https://twitter.com/intent/tweet?text=${encodedTitle.value}&url=${encodedUrl.value}`,
    modifier: 'twitter'
  },
  {
    name: 'LinkedIn',
    type: 'LinkedIn',
    iconName: 'linkedin',
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`,
    modifier: 'linkedin'
  },
  {
    name: 'Email',
    type: 'Email',
    iconName: 'email',
    url: `mailto:?subject=${encodedTitle.value}&body=${encodeURIComponent(`I thought you might find this interesting:\n\n${tale.value.title}\n\n${tale.value.slug}`)}`,
    modifier: 'email'
  }
])







</script>

<template>

<article class="story">

     <!-- Archive Banner -->
        <template v-if="tale.isArchived">
            <PageStatusMessage 
              title="Tale is archived!" 
              message="This tale has been archived by the author and is no longer publicly visible. We are showing you this archived version as a reference for discussions. Certain features such as voting, saving, and commenting have been disabled."
              icon="archive" 
              :is-bordered="true"
            />
      </template>

      
     <div class="story-options">

        <button 
              type="button"
              class="story-options__btn" 
              @click="modalStore.push('TaleStats', 'Tale Stats', tale)"
              title="Tale Metrics"
            >
              <span class="story-options__btn--dot"></span>
              <span class="story-options__btn--dot"></span>
              <span class="story-options__btn--dot"></span>
            </button>
     </div>


<StoryContent 
      :title="tale.title"
      :date="tale.createdAt"
      :summary="tale.summary"
      :photo="tale.photo"
      :photo-caption="tale.photoCaption"
      :content="tale.detail"
      :reading-time="tale.readingTime"
      :reality-check-title="tale.realityCheckTitle"
      :reality-check-summary="tale.realityCheckSummary"
      :reality-check-source="tale.realityCheckSource"
      :reality-check-url="tale.realityCheckUrl"
      :category="tale.category"
      :country="tale.country"
      :tags="tale.tags"
      :addendum="tale.addendum"
      :addendum-date="tale.addendumDate"
    />






      
  <section class="story-reactions">

    <h3 class="story-reactions__title">How did this tale impact you?</h3>


    <div class="story-reactions__grid">
      <div
        v-for="item in reactionConfigs"
        :key="item.reactionType"
        class="story-reactions-card"
        :class="{ 'story-reactions-card--expanded': expandedHelpId === item.reactionType }"
      >
        <!-- TWO-COLUMN ROW CONTAINER -->
        <div class="story-reactions-card__row">
          <!-- COLUMN 1: VOTE SELECTION BUTTON -->
          <button
            type="button"
            class="reaction-column"
            :class="{ 
              'reaction-column--active': isVoteActive(item.reactionType),
              'reaction-column--disabled': uiMeta.isVoteDisabled || tale.isArchived
            }"
            :disabled="uiMeta.isVoteDisabled || tale.isArchived"
            @click="handleVoteClick(item.reactionType)"
          >
            <div class="reaction-column__checkbox-wrapper">
              <span class="reaction-column__custom-checkbox" :class="{ 'is-checked': isVoteActive(item.reactionType) }">
                <SvgIcons name="checkbox" />
              </span>
            </div>

            <span class="reaction-column__label">{{ item.label }}</span>

            <span class="reaction-column__count">
              {{ formatCounts(tale.engagement[item.countKey] as number) }}
            </span>
          </button>

          <!-- COLUMN 2: SOLID HELP TOGGLE BUTTON (2.5rem / 40px) -->
          <button
            type="button"
            class="reaction-help-column"
            :class="{ 'reaction-help-column--active': expandedHelpId === item.reactionType }"
            @click="toggleHelp(item.reactionType)"
            :title="`Learn what '${item.label}' means`"
            aria-label="Toggle reaction description"
          >
            ?
          </button>
        </div>

        <!-- EXPANDABLE DESCRIPTION DRAWER -->
        <Transition name="expand-help">
          <div v-if="expandedHelpId === item.reactionType" class="reaction-card__help-drawer">
            <p class="help-text">
              <strong>What this means:</strong> {{ item.description }}
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </section>
 
  <section class="story-comments">
    
      <!-- Recent Comments Enrichment Block -->
  <header class="page-header inline">
       <h1>Recent Comments</h1>
        <button 
          type="button"
          class="btn btn--secondary"  
          :disabled="tale.engagement.commentsCount === 0"
          @click="viewComments"
        >
          View {{ formatCounts(tale.engagement.commentsCount) }}
        </button>
    </header>

      <div :class="['story-comments__recent', taleStore.hasLoadedEnrichment ? 'story-comments__recent--visible' : '']">
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

      <div class="story-comments__action">
        <p class="story-comments__action--prompt">
        Comments help diagnose the causes of rots exposed by tales. Join ongoing discussions and share your perspective on variety of issues raised by this tale.
        </p>
        <button 
          type="button" 
          class="btn btn--secondary btn--has-icon"
          :disabled="tale.isArchived"
          @click="createComment"
        >
          <SvgIcons name="edit" /> Write a comment
        </button>
      </div>
  </section>

  <footer class="story-footer">

        <section class="story-credits">

          <div class="story-credits__heading">

          <div class="story-credits__meta">
        
              Written  By
          <button 
            type="button"
            class="at"
            @click="modalStore.push('Profile', 'Profile', tale.creator.accountId)"
          >
          {{ tale.creator.username }}
          </button>
               on    <time class="story-credits__meta--date">{{toShortDate(tale.createdAt)}}</time>


        </div>
        
          <div class="story-credits__stats">
        
              <RouterLink 
              :to="`/tales?username=${tale.creator.username}`" 
              :disabled="tale.creator.talesCount <= 0"
              title="Tales"
            >
              <span class="story-credits__value">{{ formatCounts(tale.creator.talesCount  || 0) }} </span> 
              <span class="story-credits__label">Tales</span>
            </RouterLink>
          <span class="divider divider--circle"></span>
           <RouterLink 
            :to="`/comments?username=${tale.creator.username}`" 
            :disabled="tale.creator.commentsCount <= 0"
            title="Comments"
          >
            <span class="story-credits__value">{{ formatCounts(tale.creator.commentsCount || 0) }} </span> 
            <span class="story-credits__label">Comments</span>
          </RouterLink>

        </div>


          </div>

        <div class="story-credits__actions">

            <button 
              type="button"
               class="btn btn--secondary"
              title="Follow Creator"
              :disabled="creatorUiMeta.isFavoriteDisabled"
              @click="engage.favorite(tale.creator.engagement)"
            >
            {{ creatorUiMeta.favoriteAltText }}
            </button>

        </div>

      </section>

      <div class="divider-multi divider-multi--thick"><span></span></div>

      <!-- ROW 1: PRIMARY ACTIONS -->
    <div class="story-utility__primary">
      <!-- 1. FAVORITE / BOOKMARK -->
      <button
        type="button"
        class="action-btn"
        :class="{ 'action-btn--active': tale.engagement?.isFavorite }"
        :disabled="uiMeta.isFavoriteDisabled || tale.isArchived"
        title="Bookmark tale"
        aria-label="Bookmark this tale"
        @click="engage.favorite(tale.engagement)"
      >
        <SvgIcons name="bookmark" :sze="20" />
        <span class="btn-label">{{ uiMeta.favoriteLongText || 'Add to Favorites' }}</span>
      </button>

      <!-- 2. NATIVE DEVICE SHARE (ONLY RENDERED WHEN NATIVE IS SUPPORTED) -->
      <button
        v-if="isNativeShareSupported"
        type="button"
        class="action-btn"
        title="Share tale"
        aria-label="Share this tale"
        @click="handleNativeShare"
      >
        <SvgIcons name="share" :sze="20" />
        <span class="btn-label">Share Tale</span>
      </button>

      <!-- 3. METRICS / STATS -->
      <button
        type="button"
        class="action-btn"
        title="View story statistics"
        aria-label="View story statistics"
        @click="modalStore.push('TaleStats', 'Stats', tale)"
      >
        <SvgIcons name="stats" :sze="20" />
        <span class="btn-label">View Metrics</span>
      </button>

      <!-- 4. REPORT / FLAG -->
      <button
        type="button"
        class="action-btn action-btn--flag"
        :disabled="uiMeta.isFlagDisabled"
        title="Report this content"
        aria-label="Report content"
        @click="modalStore.push('FlagContent', 'Flag Content', tale.engagement)"
      >
        <SvgIcons name="flag" :sze="20" />
         <span class="btn-label">Report Tale</span>
      </button>
    </div>

          <div class="divider-multi divider-multi--thick"><span></span></div>

    <!-- ROW 2: DIRECT SOCIAL ICONS (ONLY RENDERED WHEN NATIVE SHARE IS UNSUPPORTED) -->
    <div v-if="!isNativeShareSupported" class="story-utility__secondary">
      <a
        v-for="link in socialLinks"
        :key="link.type"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        :class="['social-icon-btn', `social-icon-btn--${link.modifier}`]"
        :title="`Share on ${link.name}`"
        @click="logShareMetric(link.type)"
      >
        <SvgIcons :name="link.iconName" :size="24" />
      </a>

      <!-- COPY LINK ICON BUTTON -->
      <button
        type="button"
        class="social-icon-btn social-icon-btn--copy"
        :class="{ 'social-icon-btn--copied': linkCopied }"
        :title="linkCopied ? 'Link Copied!' : 'Copy direct link'"
        @click="handleCopyLink"
      >
        <SvgIcons name="chain" />
      </button>
    </div>

  </footer>

  </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/rich-text.less";

.story {
  width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;
  padding: 3rem 0;
  background-color: var(--background-color);
}

  
//STORY HEADER

.story-options{
      display: flex;
      justify-content:center;
      margin-bottom: 2rem;
      
  &__btn {
    width: auto;
    height: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 4px;
    padding: 4px 6px;

    &--dot {
      width: 4px;
      height: 4px;
      background-color: var(--text-color);
      border-radius: 50%;
    }

    &:hover {
      background-color: var(--light-background-color);
    }
  }
    }




.story-reactions {
  width: 100%;
  margin: 2rem 0;

  &__title {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }
}

.story-reactions-card {
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.15s ease;

  &--expanded {
    border-width: 2px;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 2.5rem; // Vote column takes available space; Help column fixed at 40px (2.5rem)
    align-items: stretch;
  }
}

/* COLUMN 1: VOTE SELECTION BUTTON */
.reaction-column {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-right: 1px solid var(--border-color);
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;

  &:hover:not(&--disabled) {
    background-color:var(--light-background-color);

    .reaction-column__custom-checkbox {
      border-color: var(--thick-border-color);
    }
  }

  &--active {
   //background-color:var(--light-background-color);

    .reaction-column__label {
      font-weight: 600;
    }

    .reaction-column__count {
      font-weight: 600;
    }
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__checkbox-wrapper {
    display: flex;
    align-items: center;
    margin-right: 0.85rem;
  }

  &__custom-checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.15s ease;

    &.is-checked {
      background-color: var(--background-color);
      border-color: var(--thick-border-color);
      color: var(--text-color);
    }

    svg {
      width: 12px;
      height: 12px;
    }
  }

  &__label {
    flex: 1;
    font-weight:normal;
     //color: var(--muted-link-color);
  }

  &__count {
    color: var(--text-color);
    font-weight:normal;
  }
}

/* COLUMN 2: SOLID HELP TOGGLE BUTTON */
.reaction-help-column {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--muted-link-color);
  font-family: @font-heading; // Trebuchet MS
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--light-background-color);
  }

  &--active {
    color: @link-color;
  }
}

/* EXPANDABLE DESCRIPTION DRAWER */
.reaction-card__help-drawer {
  padding: 0.75rem 1rem 0.85rem 1rem;
  border-top: 1px solid var(--border-color);

  .help-text {
    color: var(--muted-text-color)
  }
}

/* TRANSITION ANIMATION */
.expand-help-enter-active,
.expand-help-leave-active {
  transition: all 0.2s ease-out;
  max-height: 120px;
  opacity: 1;
  overflow: hidden;
}

.expand-help-enter-from,
.expand-help-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.story-footer{
  background-color: var(--light-background-color);
  padding: 1.5rem 0.75rem;
}

.story-credits {
    display: flex;
    justify-content: space-between;
    align-items:center;
    column-gap: 1rem;
    padding-bottom: 0.5rem;
  
   
    color:var(--muted-text-color);
    
  &__credits-stats,
  &__credits-meta{
    display: flex;
    align-items:center;

    & a{
      display: flex;
      column-gap: 0.25rem;

    }

    
     
  }

    &__value {
        margin-right: 0.25rem;
        }

        &__label {
          font-size: 0.85rem;
          font-weight: normal;
        }

  &__credits-date{
    color: var(--muted-text-color);
    font-size: 0.9rem;
  }

  &__credits-actions{
    display: flex;
    column-gap: 0.5rem;
  }
  }

.story-utility-wrapper {
  width: 100%;
  overflow: hidden;
  transition: border-color 0.15s ease;
 padding-top: 0.5rem;
 
}

.story-utility {
  display: flex;
  align-items: center;
  justify-content: space-around;
padding-top: 0.5rem;
  
&__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: transparent;
  //border-right: 1px solid var(--border-color);
  font-weight: 600;
  font-size:0.95rem;
  width: 25%;
  color: var(--muted-link-color);

  &:last-child{
    border-right:none;
  }

  &--active,
  &:hover:not(:disabled) {
    color: @link-color;
    background-color: var(--light-background-color);
  }

  &--flag {
    margin-left: auto;
    padding: 0.45rem;
    color: #94a3b8;

    &:hover:not(:disabled) {
      color: @logo-red;
      background-color: rgba(220, 38, 38, 0.08);
      border-color: transparent;
    }
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

&__drawer {
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border-color);
}
}
 
/* TRANSITION ANIMATION */
.expand-share-enter-active,
.expand-share-leave-active {
  transition: all 0.2s ease-out;
  max-height: 120px;
  opacity: 1;
  overflow: hidden;
}

.expand-share-enter-from,
.expand-share-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.story-comments{
  margin-bottom: 2rem;

  &__recent {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.6s ease-out, opacity 0.5s ease-in;

    &--visible {
      max-height: 1200px;
      opacity: 1;
    }
  
  }

  &__action {
    padding: 1rem 0;

     &--prompt {
      font-style: italic;
      color:var(--muted-text-color);
      line-height: 1.4;
      margin-bottom: 0.75rem;
    }
  }
}

  /* PRIMARY ACTIONS ROW */
  .story-utility__primary {
    display: flex;
    align-items: center;
     justify-content: center;
    gap: 0.5rem;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  /* SECONDARY SOCIAL ICON ROW (FALLBACK) */
 .story-utility__secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
     width: 100%;
     padding-top:0.5rem;
  }
      
.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    color: var(--muted-link-color);
    border-radius: 99999px;
    font-size: 0.9rem;
    font-weight: 600;

     &:hover {
          border-color: @link-color;
        }
      }



/* COMPACT SOCIAL ICON BADGES */
.social-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  color: #ffffff;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
    color: #ffffff;
  }

 

  /* Brand Colors */
  &--whatsapp { background: @whatsapp-color; }
  &--facebook { background: @facebook-color; }
  &--linkedin { background: @linkedin-color; }
  &--email { background: @email-color; }
  &--copy { background: @logo-purple; }

  &--twitter {
    background: var(--x-background-color, #0f172a);
    color: var(--x-color, #ffffff);
  }

  &--copied {
    background: #16a34a !important; // Green feedback state on copy
  }
}
</style>
