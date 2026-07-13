<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { getAsync } from '@/api/apiGetServices'
import type { GetUserProfileResponse } from '@/features/identity/types/IdentityTypes' // Adjust paths accordingly
import { APIError } from '@/api/apiTypes'
import { formatCounts, truncateText } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import { CountryDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'
import SvgIcons from '@/components/SvgIcons.vue'
import { getEngagementMetadata, type EngagementState } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import { RouterLink } from 'vue-router'
import { useUserProfileStore } from '../stores/UserProfileStore'; 
import PageStatusMessage from '@/components/PageStatusMessage.vue'

const profileStore = useUserProfileStore();

const props = defineProps<{
  payload: unknown // Arrives untouched as the raw string AccountId from your container
}>()

const targetAccountId = computed(() => props.payload as string)

// Ephemeral component-driven state
const isLoading = ref(true)
const loadingError = ref<APIError | null>(null)
const engage = useEngagement()
const uiMeta = computed(() => {
 const engagement = profileStore.profile?.user?.engagement
  
  if (!engagement) {
    // Return a safe, matching default structure to avoid template crashes
    return {
      isFavoriteDisabled: true,
      favoriteAltText: 'Follow'
    }
  }
  
  return getEngagementMetadata(engagement)
})


// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Profile View]: Presence verified via hint. Dispatching data fetch...')

  // 🎯 ROUTE-BASED GATEWAY CONTROL
  const { error } = await profileStore.loadProfile(targetAccountId.value);
  
  if (error) {
    loadingError.value = error
  } 

  //No matter the result, stop loading
  isLoading.value = false

}

onMounted(async () => {
  console.log(`🔍 [Profile Modal]: Initializing background read for account: ${targetAccountId.value}`)
  
  await initPage()

  profileStore.hydratePersonals()

  // 2. Schedule a "True View" conversion event after a 5 second delay
    profileStore.recordView();
})


// inside your HomeView.vue
onUnmounted(() => {
  profileStore.reset()
});

</script>

<template>

     <template v-if="isLoading">
      <div class="loader-container">
        <p class="loader"></p>
      </div>
    </template>

     <template v-else-if="loadingError">
      <PageStatusMessage 
        :title="loadingError.title" 
        :message="loadingError.detail">
      </PageStatusMessage>
    </template>

     <template v-else-if="profileStore.profile">
      
        <div class="profile-details">

             <h1 class="profile-details__title">{{ profileStore.profile.title }}</h1>
            <h2 class="at profile-details__username">{{ profileStore.profile.username }}</h2>

             <div class="profile-details__metadata">
            Joined {{ toShortDate(profileStore.profile.registeredAt) }}
            <template v-if="profileStore.profile.country">
                <span class="divider circle"></span>
                {{ CountryDescriptions[profileStore.profile.country] }}
            </template>
            <span class="divider circle"></span>
            {{ formatCounts(profileStore.profile.viewsCount) }} Views
            </div>

             <figure class="profile-details__image">
              <div class="profile-details__image-wrapper">
   <template v-if="profileStore.profile.photo">
                <img :src="mediaHelper.getUrl(profileStore.profile.photo, 'profiles')" :alt="profileStore.profile.username" />
            </template>
             <template v-else>
                <SvgIcons name='user' />
            </template>
              </div>
                
            </figure>

             <div class="profile-details__bio">
                     <template v-if="profileStore.profile.bio">
                {{ profileStore.profile.bio }}
                </template>
                <template v-else>
                    <p class="shared__no-content">
              No bio found!
          </p>
            </template>
                    </div>
             
 <div class="profile-details__actions">
     <button 
        @click="engage.favorite(profileStore.profile.user.engagement)"
        :title="profileStore.profile.user.engagement.isFavorite ? 'Unfollow User' : 'Follow User'"
        :disabled="uiMeta.isFavoriteDisabled">
        <SvgIcons name="bookmark" /> {{ uiMeta.favoriteAltText }}
      </button>
     
    </div>

      <div class="profile-details__content-links">
      <RouterLink :to="`/tales?username=${profileStore.profile.username}`" class="btn secondary" title="Tales">
        <span class="value">{{ formatCounts(profileStore.profile.talesCount) }}</span> 
        <span class="field">Tales</span>
      </RouterLink>
      <RouterLink :to="`/insights?username=${profileStore.profile.username}`" class="btn secondary" title="Insights">
        <span class="value">{{ formatCounts(profileStore.profile.insightsCount) }}</span> 
        <span class="field">Insights</span>
      </RouterLink>
      <RouterLink :to="`/comments?username=${profileStore.profile.username}`" class="btn secondary" title="Comments">
        <span class="value">{{ formatCounts(profileStore.profile.commentsCount) }}</span> 
        <span class="field">Comments</span>
      </RouterLink>
    </div>

     <div class="profile-details__follow-links">
      <RouterLink :to="`/users/${profileStore.profile.username}/follows`" class="btn primary" title="Following">
        <span class="value">{{ formatCounts(profileStore.profile.followsCount) }}</span> 
        <span class="field">Following</span>
      </RouterLink>
      <RouterLink :to="`/users/${profileStore.profile.username}/followers`" class="btn primary" title="Followers">
        <span class="value">{{ formatCounts(profileStore.profile.followersCount) }}</span> 
        <span class="field">Followers</span>
      </RouterLink>
    </div>

    <div class="profile-details__stats">
      <h4 class="profile-details__stats-header">
         <SvgIcons name="upvote" />  Upvotes 
      </h4>
      <div class="profile-details__stats-body">
        <RouterLink :to="`/tales/${profileStore.profile.username}/upvotes`" class="btn primary" title="Tales Upvotes">
          <span class="value">{{ formatCounts(profileStore.profile.taleUpvotesCount) }}</span> <span class="field">Tales</span>
        </RouterLink>
        <RouterLink :to="`/insights/${profileStore.profile.username}/upvotes`" class="btn primary" title="Insights Upvotes">
          <span class="value">{{ formatCounts(profileStore.profile.insightUpvotesCount) }}</span> <span class="field">Insights</span>
        </RouterLink>
        <RouterLink :to="`/comments/${profileStore.profile.username}/upvotes`" class="btn primary" title="Comments">
          <span class="value">{{ formatCounts(profileStore.profile.commentUpvotesCount) }}</span> <span class="field">Comments</span>
        </RouterLink>
      </div>
    </div>
    
    <div class="profile-details__contacts" aria-label="Social and email contacts">
      
      <div class="profile-details__contact-item">
        <div class="profile-details__contact-item-header">
          <p class="facebook">
             <SvgIcons name="facebook" />  Facebook
          </p>
         
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
         
        </div>
        <p v-if="profileStore.email" class="profile-details__contact-item-definition">
          <a :href="`mailto:${profileStore.email}`">{{ profileStore.email }}</a>
        </p>
        <p v-else class="shared__no-content">Email contact not found!</p>
      </div>

    </div>
        
        </div>

    </template>

    <template v-else>
     <PageStatusMessage
         title='000: Error'
        message="An unknown error occured loading profileStore.profile. Refresh page and try again.">
      </PageStatusMessage>
    </template>

</template>


<style lang="less" scoped>
/* You can safely drop your layout timeline.less or unique home rules down here */
@import "@/assets/css/profile.less";

</style>