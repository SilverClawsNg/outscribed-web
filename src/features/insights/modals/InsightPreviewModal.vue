<script setup lang="ts">
import { ref, onBeforeMount} from 'vue';
import { useModalStore } from '@/stores/modalStore';
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore';
import { toShortDate } from '@/utils/dateExtensions'
import { calculateReadingTime } from '@/utils/readingTimeHelper';
import { CategoryDescriptions, CountryDescriptions } from '@/utils/descriptors'
import { mediaHelper } from '@/utils/mediaHelper'
import { formatAddendum } from '@/utils/stringHelpers'
import { useInsightDraftStore } from '../stores/InsightDraftStore'
import SvgIcons from '@/components/SvgIcons.vue'

// 2. State & Store Injections
const modalStore = useModalStore();
const authStore = useAuthStore();
const insightStore = useInsightDraftStore()

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!insightStore.activeInsight) {
    // 1. Lock down the form immediately to block accidental click updates
   
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

})

</script>

<template>

  <template v-if="!insightStore.activeInsight">
    <PageStatusMessage 
      title="Content Unavailable!" 
      message="Unable to load current insight details. Refresh page and try again">
    </PageStatusMessage>
  </template>

    <template v-else>
  
  <article class="content-details">
    
    <header class="content-details__header-container">

      <div class="content-details__header">

        <h1 class="content-details__title">{{ insightStore.activeInsight.title }}</h1>

        <div class="content-details__writer">
          By 
          <button 
            type="button"
             class="content-details__writer-link at" 
            @click="modalStore.push('Profile', 'Profile', authStore.userId)"
          >
            {{ authStore.username }}
          </button>
           — <time>{{ toShortDate(insightStore.activeInsight.createdAt) }}</time>
        </div>

         <div class="content-details__meta">
        
         <div class="content-details__meta-item">
           <SvgIcons name='tag' /> 
            <router-link 
              class="content-details__category" 
              :to="`/insights?category=${insightStore.activeInsight.category}`"
            >
             {{ CategoryDescriptions[insightStore.activeInsight.category] }}
            </router-link>
          </div>

          <template  v-if="insightStore.activeInsight.country">

          <div class="content-details__meta-item">
             <SvgIcons name='globe' />
            <router-link 
              class="content-details__country" 
              :to="`/insights?country=${insightStore.activeInsight.country}`"
            >
              {{ CountryDescriptions[insightStore.activeInsight.country] }}            
            </router-link>
          </div>
          </template>

             <template v-else >
                   <p class="content-details__no-content">No country selected!</p>
            </template>
        </div>

          <template v-if="insightStore.activeInsight.summary">
              <p class="content-details__summary">
          
           {{ insightStore.activeInsight.summary }}
              </p>
              
            </template>
             <template v-else >
                   <p class="content-details__no-content">Summary goes here!</p>
            </template>
      
      </div>
    </header>  

    <div class="content-details__main">
     
     <template v-if="insightStore.activeInsight.photo">
 <figure  class="content-details__media">
        <img 
        :src="mediaHelper.getUrl(insightStore.activeInsight.photo, 'insights', 'full')" 
        :alt="insightStore.activeInsight.photoCaption ?? 'photo caption goes here'"
        class="content-details__image" />
        <figcaption class="content-details__image-caption">
          {{ insightStore.activeInsight.photoCaption }}
        </figcaption>
      </figure>
        </template>
         <template v-else >
                   <p class="content-details__no-content">Central image goes here!</p>
            </template>

       <template v-if="insightStore.activeInsight.detail">
 <p class="content-details__reading-time">
          — {{ calculateReadingTime(insightStore.activeInsight.detail) }} Minutes Read
 </p>

        <div class="shared__rich-text" v-html="insightStore.activeInsight.detail"></div>
        </template>
         <template v-else>
             <p class="content-details__reading-time">
          — 0 Minutes Read
             </p>
                  <p class="content-details__no-content">Detail goes here!</p>

        </template>
    
       <template v-if="insightStore.activeInsight.addendum && insightStore.activeInsight.addendumDate">
 <div class="content-details__addendum">
        <h4 class="content-details__section-title">Addendum - Last Updated {{ toShortDate(insightStore.activeInsight.addendumDate) }}</h4>
        <ol class="content-details__addendum-list">
          <li v-for="(entry, index) in formatAddendum(insightStore.activeInsight.addendum)" :key="index">
            {{ entry }}
          </li>
        </ol>
      </div>
        </template>

       <template  v-if="insightStore.activeInsight.tags && insightStore.activeInsight.tags.length > 0">
  <div class="content-details__tags">
       <h4 class="content-details__tag-title">Tagged In</h4>
        <span class="divider line"></span>
        <span v-for="tag in insightStore.activeInsight.tags" :key="tag.tagId"  class="content-details__tag-item">
          #<router-link :to="`/insights/browse?tag=${tag.tagId}`">{{ tag.name }}</router-link>
        </span>
      </div>
        </template>
        <template v-else >
                   <p class="content-details__no-content">Tags goes here!</p>
            </template>

      </div>

  </article>
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/content-details.less";
@import "@/assets/css/rich-text.less";
</style>