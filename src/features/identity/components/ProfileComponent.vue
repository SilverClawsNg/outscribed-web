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

const profileStore = useProfileStore() // 💡 Instantiate Store
const profile = computed(() => profileStore.profile!)

import { type ContactDto } from '../types/IdentityTypes.ts'
import { useModalStore } from '@/stores/modalStore'
const modalStore = useModalStore()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// --- 🎨 LOCAL COMPUTED VIEW-LOGIC PIPELINE ---


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
      <template v-if="profile.country">
        <span class="divider circle"></span>
        {{ CountryDescriptions[profile.country] }}
      </template>
      <span class="divider circle"></span>
      {{ formatCounts(profile.viewsCount) }} Views
    </div>

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
      <button @click="modalStore.push('UpdateProfile', 'Update Profile')">
         <SvgIcons name="user" /> Update profile
      </button>
      <button @click="modalStore.push('ChangePassword', 'Change Password')">
        <SvgIcons name="padlock" />  Change password
      </button>
    </div>

    <div class="profile-details__content-links">
      <RouterLink :to="`/tales?username=${profile.username}`" class="btn secondary" title="Tales">
        <span class="value">{{ formatCounts(profile.talesCount) }}</span> 
        <span class="field">Tales</span>
      </RouterLink>
      <RouterLink :to="`/insights?username=${profile.username}`" class="btn secondary" title="Insights">
        <span class="value">{{ formatCounts(profile.insightsCount) }}</span> 
        <span class="field">Insights</span>
      </RouterLink>
      <RouterLink :to="`/comments?username=${profile.username}`" class="btn secondary" title="Comments">
        <span class="value">{{ formatCounts(profile.commentsCount) }}</span> 
        <span class="field">Comments</span>
      </RouterLink>
    </div>

    <div class="profile-details__follow-links">
      <RouterLink to="/users/my/follows" class="btn primary" title="Following">
        <span class="value">{{ formatCounts(profile.followsCount) }}</span> 
        <span class="field">Following</span>
      </RouterLink>
      <RouterLink to="/users/my/followers" class="btn primary" title="Followers">
        <span class="value">{{ formatCounts(profile.followersCount) }}</span> 
        <span class="field">Followers</span>
      </RouterLink>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
        <SvgIcons name="bookmark" />  Saves
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/saves" class="btn primary" title="Tales Upvotes">
          <span class="value">{{ formatCounts(profile.taleFavoritesCount) }}</span> <span class="field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/saves" class="btn primary" title="Insights Upvotes">
          <span class="value">{{ formatCounts(profile.insightFavoritesCount) }}</span> <span class="field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/saves" class="btn primary" title="Comments">
          <span class="value">{{ formatCounts(profile.commentFavoritesCount) }}</span> <span class="field">Comments</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
         <SvgIcons name="upvote" />  Upvotes 
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/votes?votetype=Upvote" class="btn primary" title="Tales Upvotes">
          <span class="value">{{ formatCounts(profile.taleUpvotesCount) }}</span> <span class="field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/votes?votetype=Upvote" class="btn primary" title="Insights Upvotes">
          <span class="value">{{ formatCounts(profile.insightUpvotesCount) }}</span> <span class="field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/votes?votetype=Upvote" class="btn primary" title="Comments">
          <span class="value">{{ formatCounts(profile.commentUpvotesCount) }}</span> <span class="field">Comments</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
         <SvgIcons name="downvote" />  Downvotes 
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/votes?votetype=Downvote" class="btn primary" title="Tales Downvotes">
          <span class="value">{{ formatCounts(profile.taleDownvotesCount) }}</span> <span class="field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/votes?votetype=Downvote" class="btn primary" title="Insights Downvotes">
          <span class="value">{{ formatCounts(profile.insightDownvotesCount) }}</span> <span class="field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/votes?votetype=Downvote" class="btn primary" title="Comments">
          <span class="value">{{ formatCounts(profile.commentDownvotesCount) }}</span> <span class="field">Comments</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
        <SvgIcons name="share" />  Shares
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/shares" class="btn primary" title="Tales Shares">
          <span class="value">{{ formatCounts(profile.taleSharesCount) }}</span> <span class="field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/shares" class="btn primary" title="Insights Shares">
          <span class="value">{{ formatCounts(profile.insightSharesCount) }}</span> <span class="field">Insights</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__contacts" aria-label="Social and email contacts">
      
      <div class="profile-details__contact-item">
        <div class="profile-details__contact-item-header">
          <p class="facebook">
             <SvgIcons name="facebook" />  Facebook
          </p>
          <button aria-label="Edit Facebook" @click="handleEditContactClick('Facebook')">
             <SvgIcons name="edit" />
          </button>
        </div>
        <p v-if="profileStore.facebook" class="profile-details__contact-item-definition">
          <span>https://facebook.com/</span><a :href="profileStore.facebookLink" target="_blank">{{ profileStore.facebook }}</a>
        </p>
        <p v-else class="shared__no-content">Facebook contact not found!</p>
      </div>

      <div class="profile-details__contact-item">
        <div class="profile-details__contact-item-header">
          <p class="twitter">
            <SvgIcons name="twitter" />  X
          </p>
          <button aria-label="Edit Twitter" @click="handleEditContactClick('Twitter')">
             <SvgIcons name="edit" />
          </button>
        </div>
        <p v-if="profileStore.twitter" class="profile-details__contact-item-definition">
          <span>https://twitter.com/</span><a :href="profileStore.twitterLink" target="_blank">{{ profileStore.twitter }}</a>
        </p>
        <p v-else class="shared__no-content">X contact not found!</p>
      </div>

      <div class="profile-details__contact-item">
        <div class="profile-details__contact-item-header">
          <p class="linkedin">
             <SvgIcons name="linkedin" />  LinkedIn
          </p>
          <button aria-label="Edit LinkedIn"@click="handleEditContactClick('LinkedIn')">
             <SvgIcons name="edit" />
          </button>
        </div>
        <p v-if="profileStore.linkedin" class="profile-details__contact-item-definition">
          <span>https://linkedin.com/in/</span><a :href="profileStore.linkedinLink" target="_blank">{{ profileStore.linkedin }}</a>
        </p>
        <p v-else class="shared__no-content">LinkedIn contact not found!</p>
      </div>

      <div class="profile-details__contact-item">
        <div class="profile-details__contact-item-header">
          <p class="email">
            <SvgIcons name="email" />  Email Address
          </p>
          <button aria-label="Edit Email Address" @click="handleEditContactClick('Email')">
             <SvgIcons name="edit" />
          </button>
        </div>
        <p v-if="profileStore.email" class="profile-details__contact-item-definition">
          <a :href="`mailto:${profileStore.email}`">{{ profileStore.email }}</a>
        </p>
        <p v-else class="shared__no-content">Email contact not found!</p>
      </div>

    </div>

  </div>
</template>


<style lang="less" scoped>
/* You can safely drop your layout timeline.less or unique home rules down here */
@import "@/assets/css/profile.less";

</style>