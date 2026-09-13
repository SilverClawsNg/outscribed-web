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
  <article class="vote-card">
    <header class="vote-card__header">
      <div class="vote-card__user">
        <button 
          type="button" 
          class="vote-card__username at" 
          @click="modalStore.push('Profile', 'Profile', vote.voterId)"
        >
          {{ vote.username }}
        </button>
      </div>

      <time class="vote-card__date">
        {{ toShortDate(vote.votedAt) }}
      </time>
    </header>
  </article>
</template>

<style lang="less" scoped>
@import "@/assets/css/vote-card.less";
</style>