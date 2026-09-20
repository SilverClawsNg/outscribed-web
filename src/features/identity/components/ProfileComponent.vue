<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { AccountStatusDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { type ContactType } from '@/utils/enumHelper.ts'
import { formatCounts, truncateText } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import UpdateProfilePhotoComponent from './UpdateProfilePhotoComponent.vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { computed } from 'vue'
import { useProfileStore } from '../stores/ProfileStore.ts' // 🚀 Import Profile Store
import WriterStats from '@/components/WriterStats.vue'

const profileStore = useProfileStore() // 💡 Instantiate Store
const profile = computed(() => profileStore.profile!)

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
  | 'phone'
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
    icon: 'phone',
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

    <div class="shared__content-status">
      <span>Status</span>
      <span :class="profileStore.statusClass">
         {{ AccountStatusDescriptions[profile.status] }}
      </span>
    </div>

    <h1 class="profile-details__title">{{ profile.title }}</h1>
    <h2 class="at profile-details__username">{{ profile.username }}</h2>

    <div class="profile-details__metadata">
      Joined {{ toShortDate(profile.registeredAt) }}
    
      <span class="divider divider--circle"></span>
      {{ formatCounts(profile.viewsCount) }} Views
    </div>

    <template v-if="profile.country">
       <p class="profile-details__country">
      <i>OutScribing from </i>{{ CountryDescriptions[profile.country] }}
       </p>
    </template>

    <UpdateProfilePhotoComponent :payload="profile" @completed="handleRefresh" />

       <div class="profile-details__bio">
                     <template v-if="profile.bio">
                {{ profile.bio }}
                </template>
                <template v-else>
                    <p class="shared__no-content">
              No bio found!
          </p>
            </template>
                    </div>

    <div class="profile-details__actions">
      <button class="profile-details__action-btn" @click="modalStore.push('UpdateProfile', 'Update Profile')">
         <SvgIcons name="user" /> Update profile
      </button>
      <button class="profile-details__action-btn" @click="modalStore.push('ChangePassword', 'Change Password')">
        <SvgIcons name="padlock" />  Change password
      </button>
       <button class="profile-details__action-btn" @click="modalStore.push('Archive', 'Archive Profile')">
        <SvgIcons name="archive" />  Archive profile
      </button>
    </div>

                <WriterStats
                  :username="profile.username"
                  :tales-count="profile.talesCount"
                  :insights-count="profile.insightsCount"
                  :comments-count="profile.commentsCount"
                  :has-margin="true"
                />

     <div class="profile-details__follow-links">
      <RouterLink to="/users/my/follows" class="btn btn--primary profile-details__link-btn profile-details__link-btn--horizontal" title="Following">
        <span class="profile-details__link-value">{{ formatCounts(profile.followsCount) }}</span> 
        <span class="profile-details__link-field">Following</span>
      </RouterLink>
      <RouterLink to="/users/my/followers" class="btn btn--primary profile-details__link-btn profile-details__link-btn--horizontal" title="Followers">
        <span class="profile-details__link-value">{{ formatCounts(profile.followersCount) }}</span> 
        <span class="profile-details__link-field">Followers</span>
      </RouterLink>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
        <SvgIcons name="bookmark" />  Saves
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/saves" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleFavoritesCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/saves" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightFavoritesCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/saves" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Comments">
          <span class="profile-details__link-value">{{ formatCounts(profile.commentFavoritesCount) }}</span> 
          <span class="profile-details__link-field">Comments</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
         <SvgIcons name="upvote" />  Upvotes 
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/votes?votetype=Upvote" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleUpvotesCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/votes?votetype=Upvote" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightUpvotesCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/votes?votetype=Upvote" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Comments">
          <span class="profile-details__link-value">{{ formatCounts(profile.commentUpvotesCount) }}</span> 
          <span class="profile-details__link-field">Comments</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
         <SvgIcons name="downvote" />  Downvotes 
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/votes?votetype=Downvote" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Downvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleDownvotesCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/votes?votetype=Downvote" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Downvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightDownvotesCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/votes?votetype=Downvote" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Comments">
          <span class="profile-details__link-value">{{ formatCounts(profile.commentDownvotesCount) }}</span> 
          <span class="profile-details__link-field">Comments</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
        <SvgIcons name="flag" />  Flags
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/flags" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleFlagsCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/flags" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightFlagsCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/flags" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Comments">
          <span class="profile-details__link-value">{{ formatCounts(profile.commentFlagsCount) }}</span> 
          <span class="profile-details__link-field">Comments</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
        <SvgIcons name="share" />  Shares
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/shares" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Shares">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleSharesCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/shares" class="btn btn--primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Shares">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightSharesCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
      </div>
    </div>

   <div class="profile-details__contacts" aria-label="Social and email contacts">
  <div 
    v-for="item in contactDisplayList" 
    :key="item.type" 
    class="profile-details__contact-item"
  >
    <div class="profile-details__contact-header">
      <p 
  class="profile-details__contact-title" 
  :class="`profile-details__contact-title--${item.type.toLowerCase()}`"
>
  <SvgIcons :name="item.icon" /> {{ item.label }}
</p>
    
      <button :aria-label="`Edit ${item.label}`" @click="handleEditContactClick(item.type)">
        <SvgIcons name="edit" />
      </button>
    </div>

    <!-- Active Contact Present -->
    <template v-if="item.value">
      <p class="profile-details__contact-item-definition">
        <span v-if="item.prefix">{{ item.prefix }}</span>
        <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.value }}</a>
      </p>
    </template>

    <!-- Empty State -->
    <template v-else>
      <PageStatusMessage
        :title="`No ${item.label} Added!`"
        :message="`Add a ${item.label} handle or details.`"
        icon="inbox"
      />
    </template>
  </div>
</div>

  </div>
  
</template>

<style lang="less" scoped>
@import "@/assets/css/profile.less";
</style>