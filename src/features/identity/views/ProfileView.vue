<script setup lang="ts">

// --- IMPORT ---
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageStatusMessage from '@/components/PageStatusMessage.vue'
import ProfileComponent from '../components/ProfileComponent.vue'
import { useProfileStore } from '../stores/ProfileStore' // 🚀 Import Profile Store
import { APIError } from '@/api/apiTypes.ts'
import { useModalStore } from '@/stores/modalStore';

// --- INITIALIZE STORES ---
const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()
const modalStore = useModalStore();

// --- DEFINE & INITALIZE LOCAL VARIABLES ---
const loadingError = ref<APIError | null>(null)
const isLoading = ref<boolean>(true);
const currentPath = encodeURIComponent(route.fullPath)

// --- DEFINE PAGE FUNCTIONS ---
function redirectToLogin() {router.push(`/login?returnUrl=${currentPath}`)}

// --- DEFINE PAGE INITIALIZATION ---
async function initPage() {

  console.log('🚀 [Profile View]: Presence verified via hint. Dispatching data fetch...')
  
  const { error } = await profileStore.loadMyProfile()

  if (error) {
    loadingError.value = error
  }

  //No matter the result, stop loading
  isLoading.value = false

}

// --- MOUNT PAGE ---
onMounted(async () => {
  initPage();
})


// inside your HomeView.vue
onUnmounted(() => {
  profileStore.abort();
});

</script>

<template>
 
    <template v-if="isLoading">
      <div class="loader-container">
        <p class="loader"></p>
      </div>
    </template>

    <template v-else-if="loadingError">
      <PageStatusMessage 
        :title="loadingError.title" 
        :message="loadingError.detail"
        icon="warning" 
        :is-standalone="true">>
        <template v-if="loadingError.status === 401" #actions>
          <button class="btn primary" @click="redirectToLogin">Login</button>
        </template>
          <template v-else-if="loadingError.definition" #actions>
           <button class="btn primary" @click="modalStore.push('ProblemDefinition', 'Problem Detail', loadingError)"  >
            More Details
          </button>
        </template>
      </PageStatusMessage>
    </template>

    <template v-else-if="profileStore.profile">
      <ProfileComponent />
    </template>

    <template v-else>
        <PageStatusMessage
      title="Unknown Error!"
      message="An unknown error occured loading profile. Refresh page and try again."
      icon="warning"
      :is-standalone="true"
       />
    </template>

</template>
