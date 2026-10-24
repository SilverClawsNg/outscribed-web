<!-- views/LogoutView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthenticationStore } from '../stores/AuthenticationStore';
import type { LogoutRequest } from '../types/AuthenticationTypes';
import FormProgress from '@/components/FormProgress.vue';
import { useFormProgress } from '@/composables/useFormProgress'
import HelpIcon from '@/components/HelpIcon.vue'

const router = useRouter()
const authStore = useAuthenticationStore();

// State
const isSubmitting = ref(false)

const { progressState, startLoading, setSuccess, setError, setWarning, resetProgress } = useFormProgress()

// --- INITIALIZE FORM DATA FROM STORE ---
const formData = ref<LogoutRequest>({
   type: 2,
   flushCache: false,
   closeAll: false
})

// Action execution
function handleLogout() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  // 1. Dispatch to authStore without blocking/awaiting the response
  authStore.logout(formData.value)

  // 2. Return user immediately to root /
  router.push('/')
}
</script>

<template>


  <div class="auth-card">

     <div class="auth-card__header">
        <div class="auth-card__header--logo">
          <router-link to="/" class="main-header__brand-link" title="OutScribed Home">
               <img src="@/assets/images/icon.png" alt="OutScribed Icon" />
          </router-link>
        </div>
        <h1 class="auth-card__header--title">Log Out</h1>
        <p class="auth-card__header--subtitle">to clear account</p>
        <HelpIcon topic="LogoutAccount" />
      </div>

    <!-- FORM 1: Standard Login -->

    <FormProgress :progress="progressState" />

    <form @submit.prevent="handleLogout"  class="auth-card__form">

         <!-- Flush Cache Checkbox -->
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="formData.flushCache"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="label-text">Flush Local Cache</span>
          </label>
          <p class="help-text" :class="{ active: formData.flushCache }">
            <template v-if="!formData.flushCache">
              Check to remove all local work and cached drafts from this computer (advisable if using a public or shared system).
            </template>
            <template v-else>
              Uncheck to keep cached offline drafts stored on this computer.
            </template>
          </p>
        </div>

        <!-- Close All Sessions Checkbox -->
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="formData.closeAll"
              type="checkbox"
              class="checkbox-input"
            />
            <span class="label-text">Sign Out of All Devices</span>
          </label>
          <p class="help-text" :class="{ active:formData. closeAll }">
            <template v-if="!formData.closeAll">
              Check to invalidate active sessions on all other browsers and devices.
            </template>
            <template v-else>
              Uncheck to remain logged in on your other active devices.
            </template>
          </p>
        </div>

           <button type="submit" class="auth-card__form--action" :disabled="isSubmitting">
            {{ isSubmitting ? 'Logging out...' : 'Log Out' }}
          </button>

    </form>

</div>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";
@import "@/assets/css/auth-card.less";

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    user-select: none;

    .checkbox-input {
      width: 1.1rem;
      height: 1.1rem;
      cursor: pointer;
      accent-color: @link-color;
    }

    .label-text {
      font-size: 1.1rem;
      color: var(--text-color);
    }
  }

  .help-text {
    margin: 0 0 0 1.7rem;
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--muted-text-color);
    transition: color 0.2s ease;
  }
}

</style>