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

<article class="user-lists__card">
    
    <section class="user-lists__left-card">

       <figure class="user-lists__image">

        <template v-if="user.photo">
          <img :src="mediaHelper.getUrl(user.photo, 'profiles') || undefined" :alt="user.title" />
        </template>

        <template v-else>
          <SvgIcons name="user" /> 
        </template>

    </figure>
      
    </section>

        <section class="user-lists__details">

          <h1 class="user-lists__title">

            {{ user.title }}
             <button class="at" @click="modalStore.push('Profile', 'Profile', user.accountId)">
              {{ user.username }}
            </button>

          </h1>
      
      <div class="user-lists__date">
       User since {{ toShortDate(user.registeredAt) }}
    </div>
      
     <section class="user-lists__stats">
      <p><span>{{ formatCounts(user.talesCount) }}</span> Tales</p>
      <p><span>{{ formatCounts(user.engagement.insightsCount) }}</span> Insights</p>
       <p><span>{{ formatCounts(user.engagement.commentsCount) }}</span> Comments</p>
      <p><span>{{ formatCounts(user.engagement.favoritesCount) }}</span> Followers</p>
      <p><span>{{ formatCounts(user.followsCount) }}</span> Follows</p>
    </section>

   <section class="user-lists__favorite">
     
      <button 
        @click="engage.favorite(user.engagement)"
        :title="user.engagement.isFavorite ? 'Unfollow User' : 'Follow User'"
        :disabled="uiMeta.isFavoriteDisabled">
        <SvgIcons name="bookmark" /> {{ uiMeta.favoriteAltText }}
      </button>

    </section>

    </section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/user-lists.less";
</style>