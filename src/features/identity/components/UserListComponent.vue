<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useModalStore } from '@/stores/modalStore'

import { toShortDate } from '@/utils/dateExtensions'
import { type UserListDto } from '../types/IdentityTypes';
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { useEngagement } from '@/composables/useEngagement';
import SvgIcons from '@/components/SvgIcons.vue'
import { formatCounts } from '@/utils/stringHelpers'
import { ContentTypeDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

// Declare compile-time parameter contract boundaries
interface Props {
  user: UserListDto
}

const props = defineProps<Props>()

  // 2. Reactive Component States
const isExpanded = ref<boolean>(false);
const hasOverflow = ref<boolean>(false);

// 3. Declare the Template Ref (Matches v-ref / @ref from Blazor)
const userElement = ref<HTMLElement | null>(null);
  
// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.user.engagement));


// 4. Lifecycle Execution: Equivalent to OnAfterRenderAsync(firstRender)
onMounted(async () => {
  // Ensure DOM has entirely settled printing the v-html payload
  await nextTick();

  if (userElement.value) {
    const el = userElement.value;
    
    // Check line overflow directly without window scope attachments
    const isOverflowing = el.scrollHeight > el.clientHeight;
    hasOverflow.value = isOverflowing;

    // If it fits completely inside the truncation boundaries, treat it as expanded
    if (!isOverflowing) {
      isExpanded.value = true;
    }
  }
});

</script>
<template>
  <article class="user-card">
    <div class="user-card__main">
      <!-- User Avatar -->
      <figure class="user-card__avatar">
        <template v-if="user.photo">
          <img 
            :src="mediaHelper.getUrl(user.photo, 'profiles') || undefined" 
            :alt="user.title" 
            class="user-card__avatar-img"
          />
        </template>
        <template v-else>
          <SvgIcons name="user" class="user-card__avatar-icon" /> 
        </template>
      </figure>

      <!-- Content Stack -->
      <div class="user-card__details">
        <!-- Header Stack: Title left-aligned, Date right-aligned on desktop -->
        <header class="user-card__header">
          <h1 class="user-card__title">
            <span class="user-card__name">{{ user.title }}</span>
            <button 
              type="button" 
              class="user-card__username at" 
              @click="modalStore.push('Profile', 'Profile', user.accountId)"
            >
              {{ user.username }}
            </button>
          </h1>

          <div class="user-card__date">
            User since {{ toShortDate(user.registeredAt) }}
          </div>
        </header>

        <!-- Metric Badges/Stats -->
        <div class="user-card__stats">
          <p class="user-card__stat-item">
            <span class="user-card__stat-value">{{ formatCounts(user.talesCount) }}</span> Tales
          </p>
          <p class="user-card__stat-item">
            <span class="user-card__stat-value">{{ formatCounts(user.engagement.insightsCount) }}</span> Insights
          </p>
          <p class="user-card__stat-item">
            <span class="user-card__stat-value">{{ formatCounts(user.engagement.commentsCount) }}</span> Comments
          </p>
          <p class="user-card__stat-item">
            <span class="user-card__stat-value">{{ formatCounts(user.engagement.favoritesCount) }}</span> Followers
          </p>
          <p class="user-card__stat-item">
            <span class="user-card__stat-value">{{ formatCounts(user.followsCount) }}</span> Follows
          </p>
        </div>

        <!-- Action Row -->
        <footer class="user-card__footer">
          <button 
            type="button" 
            class="btn secondary user-card__action-btn" 
            @click="modalStore.push('Profile', 'Profile', user.accountId)"
          >
            View Profile
          </button>

          <button 
            type="button"
            class="user-card__save-btn"
            @click="engage.favorite(user.engagement)"
            :title="user.engagement.isFavorite ? 'Unfollow User' : 'Follow User'"
            :disabled="uiMeta.isFavoriteDisabled"
          >
            <SvgIcons name="bookmark" class="user-card__save-icon" /> 
            <span>{{ uiMeta.favoriteLongText }}</span>
          </button>
        </footer>
      </div>
    </div>
  </article>
</template>
<style lang="less" scoped>
@import "@/assets/css/user-card.less";
</style>