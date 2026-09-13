<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { APIError } from '@/api/apiTypes'
import { formatCounts } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import { CountryDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'
import SvgIcons from '@/components/SvgIcons.vue'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import { RouterLink } from 'vue-router'
import { useUserProfileStore } from '../stores/UserProfileStore'; 
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import { useModalStore } from '@/stores/modalStore';
import WriterStats from '@/components/WriterStats.vue'

const profileStore = useUserProfileStore();
const modalStore = useModalStore();

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
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'"
      icon="warning"
      :is-standalone="true">
        <template v-if="loadingError.definition" #actions>
           <button class="btn primary" @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
    </PageStatusMessage>

  </template>

     <template v-else-if="profileStore.profile">
      
        <div class="profile-details">

            <h1 class="profile-details__title">{{ profileStore.profile.title }}</h1>
            <h2 class="at profile-details__username">{{ profileStore.profile.username }}</h2>

             <div class="profile-details__metadata">
            Joined {{ toShortDate(profileStore.profile.registeredAt) }}
            <span class="shared__divider shared__divider--circle"></span>
            {{ formatCounts(profileStore.profile.viewsCount) }} Views
            </div>

             <template v-if="profileStore.profile.country">
              <p class="profile-details__country">
                <i class="profile-details__country-label">OutScribing from </i>
                {{ CountryDescriptions[profileStore.profile.country] }}
              </p>
            </template>

             <figure class="profile-details__image">
              <div class="profile-details__image-wrapper">
                <template v-if="profileStore.profile.photo">
                  <img 
                    :src="mediaHelper.getUrl(profileStore.profile.photo, 'profiles')" 
                    :alt="profileStore.profile.username" 
                    class="profile-details__avatar"
                  />
                </template>
                <template v-else>
                  <SvgIcons name="user" class="profile-details__avatar-placeholder" />
                </template>
              </div>
            </figure>

               <div class="profile-details__bio">
                  <template v-if="profileStore.profile.bio">
                    {{ profileStore.profile.bio }}
                  </template>
                </div>
                          
              <div class="profile-details__actions">
                <button 
                  @click="engage.favorite(profileStore.profile.user.engagement)"
                  :title="profileStore.profile.user.engagement.isFavorite ? 'Unfollow User' : 'Follow User'"
                  :disabled="uiMeta.isFavoriteDisabled"
                  class="profile-details__action-btn"
                >
                  <SvgIcons name="bookmark" /> {{ uiMeta.favoriteAltText }}
                </button>
              </div>

                <WriterStats
                  :username="profileStore.profile.username"
                  :tales-count="profileStore.profile.talesCount"
                  :insights-count="profileStore.profile.insightsCount"
                  :comments-count="profileStore.profile.commentsCount"
                  :has-margin="true"
                />


       <div class="profile-details__follow-links">
        <RouterLink :to="`/users/${profileStore.profile.username}/follows`" class="btn primary profile-details__link-btn profile-details__link-btn--horizontal" title="Following">
          <span class="profile-details__link-value">{{ formatCounts(profileStore.profile.followsCount) }}</span> 
          <span class="profile-details__link-field">Following</span>
        </RouterLink>
        <RouterLink :to="`/users/${profileStore.profile.username}/followers`" class="btn primary profile-details__link-btn profile-details__link-btn--horizontal" title="Followers">
          <span class="profile-details__link-value">{{ formatCounts(profileStore.profile.followersCount) }}</span> 
          <span class="profile-details__link-field">Followers</span>
        </RouterLink>
      </div>

    <div class="profile-details__stats">
        <h4 class="profile-details__stats-header">
          <SvgIcons name="upvote" /> Upvotes 
        </h4>
        <div class="profile-details__stats-body">
          <RouterLink :to="`/tales/${profileStore.profile.username}/upvotes`" class="btn primary profile-details__link-btn" title="Tales Upvotes">
            <span class="profile-details__link-value">{{ formatCounts(profileStore.profile.taleUpvotesCount) }}</span> 
            <span class="profile-details__link-field">Tales</span>
          </RouterLink>
          <RouterLink :to="`/insights/${profileStore.profile.username}/upvotes`" class="btn primary profile-details__link-btn" title="Insights Upvotes">
            <span class="profile-details__link-value">{{ formatCounts(profileStore.profile.insightUpvotesCount) }}</span> 
            <span class="profile-details__link-field">Insights</span>
          </RouterLink>
          <RouterLink :to="`/comments/${profileStore.profile.username}/upvotes`" class="btn primary profile-details__link-btn" title="Comments">
            <span class="profile-details__link-value">{{ formatCounts(profileStore.profile.commentUpvotesCount) }}</span> 
            <span class="profile-details__link-field">Comments</span>
          </RouterLink>
        </div>
      </div>
    
     <div class="profile-details__contacts" aria-label="Social and email contacts">
        <!-- Facebook -->
         <template v-if="profileStore.facebook">
          
        <div class="profile-details__contact-item">
          <div class="profile-details__contact-header">
            <p class="profile-details__contact-title profile-details__contact-title--facebook">
              <SvgIcons name="facebook" /> Facebook
            </p>
          </div>
          <p class="profile-details__contact-definition">
            <span>https://facebook.com/</span><a :href="profileStore.facebookLink" target="_blank">{{ profileStore.facebook }}</a>
          </p>
        </div>

         </template>

        <!-- Twitter / X -->
           <template v-if="profileStore.facebook">

            <div class="profile-details__contact-item">
              <div class="profile-details__contact-header">
                <p class="profile-details__contact-title profile-details__contact-title--twitter">
                  <SvgIcons name="twitter" /> X
                </p>
              </div>
              <p class="profile-details__contact-definition">
                <span>https://twitter.com/</span><a :href="profileStore.twitterLink" target="_blank">{{ profileStore.twitter }}</a>
              </p>
            </div>

         </template>
        
        <!-- LinkedIn -->
           <template v-if="profileStore.facebook">

            <div class="profile-details__contact-item">
              <div class="profile-details__contact-header">
                <p class="profile-details__contact-title profile-details__contact-title--linkedin">
                  <SvgIcons name="linkedin" /> LinkedIn
                </p>
              </div>
              <p class="profile-details__contact-definition">
                <span>https://linkedin.com/in/</span><a :href="profileStore.linkedinLink" target="_blank">{{ profileStore.linkedin }}</a>
              </p>
            </div>

         </template>

        <!-- Email -->
           <template v-if="profileStore.facebook">

            <div class="profile-details__contact-item">
              <div class="profile-details__contact-header">
                <p class="profile-details__contact-title profile-details__contact-title--email">
                  <SvgIcons name="email" /> Email Address
                </p>
              </div>
              <p class="profile-details__contact-definition">
                <a :href="`mailto:${profileStore.email}`">{{ profileStore.email }}</a>
              </p>
            </div>

         </template>
      
      </div>
    
    </div>

    </template>

    <template v-else>
       <PageStatusMessage
      title="Unknown Error!"
      message="An unknown error occured loading  user's profile. Refresh page and try again."
      icon="inbox"
      :is-standalone="true"
      />
  
    </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/profile.less";
</style>