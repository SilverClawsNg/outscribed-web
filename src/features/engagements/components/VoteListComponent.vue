<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useModalStore } from '@/stores/modalStore'

import { toShortDate } from '@/utils/dateExtensions'
import { type VoteListDto } from '@/features/engagements/types/EngagementTypes';
import SvgIcons from '@/components/SvgIcons.vue'

// 2. Setup Shared Store Hooks
const modalStore = useModalStore()

// Declare compile-time parameter contract boundaries
interface Props {
  vote: VoteListDto
}

const props = defineProps<Props>()

</script>

<template>

  <article class="votes-list__card">
   
    <section class="votes-list__content">

      <button class="at" @click="modalStore.push('Profile', 'Profile', vote.voterId)">
        {{ vote.username }}
      </button>
      
     <p class="votes-list__date">
        {{ toShortDate(props.vote.votedAt) }}
      </p>
      
    </section>

  </article>
 
</template>

<style lang="less" scoped>
@import "@/assets/css/vote-lists.less";
</style>