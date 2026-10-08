<template>

  <div :class="['auth-container', { 'is-modal': !isPage }]">
    
    <!-- Header Title & Help Link -->
    <header class="auth-header">
      <h1 class="auth-title">Step Into The World of OutScribed</h1>
      <p class="auth-subtitle">
        Craft inspiring tales, thought provoking insights, and elucidatory commentaries.
        <a href="/help" class="help-link">Need Help?</a>
      </p>
    </header>

    <!-- Tab Navigation -->
    <nav class="auth-tabs">
      <button
        :class="['tab-btn', { active: currentType === 'register' }]"
        @click="switchTab('register')"
      >
        Register
      </button>
      <button
        :class="['tab-btn', { active: currentType === 'login' }]"
        @click="switchTab('login')"
      >
        Login
      </button>
      <button
        :class="['tab-btn', { active: currentType === 'reset' }]"
        @click="switchTab('reset')"
      >
        Reset Password
      </button>
    </nav>
    <div class="divider-line"></div>

    <!-- Active Component Flow -->
    <main class="auth-body">
      <RegisterComponent
        v-if="currentType === 'register'"
        @success="handleSuccess"
      />
      <LoginComponent
        v-else-if="currentType === 'login'"
        @success="handleSuccess"
        @switch-to-register="switchTab('register')"
      />
      <ResetComponent
        v-else-if="currentType === 'reset'"
        @success="handleResetSuccess"
      />
    </main>

    <!-- Footer -->
    <footer v-if="isPage" class="auth-footer">
      <div class="footer-brand">
        <span class="brand-logo">●</span> OutScribed
      </div>
      <div class="footer-links">
        <a href="/help">Need Help?</a>
        <a href="/terms">Terms of Use</a>
        <a href="/privacy">Privacy</a>
        <a href="/disclaimers">Disclaimers</a>
        <span>copyright@2026</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import RegisterComponent from './RegisterComponent.vue';
import LoginComponent from './LoginComponent.vue';
import ResetComponent from './ResetComponent.vue';

const props = withDefaults(
  defineProps<{
    isPage?: boolean;
    authType?: 'register' | 'login' | 'reset';
  }>(),
  {
    isPage: true,
    authType: 'register',
  }
);

const emit = defineEmits<{
  (e: 'success', data?: any): void;
}>();

const currentType = ref<'register' | 'login' | 'reset'>(props.authType);

watch(
  () => props.authType,
  (newVal) => {
    currentType.value = newVal;
  }
);

function switchTab(type: 'register' | 'login' | 'reset') {
  currentType.value = type;
}

function handleSuccess(payload: any) {
  emit('success', payload);
}

function handleResetSuccess() {
  currentType.value = 'login';
}
</script>

<style scoped lang="less">
.auth-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a1a;

  &.is-modal {
    padding: 0;
    max-width: 100%;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;

  .auth-title {
    font-size: 2.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .auth-subtitle {
    font-size: 1rem;
    color: #4a5568;

    .help-link {
      color: #0070f3;
      text-decoration: none;
      font-weight: 600;
      &:hover { text-decoration: underline; }
    }
  }
}

.auth-tabs {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin-bottom: -1px;

  .tab-btn {
    background: none;
    border: none;
    font-size: 1.125rem;
    font-weight: 500;
    color: #2d3748;
    padding: 0.5rem 0.25rem;
    cursor: pointer;
    position: relative;

    &.active {
      font-weight: 700;
      color: #000;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #000;
      }
    }
  }
}

.divider-line {
  width: 100%;
  height: 1px;
  background-color: #e2e8f0;
  margin-bottom: 2rem;
}

.auth-body {
  width: 100%;
}

</style>