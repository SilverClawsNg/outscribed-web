<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue'
import { useAuthStore } from '@/features/gatekeeper/stores/gatekeeperStore'
import { useModalStore } from '@/stores/modalStore'
import { useFormProgress } from '@/composables/useFormProgress'
import FormProgress from '@/components/FormProgress.vue'
import { useRouter } from 'vue-router'
import type { LogoutRequest } from '@/features/gatekeeper/types/GatewayTypes'

const authStore = useAuthStore()
const modalStore = useModalStore()
const router = useRouter()
const { progressState, startLoading, resetProgress } = useFormProgress()

// Local working state bound strictly to your official contract schema
// Initialized with a placeholder string value for form dropdown validation
const formData = ref<LogoutRequest>({
  closeAll: false,
  flushCache: false,
  type: 2
})

function handleLogoutSubmission() {

   startLoading()

  // 1. FIRE AND FORGET: Trigger the backend session drop in the background 
  // without using 'await'. The browser handles the request asynchronously.
  authStore.logout(formData.value)

  // 4. INSTANT UI RESET: Dismiss modal layout stack and go home
  //modalStore.closeAll()
  router.push('/')
}

onBeforeMount(() => {
  resetProgress()
})

</script>

<template>
  <div class="form-container boxed">
    <h1>Logout</h1>
    <h2>Confirm your logout preferences</h2>

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleLogoutSubmission" autocomplete="off">

      <fieldset class="expanded" :disabled="progressState.type === 'Loading'">
        <div class="ticks">
          <input 
            type="checkbox" 
            id="FlushCache" 
            v-model="formData.flushCache" 
          />
          
          <label for="FlushCache">
            {{ formData.flushCache 
              ? 'Remove all cached data (Recommended if this is a public device)' 
              : 'Keep all cached data (Recommended if this is a private device)' 
            }}
          </label>

        </div>
</fieldset>

      <fieldset :disabled="progressState.type === 'Loading'">
        <div class="ticks">
          <input 
            type="checkbox" 
            id="CloseAll" 
            v-model="formData.closeAll" 
          />
          
          <label for="CloseAll">
            {{ formData.closeAll 
              ? 'Logout of all devices' 
              : 'Logout of only current device' 
            }}
          </label>

        </div>
</fieldset>

        <div class="button-holder">
          <button 
            type="submit" 
            class="btn contrast" 
            :disabled="progressState.type === 'Loading'"
          >
            {{ progressState.type === 'Loading' ? 'Submitting...' : 'Logout' }}
          </button>
        </div>

    </form>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/form-input.less";

@import "@/assets/css/form-container.less";

</style>