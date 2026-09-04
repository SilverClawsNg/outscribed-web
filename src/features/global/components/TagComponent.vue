<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SvgIcons from '@/components/SvgIcons.vue'

import { formatCounts } from '@/utils/stringHelpers'
import { toShortDate } from '@/utils/dateExtensions'
import { type TagDetailDto } from '../types/GlobalTypes';

// Declare compile-time parameter contract boundaries
interface Props {
  tag: TagDetailDto
}

const props = defineProps<Props>()

</script>

<template>
 
   <article class="tag-lists__card">
    
   <div class="tag-lists__card-contents">
    
     <h1 class="tag-lists__title">
      <SvgIcons name="tag" />
      {{ tag.name }}
     </h1>

      <span class="divider line"></span>

       <p>Created: {{ toShortDate(tag.createdAt) }}</p>

        <span class="divider line"></span>

       <p>Last Updated: {{ toShortDate(tag.lastUpdatedAt) }}</p>

        <span class="divider line"></span>
        
         <RouterLink :to="`/tales?tag=${tag.slug}`">
          Tales: {{ formatCounts(tag.talesCounter) }}
        </RouterLink>

        <span class="divider line"></span>

         <RouterLink :to="`/insights?tag=${tag.slug}`">
          Insights: {{ formatCounts(tag.insightsCounter) }}
        </RouterLink>

      </div>
 
  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/tag-lists.less";
</style>