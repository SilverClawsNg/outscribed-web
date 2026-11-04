<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'
import { useEngagement } from '@/composables/useEngagement';

import { formatCounts } from '@/utils/stringHelpers'
import { toRelativeTime } from '@/utils/dateExtensions'
import { getEngagementMetadata } from '@/features/engagements/types/EngagementTypes'
import { type TaleListDto } from '../types/TalesTypes';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()
const engage = useEngagement()

interface Props {
  tale: TaleListDto,
  isHomepage?: boolean
}

const props = defineProps<Props>()

// Transform state properties reactively on demand
const uiMeta = computed(() => getEngagementMetadata(props.tale.engagement));

const contentType = 'tales'
const contentPath = 'tale'

</script>

<template>

     <article 
        class="pill-card"
      >
       <div class="pill-wrapper">
         <div class="pill-image-wrap">
          <img 
            :src="mediaHelper.getUrl(tale.photo, 'tales', 'thumb') || undefined" 
            :alt="tale.title" 
            class="content-card__image"
          />
        </div>
        <div class="pill-body">
          <div class="content-card">
      
      <!-- Title -->
      <h2 class="content-card__title content-card__title--small">
        <RouterLink :to="`/tale/${tale.slug}`">{{ tale.title }}</RouterLink>
      </h2>
 
      <!-- Summary -->
      <p class="content-card__summary content-card__summary--small">
        {{ tale.summary.length > 500 ? tale.summary.substring(0, 500) + '...' : tale.summary }}
      </p>

      <div class="content-card__meta">
        <button class="at" @click="modalStore.push('Profile', 'Profile', tale.creatorId)">
          {{ tale.creatorUsername }}
        </button>
        <span class="divider divider--circle"></span>
        <time class="content-card__date">{{ toRelativeTime(tale.createdAt) }}</time>
        <span class="divider divider--circle"></span>
        <span>{{ tale.readingTime }} Min Read</span>
      </div>
      
    <!-- Actions Footer -->
    <footer class="content-card__footer">
      <RouterLink class="btn btn--secondary"  :to="`/tale/${tale.slug}`">View Tale</RouterLink>
      
      <button 
        class="content-card__save-btn"
        @click="engage.favorite(tale.engagement)"
        :title="tale.engagement.isFavorite ? 'Remove From Favorites' : 'Add To Favorites'"
      >
        <SvgIcons name="bookmark" /> 
        <span>Add to Favorites</span>
      </button>
    </footer>
        
      </div>
        </div>
       </div>
      </article>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

  
.content-card {
  width: 100%;
  height: auto;
  //padding: 1.5rem 0;
  
  &__media-link {
   display: block;
   width: 100%;
    height: 250px;
    margin-bottom: 1rem;
    background-color: var(--light-background-color);
    overflow: hidden;
    border-radius: 4px;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }
  
  &__meta{
    display: flex;
    align-items: center;
    //justify-content:center;
    column-gap: 0.5rem;
    z-index: 10;
    margin-bottom: 1rem;
    }

  // --- Card Content Body ---
  &__body {
    display: flex;
    flex-direction: column;
  }

    &__title {
      //text-align: center;
     
     
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
      font-weight:normal;
     font-size: clamp(1.3rem, 5vw, 1.6rem);
                line-height: 1.1;
               
     
    }
     
    &__summary {
      
      margin-bottom: 1rem;
      //text-align: center;
      color: var(--muted-text-color);
  font-size: clamp(0.9rem, 5vw, 1rem);
         line-height: 1.2;  
    
    }


  // --- Metrics ---
  &__stats {
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    //justify-content:center;
    gap: 0.25rem 0.75rem;
    //font-size: 0.9rem;
    
  }

  &__stat {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;

    span {
      font-weight: 600;
    }
  }


&__taxonomy {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    //justify-content:center;
    margin-bottom: 1rem;
}
       
  &__taxonomy-item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    background-color: var(--light-background-color);
    border: 1px solid var(--border-color);
    color: var(--muted-text-color);
    //color:@link-color;
    border-radius: 99999px;
    font-size: 0.9rem;
    font-weight: 600;

     &:hover {
          background-color: var(--light-background-color);
        }
      }

  // --- Footer Actions ---
  &__footer {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    //justify-content:space-between;
  }

  &__save-btn {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
    height: 40px;
  }
}

    .pill-card {
      display: flex;
      flex-direction: column;
      cursor: pointer;
       margin-bottom: 2rem;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 2rem;

      @media @smallDevice{
     width: 100%;
      max-width: @min-width;
      margin: 0 auto;
  }


    @media @tablet {
      width: 100%;
      max-width: @min-width;
      margin: 0 auto;
    }

      .pill-image-wrap {
        width: 100%;
        aspect-ratio: 4/3;
        height: auto; // Fixed 240px height
        background-color: var(--light-background-color);
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 0.75rem;

       

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.25s ease;
        }
      }

      &:hover .pill-image-wrap img {
        transform: scale(1.03);
      }


      &:hover .pill-title {
        color: #4f46e5;
      }
    }
</style>
