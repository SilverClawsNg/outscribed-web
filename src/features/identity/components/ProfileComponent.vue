<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { AccountStatusClass, AccountStatusDescriptions, CountryDescriptions, CountryFlags } from '@/utils/descriptors'
import { type ContactType } from '@/utils/enumHelper.ts'
import { formatCounts } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import UpdateProfilePhotoComponent from './UpdateProfilePhotoComponent.vue'
import SvgIcons from '@/components/SvgIcons.vue'
import { computed } from 'vue'
import { useProfileStore } from '../stores/ProfileStore.ts' // 🚀 Import Profile Store

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

  <div class="profile-details__shaded-background"></div>

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

  
<div class="action-wrapper">

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
     <h2>Bio</h2>
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
       <button 
        type="button" 
        class="section-header__cta"
        :class="{ 'section-header__cta--active': activeActivityTab === 'tale' }"
        @click="activeActivityTab = 'tale'"
      >
        Tales
      </button>
      <button 
        type="button" 
        class="section-header__cta"
        :class="{ 'section-header__cta--active': activeActivityTab === 'comment' }"
        @click="activeActivityTab = 'comment'"
      >
        Comments
      </button>
      
       <button 
        type="button" 
        class="section-header__cta"
        :class="{ 'section-header__cta--active': activeActivityTab === 'connect' }"
        @click="activeActivityTab = 'connect'"
      >
        Connect
      </button>
    </header>

<div class="profile-links" :class="{ 'profile-links--active': activeActivityTab === 'tale' }">
  <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Published</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.talesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      :to="`/tales?username=${profile.username}`" title="Tales"  
      :class="{ 'is-disabled': profile.talesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Saved</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.taleFavoritesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/tales/my/saves" title="Tales Saved"  
      :class="{ 'is-disabled': profile.taleFavoritesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Shared</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.taleSharesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/tales/my/shares" title="Tales Shared"  
      :class="{ 'is-disabled': profile.taleSharesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Reported</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.taleFlagsCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/tales/my/flags" title="Tales Reported"
      :class="{ 'is-disabled': profile.taleFlagsCount === 0 }"  
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Transformed Perspectives</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.transformedPerspectivesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
     to="/tales/my/reactions?reactiontype=TransformedPerspective" title="Tales Transformed Perspective"
     :class="{ 'is-disabled': profile.transformedPerspectivesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Exposes Realities</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.exposesRealitiesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
    to="/tales/my/reactions?reactiontype=ExposesReality" title="Tales Exposes Realities"
    :class="{ 'is-disabled': profile.exposesRealitiesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Sparks Debates</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.sparksDebatesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
    to="/tales/my/reactions?reactiontype=SparksDebate" title="Tales Sparks Debates"
    :class="{ 'is-disabled': profile.sparksDebatesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Missed Critical Contexts</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.missedCriticalContextsCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
    to="/tales/my/reactions?reactiontype=MissedCriticalContext" title="Tales Missed Critical Contexts"
    :class="{ 'is-disabled': profile.missedCriticalContextsCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Lacks Real World Relevance</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.lacksRealWorldRelevancesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
    to="/tales/my/reactions?reactiontype=LacksRealWorldRelevance" title="Tales Lacks Real World Relevance"
    :class="{ 'is-disabled': profile.lacksRealWorldRelevancesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
</div>

<div class="profile-links" :class="{ 'profile-links--active': activeActivityTab === 'comment' }">
     <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Published</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.commentsCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      :to="`/comments?username=${profile.username}`" title="Comments" 
      :class="{ 'is-disabled': profile.commentsCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Saved</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.commentFavoritesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/comments/my/saves" title="Comments Saved"
      :class="{ 'is-disabled': profile.commentFavoritesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Reported</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.commentFlagsCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/comments/my/flags" title="Comments Reported"
      :class="{ 'is-disabled': profile.commentFlagsCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
   <div class="profile-links__item">

<p>
   <span class="profile-links__text--label">Upvoted</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.commentUpvotesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/comments/my/votes?reactiontype=Upvote" title="Comments Upvoted"
      :class="{ 'is-disabled': profile.commentUpvotesCount === 0 }"
      class="profile-links__cta">
         View
        </RouterLink>
  </div>
    <div class="profile-links__item">

<p  class="profile-links__text">
   <span class="profile-links__text--label">Downvoted</span>
          <span class="divider divider--circle"></span>
          <span class="profile-links__text--value">{{ formatCounts(profile.commentDownvotesCount) }}</span>
</p>

<span class="profile-links__lines"></span>

      <RouterLink 
      to="/comments/my/votes?reactiontype=Downvote" title="Comments Downvoted"
      :class="{ 'is-disabled': profile.commentDownvotesCount === 0 }"
      class="profile-links__cta">
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

 <header class="section-header section-header--no-margin">
     <h2>Account Status</h2>
    </header>

<footer :class="['profile-footer', `profile-footer--${AccountStatusClass[profile.status]}`]">
 
  <div class="profile-footer__details">
   
    <p class="profile-footer__status">
      <span class="profile-footer__status-label" :class="[`profile-footer__status-label--${AccountStatusClass[profile.status]}`]">
        {{ AccountStatusDescriptions[profile.status] }}
      </span>
    </p>

  <div class="profile-footer__description">
    <!-- Render appropriate buttons or contact links based on status -->
    <template v-if="profile.status === 'Active'">
      <p>
        Your profile is public and visible. Archiving hides your profile page while keeping your published tales fully accessible.
        Archiving is easily reversible.
      </p>
    </template>
    
    <template v-else-if="profile.status === 'SelfArchived'">
       <p>
        Your profile is currently hidden from public view. Your published tales remain active. You can reactivate your profile at any time.
      </p>
    </template>

     <template v-else-if="profile.status === 'HiddenByModeration'">
       <p>
        Your profile was automatically hidden because your content accumulated community moderation penalty points past the threshold. An administrator will review your account for reinstatement or penalties.
      </p>
    </template>

     <template v-else-if="profile.status === 'SuspendedByAdmin'">
       <p>
        Your account has been temporarily suspended by an administrator. If you believe this is a mistake, you can make a plea for pardon by reaching out directly.
      </p>
    </template>

     <template v-else-if="profile.status === 'BannedByAdmin'">
       <p>
        Your account has been permanently restricted due to policy violations. You may submit a formal appeal to the admin team if you wish to plead your case.
      </p>
    </template>

  </div>
  </div>

  <div class="profile-footer__actions">

    <template v-if="profile.status === 'Active'">
      <button type="button" class="btn btn--danger">
        Archive Profile
      </button>
    </template>
    
    <template v-else-if="profile.status === 'SelfArchived'">
      <button type="button" class="btn btn--success">
        Reactivate Profile
      </button>
    </template>

    <template v-else-if="profile.status === 'SuspendedByAdmin' || profile.status === 'BannedByAdmin'">
      <div class="profile-footer__contact-links">
        <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener">Twitter</a>
        <a href="https://facebook.com/yourhandle" target="_blank" rel="noopener">Facebook</a>
        <a href="mailto:support@outscribed.com">Email Admin</a>
      </div>
    </template>
  </div>
</footer>
</div>
</template>

<style lang="less" scoped>
@import "@/assets/css/profile.less";

.profile-footer {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.5rem;
  background-color: var(--light-background-color);
  border-radius: 0 0 12px 12px;
  font-size: 0.95rem;
  flex-direction: column;
  gap: 1rem;
  margin-top: -0.5rem;

  &__icon-wrapper {
    display: flex;
    align-items: center;
    padding-top: 0.2rem;
  }

  &__details {
    flex: 1;
  }

  &__title {
    margin: 0 0 0.35rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  &__description {
    margin: 0;
    line-height: 1.5;
    color: var(--muted-text-color);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;

    @media @phone, @phablet {
      width: 100%;
      justify-content: flex-start;
    }
  }

  &__status{
  display: flex;
   margin-bottom: 0.5rem;
   

   &-label{
 padding: 0.5rem 1.5rem;
 border: 1px solid transparent;
 border-radius: 99999px;
 
    &--info{
      background-color:@success-background-color;
      color:@success-text-color;
      border-color: @success-border-color;
    }

     &--warning{
      background-color:@warning-background-color;
      color:@warning-text-color;
      border-color: @warning-border-color;
    }

     &--danger{
      background-color:@danger-background-color;
      color:@danger-text-color;
      border-color: @danger-border-color;
    }
   }

  }

  &__contact-links {
    display: flex;
    gap: 1rem;
    font-weight: 500;

    a {
      color: var(--primary-color, #2563eb);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>