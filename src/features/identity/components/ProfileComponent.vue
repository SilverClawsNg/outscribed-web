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
    
      <span class="shared__divider shared__divider--circle"></span>
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
      <RouterLink to="/users/my/follows" class="btn primary profile-details__link-btn profile-details__link-btn--horizontal" title="Following">
        <span class="profile-details__link-value">{{ formatCounts(profile.followsCount) }}</span> 
        <span class="profile-details__link-field">Following</span>
      </RouterLink>
      <RouterLink to="/users/my/followers" class="btn primary profile-details__link-btn profile-details__link-btn--horizontal" title="Followers">
        <span class="profile-details__link-value">{{ formatCounts(profile.followersCount) }}</span> 
        <span class="profile-details__link-field">Followers</span>
      </RouterLink>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
        <SvgIcons name="bookmark" />  Saves
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink to="/tales/my/saves" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleFavoritesCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/saves" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightFavoritesCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/saves" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Comments">
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
        <RouterLink to="/tales/my/votes?votetype=Upvote" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleUpvotesCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/votes?votetype=Upvote" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightUpvotesCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/votes?votetype=Upvote" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Comments">
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
        <RouterLink to="/tales/my/votes?votetype=Downvote" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Downvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleDownvotesCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/votes?votetype=Downvote" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Downvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightDownvotesCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/votes?votetype=Downvote" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Comments">
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
        <RouterLink to="/tales/my/flags" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleFlagsCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/flags" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Upvotes">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightFlagsCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
        <RouterLink to="/comments/my/flags" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Comments">
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
        <RouterLink to="/tales/my/shares" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Tales Shares">
          <span class="profile-details__link-value">{{ formatCounts(profile.taleSharesCount) }}</span> 
          <span class="profile-details__link-field">Tales</span>
        </RouterLink>
        <RouterLink to="/insights/my/shares" class="btn primary profile-details__link-btn profile-details__link-btn--vertical" title="Insights Shares">
          <span class="profile-details__link-value">{{ formatCounts(profile.insightSharesCount) }}</span> 
          <span class="profile-details__link-field">Insights</span>
        </RouterLink>
      </div>
    </div>

    <div class="profile-details__contacts" aria-label="Social and email contacts">
      
      <div class="profile-details__contact-item">

        <div class="profile-details__contact-header">
          <p class="facebook">
             <SvgIcons name="facebook" />  Facebook
          </p>
          <button aria-label="Edit Facebook" @click="handleEditContactClick('Facebook')">
             <SvgIcons name="edit" />
          </button>
        </div>

         <template  v-if="profileStore.facebook">
          <p  class="profile-details__contact-item-definition">
          <span>https://facebook.com/</span><a :href="profileStore.facebookLink" target="_blank">{{ profileStore.facebook }}</a>
        </p>
      </template>
       <template v-else>

             <PageStatusMessage
                title="No Facebook Added!"
                message="Add a Facebbok handle"
                icon="inbox"
                />

          </template>
      
      </div>
     

      <div class="profile-details__contact-item">
        <div class="profile-details__contact-header">
          <p class="twitter">
            <SvgIcons name="twitter" />  X
          </p>
          <button aria-label="Edit Twitter" @click="handleEditContactClick('Twitter')">
             <SvgIcons name="edit" />
          </button>
        </div>
          <template  v-if="profileStore.facebook">

              <p class="profile-details__contact-item-definition">
          <span>https://twitter.com/</span><a :href="profileStore.twitterLink" target="_blank">{{ profileStore.twitter }}</a>
        </p>
      </template>
       <template v-else>

             <PageStatusMessage
                title="No X Added!"
                message="Add an X (twitter) handle"
                icon="inbox"
                />

          </template>
      
      </div>

      <div class="profile-details__contact-item">
        <div class="profile-details__contact-header">
          <p class="linkedin">
             <SvgIcons name="linkedin" />  LinkedIn
          </p>
          <button aria-label="Edit LinkedIn"@click="handleEditContactClick('LinkedIn')">
             <SvgIcons name="edit" />
          </button>
        </div>
          <template  v-if="profileStore.facebook">

              <p class="profile-details__contact-item-definition">
          <span>https://linkedin.com/in/</span><a :href="profileStore.linkedinLink" target="_blank">{{ profileStore.linkedin }}</a>
        </p>
      </template>
       <template v-else>

             <PageStatusMessage
                title="No LinkedIn Added!"
                message="Add a LinkedIn handle"
                icon="inbox"
                />

          </template>
      
      </div>

      <div class="profile-details__contact-item">
        <div class="profile-details__contact-header">
          <p class="email">
            <SvgIcons name="email" />  Email Address
          </p>
          <button aria-label="Edit Email Address" @click="handleEditContactClick('Email')">
             <SvgIcons name="edit" />
          </button>
        </div>
          <template  v-if="profileStore.email">

             <p class="profile-details__contact-item-definition">
          <a :href="`mailto:${profileStore.email}`">{{ profileStore.email }}</a>
        </p>
      </template>
       <template v-else>

             <PageStatusMessage
                title="No Email Added!"
                message="Add your public email address."
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