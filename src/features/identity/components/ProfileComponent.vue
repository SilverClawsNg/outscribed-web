<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { AccountStatusDescriptions, CountryDescriptions, AccountStatusClass, CountryFlags } from '@/utils/descriptors'
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

  <div class="profile-details__shaded-background">
     
  </div>

<div class="profile-details__image-container">
  
  <UpdateProfilePhotoComponent :payload="profile" @completed="handleRefresh" />

</div>

<div class="profile-details__personal">
  
<h1 class="profile-details__username at">{{ profile.username }}</h1>
      <h2 v-if="profile.title" class="profile-details__name">{{ profile.title }}</h2>
       <time class="profile-details__date">Joined {{ toShortDate(profile.registeredAt) }}</time>
        <p class="profile-details__country" v-if="profile.country">
          <i>OutScribing from </i>  
          <span class="flag">{{ CountryFlags(profile.country) }}</span> 
          {{ CountryDescriptions[profile.country] }}
      </p>
</div>


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

  
<div class="double-update-wrapper">

    <div class="double-update">

    <button 
      type="button" 
      class="btn btn--primary"
      @click="modalStore.push('UpdateProfile', 'Update Profile')"
    >
      Update Profile
    </button>

    <button 
      type="button" 
      class="change-password"
      @click="modalStore.push('ChangePassword', 'Change Password')"
    >
      Password
    </button>

</div>

</div>


    <header class="section-header">
      <p  class="section-header__lines"></p>
      <h2  class="section-header__title">Bio</h2>
      <p  class="section-header__lines"></p>
    </header>
   

<div class="profile-details__bio-card">
    <template v-if="profile.bio">
      <div  class="profile-details__bio-card--text">{{ profile.bio }}</div>
    </template>
    <template v-else>
      <p class="profile-details__bio-card--empty">It appears you have not added a bio yet. 
        Your writers' bio will appear on stories you publish and should contain a concise introduction
        of your craft
      </p>
    </template>
</div>


   <header class="section-header">
      <p  class="section-header__lines"></p>
      <div  class="section-header__title">
         <button 
        type="button" 
        class="section-header__item"
        :class="{ 'section-header__item--active': activeActivityTab === 'tale' }"
        @click="activeActivityTab = 'tale'"
      >
        Tales
      </button>
      <span class="divider divider--line"></span>
      <button 
        type="button" 
        class="section-header__item"
        :class="{ 'section-header__item--active': activeActivityTab === 'comment' }"
        @click="activeActivityTab = 'comment'"
      >
        Comments
      </button>
       <span class="divider divider--line"></span>
      <button 
        type="button" 
        class="section-header__item"
        :class="{ 'section-header__item--active': activeActivityTab === 'connect' }"
        @click="activeActivityTab = 'connect'"
      >
        Connect
      </button>
      </div>
      <p  class="section-header__lines"></p>
    </header>

<div class="profile-links" :class="{ 'profile-links--active': activeActivityTab === 'tale' }">
  <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Published</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.talesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      :to="`/tales?username=${profile.username}`" title="Tales"  
      class="profile-links__link">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Saved</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.taleFavoritesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/tales/my/saves" title="Tales Saved"  
      class="profile-links__link">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Shared</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.taleSharesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/tales/my/shares" title="Tales Shared"  
      class="profile-links__link">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Reported</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.taleFlagsCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/tales/my/flags" title="Tales Reported"  
      class="profile-links__link">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Transformed Perspectives</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.transformedPerspectivesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
     to="/tales/my/reactions?reactiontype=TransformedPerspective" title="Tales Transformed Perspective"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Exposes Realities</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.exposesRealitiesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
    to="/tales/my/reactions?reactiontype=ExposesReality" title="Tales Exposes Realities"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Sparks Debates</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.sparksDebatesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
    to="/tales/my/reactions?reactiontype=SparksDebate" title="Tales Sparks Debates"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Missed Critical Contexts</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.missedCriticalContextsCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
    to="/tales/my/reactions?reactiontype=MissedCriticalContext" title="Tales Missed Critical Contexts"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Lacks Real World Relevance</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.lacksRealWorldRelevancesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
    to="/tales/my/reactions?reactiontype=LacksRealWorldRelevance" title="Tales Lacks Real World Relevance"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
</div>

<div class="profile-links" :class="{ 'profile-links--active': activeActivityTab === 'comment' }">
     <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Published</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.commentsCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      :to="`/comments?username=${profile.username}`" title="Comments" 
      class="profile-links__link">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Saved</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.commentFavoritesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/comments/my/saves" title="Comments Saved"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Reported</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.commentFlagsCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/comments/my/flags" title="Comments Reported"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Upvoted</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.commentUpvotesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/comments/my/votes?reactiontype=Upvote" title="Comments Upvoted"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p>
   <span class="profile-links__link--label">Downvoted</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__link--value">{{ formatCounts(profile.commentDownvotesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/comments/my/votes?reactiontype=Downvote" title="Comments Downvoted"
      class="profile-links__link">
         View
        </RouterLink>
  </div>
</div>

<div class="profile-links" :class="{ 'profile-links--active': activeActivityTab === 'connect' }">
   
   
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