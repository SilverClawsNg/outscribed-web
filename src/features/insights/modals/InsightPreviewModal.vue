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

const unavailable = ref<boolean>(false);

// --- SET GUARD FOR NULL DETAILS/ INITIALIZE FORM DATA ---
onBeforeMount(() => {

  if (!insightStore.activeInsight) {
    // 1. Lock down the form immediately to block accidental click updates
    
   unavailable.value = true
    
    return // 🛑 Stop initialization; do not attempt to read properties of null
  }

})

</script>

<template>

  <template v-if="unavailable">
    <PageStatusMessage 
      title="204: Content Unavailable!" 
      message="Unable to load current insight details. Refresh page and try again">
    </PageStatusMessage>
  </template>

    <template v-else>
  
  <article class="content-details">
    
    <section class="content-details__header-container">
      <div class="content-details__header">
        <h1 class="content-details__title">{{ insightStore.activeInsight!.title }}</h1>

        <div class="content-details__metadata-writer">
          By 
          <button 
            class="at" 
            @click="modalStore.push('Profile', 'Profile', authStore.userId)"
          >
            {{ authStore.username }}
          </button>
        </div>

        <section class="content-details__metadata">
          <div class="content-details__metadata-date">
            <SvgIcons name='clock' /> {{ toShortDate(insightStore.activeInsight!.createdAt) }}
          </div>

          <div class="content-details__metadata-category">
           <SvgIcons name='tag' /> 
            <router-link 
              class="content-details__category" 
              :to="`/insights?category=${insightStore.activeInsight!.category}`"
            >
             {{ CategoryDescriptions[insightStore.activeInsight!.category] }}
            </router-link>
          </div>

          <template  v-if="insightStore.activeInsight!.country">

          <div class="content-details__metadata-country">
             <SvgIcons name='globe' />
            <router-link 
              class="content-details__country" 
              :to="`/insights?country=${insightStore.activeInsight!.country}`"
            >
              {{ CountryDescriptions[insightStore.activeInsight!.country] }}            
            </router-link>
          </div>
          </template>

        </section>

          <template v-if="insightStore.activeInsight!.summary">
              <section class="content-details__summary">
          
           {{ insightStore.activeInsight!.summary }}
        </section>
              
            </template>
             <template v-else >
                  <section class="content-details__summary">
                          <p class="no-content">Summary goes here!</p>
        
        </section>
            </template>
      
      </div>
    </section>  

    <section class="content-details__main-container">
     
     <template v-if="insightStore.activeInsight!.photo">
 <figure class="content-details__image">
        <img :src="mediaHelper.getUrl(insightStore.activeInsight!.photo, 'insights', 'full')" :alt="insightStore.activeInsight!.photoCaption ?? 'photo caption goes here'" />
        <figcaption class="content-details__image-caption">
          {{ insightStore.activeInsight!.photoCaption }}
        </figcaption>
      </figure>
        </template>
         <template v-else>
                                 <p class="no-content">Your central image goes here!</p>

        </template>

       <template v-if="insightStore.activeInsight!.detail">
 <section class="content-details__reading-time">
          — {{ calculateReadingTime(insightStore.activeInsight!.detail) }} Minutes Read
        </section>

        <section class="content-details__text" v-html="insightStore.activeInsight!.detail"></section>
        </template>
         <template v-else>
             <section class="content-details__reading-time">
          — 0 Minutes Read
        </section>

        <section class="content-details__text">
                  <p class="no-content">Detail goes here!</p>

        </section>
        </template>
    
       <template v-if="insightStore.activeInsight!.addendum && insightStore.activeInsight!.addendumDate">
 <section class="content-details__addendum">
        <h4>Addendum - Last Updated {{ toShortDate(insightStore.activeInsight!.addendumDate) }}</h4>
        <ol>
          <li v-for="(addendum, index) in formatAddendum(insightStore.activeInsight!.addendum)" :key="index">
            {{ addendum }}
          </li>
        </ol>
      </section>
        </template>
       

       <template  v-if="insightStore.activeInsight!.tags && insightStore.activeInsight!.tags.length > 0">
  <section class="content-details__tags">
        <h4>Tagged In: </h4><span class="divider line"></span>
        <span v-for="tag in insightStore.activeInsight!.tags" :key="tag.tagId">
          #<router-link :to="`/insights/browse?tag=${tag.tagId}`">{{ tag.name }}</router-link>
        </span>
      </section>
        </template>
         <template v-else>
              <section class="content-details__tags">
                       <p class="no-content">Your tags goes here!</p>

      </section>
        </template>
    

    </section>
  </article>
  </template>

</template>

<style lang="less" scoped>
@import "@/assets/css/content-details.less";
</style>