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
const activeActivityTab = ref<string>('tale')

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
      <div class="loader" role="status" aria-label="Loading profile">
      <p class="loader__dot"></p>
      </div>
    </template>
   
  <template v-else-if="loadingError">

     <PageStatusMessage 
      :title="loadingError.title || 'Error Loading Lists'" 
      :message="loadingError.detail || 'An unexpected error occurred.'"
      icon="warning"
      :is-standalone="true">
        <template v-if="loadingError.definition" #actions>
           <button class="btn btn--primary"  @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
    </PageStatusMessage>

  </template>

     <template v-else-if="profileStore.profile">
      
        <div class="profile-details">

             <figure class="profile-image">
              <div class="profile-image__wrapper">
                <template v-if="profileStore.profile.photo">
                  <img 
                    :src="mediaHelper.getUrl(profileStore.profile.photo, 'profiles')" 
                    :alt="profileStore.profile.username" 
                    class="profile-image__avatar"
                  />
                </template>
                <template v-else>
                  <SvgIcons name="user" class="profile-iamge__avatar-placeholder" />
                </template>
              </div>
            </figure>

           <header class="profile-header">
            <h1 class="at profile-header__username">{{ profileStore.profile.username }}</h1>
            <h2 class="profile-header__title">{{ profileStore.profile.title }}</h2>
            <time class="profile-header__date">Joined {{ toShortDate(profileStore.profile.registeredAt) }}</time>

              <template v-if="profileStore.profile.country">
              <p class="profile-header__country">
                <i class="profile-header__country-label">OutScribing from </i>
                {{ CountryDescriptions[profileStore.profile.country] }}
              </p>
            </template>
            </header>

            
  <!-- Follow Statistics Bar -->
  <div class="profile-metadata">
    <RouterLink :to="`/users/${profileStore.profile.username}/follows`" class="profile-metadata__item" title="Following">
      <span class="profile-metadata__item--value">{{ formatCounts(profileStore.profile.followsCount) }}</span>
      <span class="profile-metadata__item--label">Following</span>
    </RouterLink>

    <RouterLink to="/users/my/followers" class="profile-metadata__item" title="Followers">
      <span class="profile-metadata__item--value">{{ formatCounts(profileStore.profile.followersCount) }}</span>
      <span class="profile-metadata__item--label">Followers</span>
    </RouterLink>

    <div class="profile-metadata__item" title="Profile Views">
      <span class="profile-metadata__item--value">{{ formatCounts(profileStore.profile.viewsCount) }}</span>
      <span class="profile-metadata__item--label">Views</span>
    </div>
   
  </div>

   <div class="profile-details__bio">
                  <template v-if="profileStore.profile.bio">
                    {{ profileStore.profile.bio }}
                  </template>
                </div>

                
  <!-- Quick Action Buttons -->
  <div class="follow-btn">
    <button 
      type="button" 
      @click="engage.favorite(profileStore.profile.user.engagement)"
                  :title="profileStore.profile.user.engagement.isFavorite ? 'Unfollow User' : 'Follow User'"
                  :disabled="uiMeta.isFavoriteDisabled"
                  class="btn btn--primary btn--has-icon"
    >
     {{ uiMeta.favoriteAltText }}
      <SvgIcons name="bookmark" :size="20" />
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
        <RouterLink :to="`/tales?username=${profileStore.profile.username}`" class="btn btn--primary" title="Tales">
          <span class="activity-box__label">Published</span>
          <span class="activity-box__value">{{ formatCounts(profileStore.profile.talesCount) }}</span>
        </RouterLink>

        <div class="divider-multi divider-multi--thick"><span></span></div>

        <RouterLink :to="`/tales/${profileStore.profile.username}/reactions`" class="btn btn--primary" title="Tales Transformed Perspective">
          <span class="activity-box__label">Recommended</span>
          <span class="activity-box__value">{{ formatCounts(profileStore.profile.transformedPerspectivesCount) }}</span>
        </RouterLink>

      </div>

      <!-- Comments Activity Panel -->
      <div 
        class="activity-box__panel"
        :class="{ 'activity-box__panel--active': activeActivityTab === 'comment' }"
      >
        <RouterLink :to="`/comments?username=${profileStore.profile.username}`" class="btn btn--primary" title="Comments">
          <span class="activity-box__label">Published</span>
          <span class="activity-box__value">{{ formatCounts(profileStore.profile.commentsCount) }}</span>
        </RouterLink>

        <div class="divider-multi divider-multi--thick"><span></span></div>

        <RouterLink :to="`/comments/${profileStore.profile.username}/reactions`" class="btn btn--primary" title="Comments Upvoted">
          <span class="activity-box__label">Recommended</span>
          <span class="activity-box__value">{{ formatCounts(profileStore.profile.commentUpvotesCount) }}</span>
        </RouterLink>

      </div>

    </div>

  </div>

     
     <div class="profile-contacts" aria-label="Social and email contacts">
      
  <!-- Facebook -->
  <div v-if="profileStore.facebook" class="profile-contacts__item">
    
    <div class="profile-contacts__icon profile-contacts__icon--facebook">
      <SvgIcons name="facebook" /> 
    </div>

    <div class="profile-contacts__content">
      <div class="profile-contacts__label profile-contacts__label--facebook">
      Facebook
      </div>
        <div class="profile-contacts__value">
      
      <!-- Active Contact Present -->
    <p class="profile-contacts__definition">
         <span>https://facebook.com/</span>
      <a :href="`profileStore.facebookLink`" target="_blank" rel="noopener noreferrer">
        {{ profileStore.facebook }}
      </a>
        </p>

      </div>
    </div>

  </div>

  <!-- Twitter / X -->
  <div v-if="profileStore.twitter" class="profile-contacts__item">
     
    <div class="profile-contacts__icon profile-contacts__icon--twitter">
      <SvgIcons name="twitter" /> 
    </div>

    <div class="profile-contacts__content">
      <div class="profile-contacts__label profile-contacts__label--twitter">
      X
      </div>
        <div class="profile-contacts__value">
      
      <!-- Active Contact Present -->
    <p class="profile-contacts__definition">
          <span>https://x.com/</span>
      <a :href="`profileStore.twitterLink`" target="_blank" rel="noopener noreferrer">
        {{ profileStore.twitter }}
      </a>
        </p>

      </div>
    </div>
  </div>

  <!-- LinkedIn -->
  <div v-if="profileStore.linkedin" class="profile-contacts__item">
     
    <div class="profile-contacts__icon profile-contacts__icon--linkedin">
      <SvgIcons name="linkedin" /> 
    </div>

    <div class="profile-contacts__content">
      <div class="profile-contacts__label profile-contacts__label--linkedin">
      LinkedIn
      </div>
        <div class="profile-contacts__value">
      
      <!-- Active Contact Present -->
    <p class="profile-contacts__definition">
          <span>https://linkedin.com/in/</span>
      <a :href="`profileStore.linkedinLink`" target="_blank" rel="noopener noreferrer">
        {{ profileStore.linkedin }}
      </a>
        </p>

      </div>
    </div>

  </div>

  <!-- Instagram -->
  <div v-if="profileStore.instagram" class="profile-contacts__item">
     
    <div class="profile-contacts__icon profile-contacts__icon--instagram">
      <SvgIcons name="instagram" /> 
    </div>

    <div class="profile-contacts__content">
      <div class="profile-contacts__label profile-contacts__label--instagram">
      Instagram
      </div>
        <div class="profile-contacts__value">
      
      <!-- Active Contact Present -->
    <p class="profile-contacts__definition">
        <span>https://instagram.com/</span>
      <a :href="`profileStore.instagramLink`" target="_blank" rel="noopener noreferrer">
        {{ profileStore.instagram }}
      </a>
        </p>

      </div>
    </div>

  </div>

  <!-- WhatsApp -->
<div v-if="profileStore.whatsapp" class="profile-contacts__item">
  <div class="profile-contacts__icon profile-contacts__icon--whatsapp">
    <SvgIcons name="whatsapp" />
  </div>

  <div class="profile-contacts__content">
    <div class="profile-contacts__label profile-contacts__label--whatsapp">
      WhatsApp
    </div>
    <div class="profile-contacts__value">
      <p class="profile-contacts__definition">
        <span>wa.me/</span>
        <a :href="`https://wa.me/${profileStore.whatsapp}`" target="_blank" rel="noopener noreferrer">
          {{ profileStore.whatsapp }}
        </a>
      </p>
    </div>
  </div>
</div>

<!-- TikTok -->
<div v-if="profileStore.tiktok" class="profile-contacts__item">
  <div class="profile-contacts__icon profile-contacts__icon--tiktok">
    <SvgIcons name="tiktok" />
  </div>

  <div class="profile-contacts__content">
    <div class="profile-contacts__label profile-contacts__label--tiktok">
      TikTok
    </div>
    <div class="profile-contacts__value">
      <p class="profile-contacts__definition">
        <span>tiktok.com/@</span>
        <a :href="`https://tiktok.com/@${profileStore.tiktok}`" target="_blank" rel="noopener noreferrer">
          {{ profileStore.tiktok }}
        </a>
      </p>
    </div>
  </div>
</div>

  <!-- Email -->
  <div v-if="profileStore.email" class="profile-contacts__item">
     
    <div class="profile-contacts__icon profile-contacts__icon--email">
      <SvgIcons name="email" /> 
    </div>

    <div class="profile-contacts__content">
      <div class="profile-contacts__label profile-contacts__label--email">
      Email Address
      </div>
        <div class="profile-contacts__value">
      
      <!-- Active Contact Present -->
    <p class="profile-contacts__definition">
         <a :href="`mailto:${profileStore.email}`">{{ profileStore.email }}</a>
        </p>

      </div>
    </div>

  </div>

  <!-- Phone -->
  <div v-if="profileStore.telephone" class="profile-contacts__item">
     
    <div class="profile-contacts__icon profile-contacts__icon--telephone">
      <SvgIcons name="telephone" /> 
    </div>

    <div class="profile-contacts__content">
      <div class="profile-contacts__label profile-contacts__label--telephone">
      Phone Number
      </div>
        <div class="profile-contacts__value">
      
      <!-- Active Contact Present -->
    <p class="profile-contacts__definition">
         <a :href="`tel:${profileStore.telephone}`">{{ profileStore.telephone }}</a>
        </p>

      </div>
    </div>

  </div>

  <!-- Website -->
  <div v-if="profileStore.website" class="profile-contacts__item">
     
    <div class="profile-contacts__icon profile-contacts__icon--website">
      <SvgIcons name="website" /> 
    </div>

    <div class="profile-contacts__content">
      <div class="profile-contacts__label profile-contacts__label--website">
      Website
      </div>
        <div class="profile-contacts__value">
      
      <!-- Active Contact Present -->
    <p class="profile-contacts__definition">
          <a :href="profileStore.website" target="_blank" rel="noopener noreferrer">
        {{ profileStore.website }}
      </a>
        </p>

      </div>
    </div>

  </div>
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