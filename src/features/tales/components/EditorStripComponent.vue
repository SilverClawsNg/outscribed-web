<script setup lang="ts">
import { useTaleDraftStore, type MainCanvasView } from '@/features/tales/stores/TaleDraftStore'; 
import { useRouter } from 'vue-router'
import SvgIcons from '@/components/SvgIcons.vue'

const taleStore = useTaleDraftStore()
const router = useRouter()

function navigateToSection(section: MainCanvasView) {
  taleStore.setCurrentMainView(section);
}

function navigateHome() {
  router.push('/')
}

</script>

<template>

    <!-- Top Menu Block: Sidebar Toggle -->
    <div class="editor-studio__strip-menu">
      <button 
        type="button" 
        class="editor-studio__strip-btn"
        @click="taleStore.toggleAside()"
        :class="{ 'editor-strip__btn--active': !taleStore.isAsideHidden }"
        :title="taleStore.isAsideHidden ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
        <SvgIcons name="menu" :size="30" />
      </button>
    </div>
    
  <!-- Middle: Section Editors & Draft Utilities (Scrollable: calc(100vh - 100px)) -->
  <div class="editor-studio__strip-actions-wrapper">
   
    <div class="editor-studio__strip-actions">
        
    <!-- Group 1: Section Editors -->
    <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'basic' }"
      @click="taleStore.currentMainView = 'basic'"
      title="Basic Info (Title, Country, Summary)"
    >
      <SvgIcons name="metadata" :size="30" />
    </button>
    
    <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'details' }"
      @click="taleStore.currentMainView = 'details'"
      title="Prose Canvas (Details)"
    >
      <SvgIcons name="details" :size="30"/>
    </button>
    
    <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'reality' }"
      @click="taleStore.currentMainView = 'reality'"
      title="Reality Check"
    >
      <SvgIcons name="check" :size="30"/>
    </button>

    <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'photo' }"
      @click="taleStore.currentMainView = 'photo'"
      title="Cover Photo"
    >
      <SvgIcons name="placeholder" :size="30" />
    </button>

      <!-- Separator Line -->
    <div class="editor-studio__strip-divider"></div>

     <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'preview' }"
      @click="taleStore.currentMainView = 'preview'"
      title="Tale Metrics"
    >
      <SvgIcons name="preview" :size="30" />
    </button>
    <template v-if="taleStore.activeTale?.status === 'Created'">
      
      <button 
        type="button" 
        class="editor-studio__strip-btn"
        :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'publish' }"
        @click="taleStore.currentMainView = 'publish'"
        title="Publish Tale"
      >
        <SvgIcons name="publish" :size="30" />
      </button>

    </template>
    <template v-else>

      <RouterLink 
       :to="`/tale/${taleStore.activeTale?.slug}`"
       class="editor-studio__strip-btn"
       target="_blank" 
        rel="noopener noreferrer"
        title="Open live story in a new tab">
        <SvgIcons name="live" :size="30" />
      </RouterLink>
    
    </template>

     <!-- Separator Line -->
    <div class="editor-studio__strip-divider"></div>

       <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'tags' }"
      @click="taleStore.currentMainView = 'tags'"
      title="Story Tags"
    >
      <SvgIcons name="tag" :size="30" />
    </button>

     <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'addendum' }"
      @click="taleStore.currentMainView = 'addendum'"
      title="Addendum"
    >
      <SvgIcons name="addendum" :size="30" />
    </button>

    <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'metrics' }"
      @click="taleStore.currentMainView = 'metrics'"
      title="Tale Metrics"
    >
      <SvgIcons name="stats" :size="30" />
    </button>
        <!-- Separator Line -->
    <div class="editor-studio__strip-divider"></div>

    <!-- Group 2: Utilities & Actions -->
    
      <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'help' }"
      @click="taleStore.currentMainView = 'help'"
      title="Tale Metrics"
    >
      <SvgIcons name="help" :size="30" />
    </button>

    <template v-if="taleStore.activeTale?.status == 'Created'">

       <button 
      type="button" 
      
      class="editor-studio__strip-btn editor-studio__strip-btn--danger"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'delete' }"
      @click="taleStore.currentMainView = 'delete'"
      title="Delete Tale"
    >
      <SvgIcons name="trash" :size="30"/>
    </button>

    </template>

    <template v-else>
       <button 
      type="button" 
      class="editor-studio__strip-btn"
      :class="{ 'editor-studio__strip-btn--active': taleStore.currentMainView === 'archive' }"
      @click="taleStore.currentMainView = 'archive'"
      title="Archive Tale"
    >
      <SvgIcons name="trash" :size="30"/>
    </button>
    </template>
   
    


    </div>


  </div>

  <!-- Bottom: OutScribed Logo / Home (Fixed 50px) -->
  <div class="editor-studio__strip-home">
    <button 
      type="button" 
      class="editor-studio__strip-btn"
      @click="navigateHome"
      title="Return to Home"
    >
      <img src="@/assets/images/icon.png" alt="OutScribed Icon" />

    </button>
  </div>

</template>


<style lang="less" scoped>
@import "@/assets/css/variables.less";

 /* 1. TOP MENU BLOCK (Fixed 50px) */
  .editor-studio__strip-menu {
    flex: 0 0 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-bottom: 1px solid var(--border-color);

    @media @phone{
      flex: 0 0 40px;
      height: 40px;
    }
  }


  /* 2. MIDDLE ACTIONS SCROLL CONTAINER (calc(100vh - 100px)) */
  .editor-studio__strip-actions-wrapper {
    flex: 1 1 auto;
    width: 100%;
    max-height: calc(100vh - 100px);
    max-height: calc(100lvh - 100px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content:center;
    padding: 1.5rem 0;

     @media @phone{
       max-height: calc(100vh - 80px);
       max-height: calc(100lvh - 80px);
       padding: 1rem 0;
    }

  }

   .editor-studio__strip-actions {
   
    width: 100%;
    height: auto;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;

    /* Hide scrollbars for clean aesthetic while keeping touch scroll active */
    scrollbar-width: none; /* Firefox */
    .editor-studio__strip::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Edge */
    }
  }

  /* Section Divider Line inside Middle Block */
  .editor-studio__strip-divider {
    width: 24px;
    height: 1px;
    background-color: var(--border-color);
    margin: 0.25rem 0;
    flex: 0 0 auto;
  }

  /* 3. BOTTOM HOME LOGO BLOCK (Fixed 50px) */
  .editor-studio__strip-home {
    flex: 0 0 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-top: 1px solid var(--border-color);

      @media @phone{
      flex: 0 0 40px;
      height: 40px;
    }

      .editor-studio__strip img{
        width: 30px;
        height: auto;
     }
  }

  /* Icon Button Base Styling */
  .editor-studio__strip-btn {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    //color: var(--color-text-muted, #64748b);
    //color: #94A3B8;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
   color:var(--editor-link-color);

    &:hover,
    &--active {
      background-color: var(--light-background-color);
      color: @link-color;
    }

      &--active {
      color: var(--text-color);
      pointer-events:none;
    }

    .editor-studio__strip--danger:hover {
      background-color: @danger-background-color;
      color: @danger-text-color;
    }
  }
</style>