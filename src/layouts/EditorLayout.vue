<script setup lang="ts">
import { watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue'

import EditorAsideComponent from '@/features/tales/components/EditorAsideComponent.vue';
import EditorMainCanvas from '@/features/tales/components/EditorMainCanvas.vue';
import EditorStripComponent from '@/features/tales/components/EditorStripComponent.vue';
import MetricsModal from '@/features/tales/modals/MetricsModal.vue';
import PostUpdateModal from '@/features/tales/modals/PostUpdateModal.vue';
import ProblemDefinitionModal from '@/features/tales/modals/ProblemDefinitionModal.vue';
import { useTaleDraftStore } from '@/features/tales/stores/TaleDraftStore'; 

const taleStore = useTaleDraftStore()

let scrollY = 0;

function updateScrollLock() {
  const isMobile = window.matchMedia('(max-width: 991px)').matches;
  const isOpen = taleStore.isAsideOpen;

  if (isOpen && isMobile) {
    // If open and on mobile, ensure the lock is applied
    if (document.body.style.position !== 'fixed') {
      scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
  } else {
    // If closed OR resized to desktop, remove the lock
    if (document.body.style.position === 'fixed') {
      document.body.style.position = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }
  }
}

onBeforeUnmount(() => {
  // Remove the resize listener immediately
  window.removeEventListener('resize', updateScrollLock);

  // Force-unlock the body the second the component starts unmounting
  if (document.body.style.position === 'fixed') {
    document.body.style.position = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  }
  
  // Optional: auto-close the aside state in the store so it's fresh if they return
  taleStore.isAsideOpen = false;
});

// 1. Watch for menu open/close changes
watch(() => taleStore.isAsideOpen, updateScrollLock);

// 2. Watch for screen resizing/rotation dynamically
onMounted(() => {
  window.addEventListener('resize', updateScrollLock);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollLock);
});

</script>

<template>

  <div class="editor-workspace-wrapper">

<div class="editor-layout" :class="{ 'editor-layout--aside-hidden': taleStore.isAsideOpen  }">

    <!-- In-Layout Modal -->
    <ProblemDefinitionModal />
    <PostUpdateModal />
    <MetricsModal />

      <!-- 1. ASIDE: Disabled during init (or handles its own loading list) -->
      <aside 
        class="editor-layout__aside"
       
      >
        <EditorAsideComponent />
      </aside>

      <!-- 2. CANVAS CONTAINER -->
      <div class="editor-layout__canvas-container">
        
        <!-- 3. ACTION STRIP: Disabled during init -->
        <nav 
          class="editor-layout__strip"
       
        
        >
          <EditorStripComponent />
      </nav>

        <!-- 4. MAIN CANVASES: ACTIVE & UNLOCKED so loaders/error actions work -->
        <main class="editor-layout__canvas">
          <EditorMainCanvas />
        </main>

      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";

/* Centered Max-Width Outer Frame */
.editor-workspace-wrapper {
  width: 100%;
  max-width: @max-width;
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
  background-color: var(--background-color);

  /* 1. Prevent horizontal content overflow from being panned */
  //overflow-x: hidden; 
  
  /* 2. Restrict mobile touch gestures to vertical scrolling only, blocking horizontal swipe-panning */
  touch-action: pan-y;

}

.editor-layout {
  display: flex;
  position: relative;
  width: 100%;
  min-height: 100vh;

  /* Ensure container bounds are strictly locked horizontally */
  //overflow-x: hidden;
  touch-action: pan-y;

  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;   /* key: stop scroll chaining */
  overscroll-behavior-y: contain;
  
  /* -------------------------------------------------------------
   * 1. ASIDE PANEL (Fixed relative to max-width wrapper)
   * ------------------------------------------------------------- */

  &__aside {
    position: fixed;
    top: 0;
    
    /* Aligns to the left edge of the centered 1300px wrapper */
    left: max(0px, calc((100% - @max-width) / 2));
   padding-bottom: 5rem;

   @media @phone, @phablet, @tablet {
       height: 100lvh;
 // Pushes standard document flow down cleanly
  }

  @media @laptop, @desktop {
    border-left: 1px solid var(--border-color);
   height: 100vh;// Pushes standard document flow down cleanly
  }
   
    z-index: 1;
    //border-right: 1px solid var(--border-color);
    background-color: var(--background-color);
    overflow-y: auto;

    @media @phone, @phablet, @tablet{
      width: 100%;
      
    }

      @media @laptop, @desktop{
      width: 380px;
    }

    -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;   /* key: stop scroll chaining */
  overscroll-behavior-y: contain;
    
  }

  /* -------------------------------------------------------------
   * 2. CANVAS CONTAINER (Slides smoothly over Aside)
   * ------------------------------------------------------------- */
  &__canvas-container {
    display: flex;
    flex: 1 1 auto;
    position: relative;
    margin-left: 380px; /* Leaves space for Fixed Aside when open */
    //min-height: 100vh;
    //min-height: 100svh;
    z-index: 2;
    background-color: var(--background-color);
    //box-shadow: var(--sidebar-box-shadow);
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);

   @media @phone, @phablet, @tablet {
    min-height: 100svh;
  }

   @media @laptop, @desktop {
    border-right: 1px solid var(--border-color);
    min-height: 100vh;
  }
    
  }

  /* -------------------------------------------------------------
   * 3. ACTION STRIP (Sticky to Viewport Top)
   * ------------------------------------------------------------- */
  &__strip {
    //flex: 0 0 50px;
    width: 50px;
    position: fixed;
      border-left: 1px solid var(--border-color);
    //top: @body-top-offset;
     border-right: 1px solid var(--border-color);

      @media @phone{
      //flex: 0 0 40px;
      width: 40px;
    }
    
  @media @phone, @phablet, @tablet {
    height: 100lvh;
  }

  @media @laptop, @desktop {
    height: 100vh;
  }
    
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;   /* key: stop scroll chaining */
  overscroll-behavior-y: contain;
    
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--background-color);
    

  }

  /* -------------------------------------------------------------
   * 4. MAIN PROSE CANVAS (Natural Document Height)
   * ------------------------------------------------------------- */
  &__canvas {
    //flex: 1 1 auto;
    width: calc(100% - 50px);
    max-width: calc(100% - 50px);
    min-width: 0;
    height:auto;
    background-color: var(--background-color);
    margin-left: 50px;
    
    position:relative;
    //padding-top: @body-top-offset;

      @media @phone{
      width: calc(100% - 40px);
      margin-left: 40px;
      }
    
  }

  /* =============================================================
   * COLLAPSED STATE (Canvas + Strip expand to full width)
   * ============================================================= */
  &--aside-hidden {
    .editor-layout__canvas-container {
      margin-left: 0; /* Slides smoothly over the Fixed Aside */
    }
    
  /* Responsive Adjustments */
  @media @phablet, @tablet {
    .editor-layout__canvas-container {
      margin-left: calc(100% - 50px);
    }
  }

   @media @phone {
    .editor-layout__canvas-container {
      margin-left: calc(100% - 40px);
    }
  }

  }

  /* Responsive Adjustments */
  @media @phablet, @tablet {
    &__aside {
      left: 0;
      width: calc(100% - 50px);
      
    }

    &__canvas-container {
      margin-left: 0;
    }
  }

    @media @phone{
        &__aside {
      left: 0;
      width: calc(100% - 40px);
      
    }
     &__canvas-container {
      margin-left: 0;
    }
      }
}
</style>