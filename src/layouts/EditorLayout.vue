<script setup lang="ts">
import EditorAsideComponent from '@/features/tales/components/EditorAsideComponent.vue';
import EditorMainCanvas from '@/features/tales/components/EditorMainCanvas.vue';
import EditorStripComponent from '@/features/tales/components/EditorStripComponent.vue';
import MetricsModal from '@/features/tales/modals/MetricsModal.vue';
import PostUpdateModal from '@/features/tales/modals/PostUpdateModal.vue';
import ProblemDefinitionModal from '@/features/tales/modals/ProblemDefinitionModal.vue';
import { useTaleDraftStore } from '@/features/tales/stores/TaleDraftStore'; 

const taleStore = useTaleDraftStore()
</script>
<template>

  <div class="editor-workspace-wrapper">

    <div class="editor-layout" :class="{ 'editor-layout--aside-collapsed': taleStore.isAsideCollapsed }">
      
    <!-- In-Layout Modal -->
    <ProblemDefinitionModal />
    <PostUpdateModal />
    <MetricsModal />

      <!-- 1. ASIDE: Disabled during init (or handles its own loading list) -->
      <aside 
        class="editor-layout__aside"
        :class="{ 'is-disabled': taleStore.isInitializing }"
        :inert="taleStore.isInitializing"
      >
        <EditorAsideComponent />
      </aside>

      <!-- 2. CANVAS CONTAINER -->
      <div class="editor-layout__canvas-container">
        
        <!-- 3. ACTION STRIP: Disabled during init -->
        <aside 
          class="editor-layout__strip"
          :class="{ 'is-disabled': taleStore.isInitializing }"
          :inert="taleStore.isInitializing"
        >
          <EditorStripComponent />
        </aside>

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
}

.editor-layout {
  display: flex;
  position: relative;
  width: 100%;
  min-height: 100vh;
  

  /* -------------------------------------------------------------
   * 1. ASIDE PANEL (Fixed relative to max-width wrapper)
   * ------------------------------------------------------------- */
  &__aside {
    position: fixed;
    //top: @body-top-offset;
    
  @media @smallDevice {
    top: @body-top-offset-small; // Pushes standard document flow down cleanly
  }

  @media @largeDevice {
    top: @body-top-offset-large; // Pushes standard document flow down cleanly
  }
    /* Aligns to the left edge of the centered 1300px wrapper */
    left: max(0px, calc((100vw - @max-width) / 2));
   padding-bottom: 5rem;

   @media @smallDevice {
       height: calc(100lvh - @body-top-offset-small);
 // Pushes standard document flow down cleanly
  }

  @media @largeDevice {
   height: calc(100vh - @body-top-offset-large);// Pushes standard document flow down cleanly
  }
   
    z-index: 1;
    border-right: 1px solid var(--border-color);
    background-color: var(--background-color);
    overflow-y: auto;

    @media @smallDevice{
      width: 100%;
      
    }

     @media @largeDevice{
      width: 380px;
    }

      &.is-disabled {
      pointer-events: none; /* Prevents all clicks, hovers, and focus events */
      user-select: none;    /* Prevents highlighting text inside */
      opacity: 0.5;         /* Visually dims the whole panel */
      filter: grayscale(20%);
      cursor: not-allowed;
    }
  }

  /* -------------------------------------------------------------
   * 2. CANVAS CONTAINER (Slides smoothly over Aside)
   * ------------------------------------------------------------- */
  &__canvas-container {
    display: flex;
    flex: 1 1 auto;
    position: relative;
    margin-left: 380px; /* Leaves space for Fixed Aside when open */
    min-height: 100vh;
    min-height: 100lvh;
    z-index: 2;
    background-color: var(--background-color);
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.04);
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* -------------------------------------------------------------
   * 3. ACTION STRIP (Sticky to Viewport Top)
   * ------------------------------------------------------------- */
  &__strip {
    flex: 0 0 50px;
    width: 50px;
    position: sticky;
    //top: @body-top-offset;

      @media @phone{
      flex: 0 0 40px;
      width: 40px;
    }
    
  @media @smallDevice {
    top: @body-top-offset-small; // Pushes standard document flow down cleanly
    height: calc(100vh - @body-top-offset-small);
  }

  @media @largeDevice {
    top: @body-top-offset-large; // Pushes standard document flow down cleanly
    height: calc(100lvh - @body-top-offset-large);
  }
    
    
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--background-color);
    border-right: 1px solid var(--border-color);

    &.is-disabled {
      pointer-events: none; /* Prevents all clicks, hovers, and focus events */
      user-select: none;    /* Prevents highlighting text inside */
      opacity: 0.5;         /* Visually dims the whole panel */
      filter: grayscale(20%);
      cursor: not-allowed;
    }
  }

  /* -------------------------------------------------------------
   * 4. MAIN PROSE CANVAS (Natural Document Height)
   * ------------------------------------------------------------- */
  &__canvas {
    flex: 1 1 auto;
    min-width: 0;
    max-width: calc(100vw - 50px);
    height:auto;
    background-color: var(--background-color);
    position:relative;
    //padding-top: @body-top-offset;

      @media @phone{
      max-width: calc(100vw - 40px);
      }
    
  @media @smallDevice {
    padding-top: @body-top-offset-small; // Pushes standard document flow down cleanly
  }

  @media @largeDevice {
    padding-top: @body-top-offset-large; // Pushes standard document flow down cleanly
  }
  }

  /* =============================================================
   * COLLAPSED STATE (Canvas + Strip expand to full width)
   * ============================================================= */
  &--aside-collapsed {
    .editor-layout__canvas-container {
      margin-left: 0; /* Slides smoothly over the Fixed Aside */
    }
    
  /* Responsive Adjustments */
  @media @phablet, @tablet {
   

    .editor-layout__canvas-container {
      margin-left: calc(100vw - 50px);
      
         
    }
  }

   @media @phone {
   

    .editor-layout__canvas-container {
      margin-left: calc(100vw - 40px);
      
         
    }
  }

  }

  /* Responsive Adjustments */
  @media @phablet, @tablet {
    &__aside {
      left: 0;
      width: calc(100vw - 50px);
      
    }

    &__canvas-container {
      margin-left: 0;
    }
  }

    @media @phone{
        &__aside {
      left: 0;
      width: calc(100vw - 40px);
      
    }
     &__canvas-container {
      margin-left: 0;
    }
      }
}
</style>