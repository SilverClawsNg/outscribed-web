<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { AccountStatusDescriptions, CountryDescriptions, AccountStatusClass } from '@/utils/descriptors'
import { type ContactType } from '@/utils/enumHelper.ts'
import { formatCounts, truncateText } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import UpdateProfilePhotoComponent from './UpdateProfilePhotoComponent.vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { computed } from 'vue'
import { useProfileStore } from '../stores/ProfileStore.ts' // 🚀 Import Profile Store
import WriterStats from '@/components/WriterStats.vue'
import PageStatusMessage from '@/components/PageStatusMessage.vue'

const profileStore = useProfileStore() // 💡 Instantiate Store
const profile = computed(() => profileStore.profile!)

const activeActivityTab = ref<string>('tale')

import { useModalStore } from '@/stores/modalStore'
const modalStore = useModalStore()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// 🎯 Strict union matching SvgIcons.vue supported names
export type IconName =
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'tiktok'
  | 'whatsapp'
  | 'telephone'
  | 'website'
  | 'email'
  | 'inbox'
  | 'edit'

interface ContactDisplayConfig {
  type: Exclude<ContactType, 'CopyLink'>
  label: string
  icon: IconName
  prefix?: string
  value: string | null
  link: string
}

// 🎯 Reactive list rendering all contact types dynamically
const contactDisplayList = computed<ContactDisplayConfig[]>(() => [
  {
    type: 'Facebook',
    label: 'Facebook',
    icon: 'facebook',
    prefix: 'https://facebook.com/',
    value: profileStore.facebook,
    link: profileStore.facebookLink ?? '#'
  },
  {
    type: 'Twitter',
    label: 'X',
    icon: 'twitter',
    prefix: 'https://x.com/',
    value: profileStore.twitter,
    link: profileStore.twitterLink ?? '#'
  },
  {
    type: 'LinkedIn',
    label: 'LinkedIn',
    icon: 'linkedin',
    prefix: 'https://linkedin.com/in/',
    value: profileStore.linkedin,
    link: profileStore.linkedinLink ?? '#'
  },
  {
    type: 'Instagram',
    label: 'Instagram',
    icon: 'instagram',
    prefix: 'https://instagram.com/',
    value: profileStore.instagram,
    link: profileStore.instagramLink ?? '#'
  },
  {
    type: 'TikTok',
    label: 'TikTok',
    icon: 'tiktok',
    prefix: 'https://tiktok.com/@',
    value: profileStore.tiktok,
    link: profileStore.tiktokLink ?? '#'
  },
  {
    type: 'WhatsApp',
    label: 'WhatsApp',
    icon: 'whatsapp',
    prefix: 'https://wa.me/',
    value: profileStore.whatsapp,
    link: profileStore.whatsappLink ?? '#'
  },
  {
    type: 'Telephone',
    label: 'Phone',
    icon: 'telephone',
    value: profileStore.telephone,
    link: profileStore.telephoneLink ?? '#'
  },
  {
    type: 'Website',
    label: 'Website',
    icon: 'website',
    value: profileStore.website,
    link: profileStore.websiteLink ?? '#'
  },
  {
    type: 'Email',
    label: 'Email Address',
    icon: 'email',
    value: profileStore.email,
    link: profileStore.email ? `mailto:${profileStore.email}` : '#'
  }
])

// --- ⚙️ INTERNAL EVENT PASS-THROUGHS ---
function handleRefresh() {
  emit('refresh')
}

function handleEditContactClick(platform: ContactType) {
  // 1. Establish the exact domain entity context frame
  profileStore.setActiveContact(platform)
  
  // 2. Open the bare-bones display frame without passing heavy data packages
  modalStore.push('UpdateContact', 'Update Contact')
}

</script>

<template>
<div class="profile-details">
  <!-- Status Badge -->
   <div class="content-status">
      <span class="content-status__label">Status</span>
      <span 
        class="content-status__value" 
        :class="`content-status__value--${AccountStatusClass[profile.status]}`"
      >
       {{ AccountStatusDescriptions[profile.status] }}
      </span>
    </div>

    
  <!-- Photo Update Component -->
  <UpdateProfilePhotoComponent :payload="profile" @completed="handleRefresh" />

    <header class="profile-header">

      <!-- Main Info -->
      <h1 class="profile-header__username at">{{ profile.username }}</h1>
      <h2 v-if="profile.title" class="profile-header__title">{{ profile.title }}</h2>

      <time class="profile-header__date">Joined {{ toShortDate(profile.registeredAt) }}</time>

      <p v-if="profile.country" class="profile-header__country">
        <i>OutScribing from </i>{{ CountryDescriptions[profile.country] }}
      </p>

    </header>

  <!-- Follow Statistics Bar -->
  <div class="profile-metadata">
    <RouterLink to="/users/my/follows" class="profile-metadata__item" title="Following">
      <span class="profile-metadata__item--value">{{ formatCounts(profile.followsCount) }}</span>
      <span class="profile-metadata__item--label">Following</span>
    </RouterLink>

    <RouterLink to="/users/my/followers" class="profile-metadata__item" title="Followers">
      <span class="profile-metadata__item--value">{{ formatCounts(profile.followersCount) }}</span>
      <span class="profile-metadata__item--label">Followers</span>
    </RouterLink>

    <div class="profile-metadata__item" title="Profile Views">
      <span class="profile-metadata__item--value">{{ formatCounts(profile.viewsCount) }}</span>
      <span class="profile-metadata__item--label">Views</span>
    </div>
   
  </div>

  <!-- User Bio -->
  <div class="profile-details__bio">
    <template v-if="profile.bio">
      {{ profile.bio }}
    </template>
    <template v-else>
      <p class="profile-details__bio-empty">No bio found!</p>
    </template>
  </div>

  <!-- Quick Action Buttons -->
  <div class="profile-actions">
    <button 
      type="button" 
      class="btn btn--secondary btn--has-icon"
      @click="modalStore.push('UpdateProfile', 'Update Profile')"
    >
      <div class="profile-actions__label">
        <h3>Update</h3>
        <p>Profile</p>
      </div>
      <SvgIcons name="user" :size="20" />
    </button>

    <button 
      type="button" 
      class="btn btn--secondary btn--has-icon"
      @click="modalStore.push('ChangePassword', 'Change Password')"
    >
      <div class="profile-actions__label">
        <h3>Change</h3>
        <p>Password</p>
      </div>
      <SvgIcons name="padlock" :size="20" />
    </button>

    <button 
      type="button" 
      class="btn btn--secondary btn--has-icon"
      @click="modalStore.push('Archive', 'Archive Profile')"
    >
      <div class="profile-actions__label">
        <h3>Archive</h3>
        <p>Account</p>
      </div>
      <SvgIcons name="archive" :size="20" />
    </button>
  </div>

  <!-- Activity Tabs & Lists -->
  <div class="activity-box">
   

    <!-- Tab Navigation -->
    <div class="activity-box__tabs">
      <button 
        type="button" 
        class="activity-box__tab"
        :class="{ 'activity-box__tab--active': activeActivityTab === 'tale' }"
        @click="activeActivityTab = 'tale'"
      >
        Tales
      </button>
      <button 
        type="button" 
        class="activity-box__tab"
        :class="{ 'activity-box__tab--active': activeActivityTab === 'comment' }"
        @click="activeActivityTab = 'comment'"
      >
        Comments
      </button>
    </div>

    <!-- Activity Content Area -->
    <div class="activity-box__content">
      <!-- Tales Activity Panel -->
      <div 
        class="activity-box__panel"
        :class="{ 'activity-box__panel--active': activeActivityTab === 'tale' }"
      >
        <RouterLink :to="`/tales?username=${profile.username}`" class="btn btn--primary" title="Tales">
          <span class="activity-box__label">Published</span>
          <span class="activity-box__value">{{ formatCounts(profile.talesCount) }}</span>
        </RouterLink>

        <RouterLink to="/tales/my/saves" class="btn btn--primary" title="Tales Saved">
          <span class="activity-box__label">Saved</span>
          <span class="activity-box__value">{{ formatCounts(profile.taleFavoritesCount) }}</span>
        </RouterLink>

        <RouterLink to="/tales/my/shares" class="btn btn--primary" title="Tales Shares">
          <span class="activity-box__label">Shared</span>
          <span class="activity-box__value">{{ formatCounts(profile.taleSharesCount) }}</span>
        </RouterLink>

        <RouterLink to="/tales/my/flags" class="btn btn--primary" title="Tales Upvotes">
          <span class="activity-box__label">Reported</span>
          <span class="activity-box__value">{{ formatCounts(profile.taleFlagsCount) }}</span>
        </RouterLink>

        <div class="divider-multi divider-multi--thick"><span></span></div>

        <RouterLink to="/tales/my/reactions?reactiontype=TransformedPerspective" class="btn btn--primary" title="Tales Transformed Perspective">
          <span class="activity-box__label">Transformed Perspective</span>
          <span class="activity-box__value">{{ formatCounts(profile.transformedPerspectivesCount) }}</span>
        </RouterLink>

        <RouterLink to="/tales/my/reactions?reactiontype=ExposesReality" class="btn btn--primary" title="Tales Exposes Realities">
          <span class="activity-box__label">Exposes Realities</span>
          <span class="activity-box__value">{{ formatCounts(profile.exposesRealitiesCount) }}</span>
        </RouterLink>

        <RouterLink to="/tales/my/reactions?reactiontype=SparksDebate" class="btn btn--primary" title="Tales Sparks Debates">
          <span class="activity-box__label">Sparks Debates</span>
          <span class="activity-box__value">{{ formatCounts(profile.sparksDebatesCount) }}</span>
        </RouterLink>

        <RouterLink to="/tales/my/reactions?reactiontype=MissedCriticalContext" class="btn btn--primary" title="Tales Missed Critical Contexts">
          <span class="activity-box__label">Missed Critical Contexts</span>
          <span class="activity-box__value">{{ formatCounts(profile.missedCriticalContextsCount) }}</span>
        </RouterLink>

        <RouterLink to="/tales/my/reactions?reactiontype=LacksRealWorldRelevance" class="btn btn--primary" title="Tales Lacks Real World Relevance">
          <span class="activity-box__label">Lacks Real World Relevance</span>
          <span class="activity-box__value">{{ formatCounts(profile.lacksRealWorldRelevancesCount) }}</span>
        </RouterLink>
      </div>

      <!-- Comments Activity Panel -->
      <div 
        class="activity-box__panel"
        :class="{ 'activity-box__panel--active': activeActivityTab === 'comment' }"
      >
        <RouterLink :to="`/comments?username=${profile.username}`" class="btn btn--primary" title="Comments">
          <span class="activity-box__label">Published</span>
          <span class="activity-box__value">{{ formatCounts(profile.commentsCount) }}</span>
        </RouterLink>

        <RouterLink to="/comments/my/saves" class="btn btn--primary" title="Comments Saved">
          <span class="activity-box__label">Saved</span>
          <span class="activity-box__value">{{ formatCounts(profile.commentFavoritesCount) }}</span>
        </RouterLink>

        <RouterLink to="/comments/my/flags" class="btn btn--primary" title="Comments Reported">
          <span class="activity-box__label">Reported</span>
          <span class="activity-box__value">{{ formatCounts(profile.commentFlagsCount) }}</span>
        </RouterLink>

        <div class="divider-multi divider-multi--thick"><span></span></div>

        <RouterLink to="/comments/my/votes?reactiontype=Upvote" class="btn btn--primary" title="Comments Upvoted">
          <span class="activity-box__label">Upvoted</span>
          <span class="activity-box__value">{{ formatCounts(profile.commentUpvotesCount) }}</span>
        </RouterLink>

        <RouterLink to="/comments/my/votes?reactiontype=Downvote" class="btn btn--primary" title="Comments Downvoted">
          <span class="activity-box__label">Downvoted</span>
          <span class="activity-box__value">{{ formatCounts(profile.commentDownvotesCount) }}</span>
        </RouterLink>
      </div>
    </div>
  </div>

  <!-- Contacts List -->
  <div class="profile-contacts" aria-label="Social and email contacts">

    <div 
      v-for="item in contactDisplayList" 
      :key="item.type" 
      class="profile-contacts__item"
    >
      <div 
        class="profile-contacts__icon" 
        :class="`profile-contacts__icon--${item.type.toLowerCase()}`"
      >
        <SvgIcons :name="item.icon" /> 
      </div>

      <div class="profile-contacts__content">
        <div 
          class="profile-contacts__label" 
          :class="`profile-contacts__label--${item.type.toLowerCase()}`"
        >
          {{ item.label }}
        </div>
        
        <div class="profile-contacts__value">
          <p v-if="item.value" class="profile-contacts__definition">
            <span v-if="item.prefix">{{ item.prefix }}</span>
            <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.value }}</a>
          </p>
          <p v-else class="profile-contacts__empty">
            No {{ item.label }} Added!
          </p>
        </div>
      </div>

      <div class="profile-contacts__action">
        <button :aria-label="`Edit ${item.label}`" @click="handleEditContactClick(item.type)">
          <SvgIcons name="edit" />
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<style lang="less" scoped>
@import "@/assets/css/profile.less";
</style>