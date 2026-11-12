<script setup lang="ts">
import ModalContainer from '@/components/ModalContainer.vue'

import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useModalStore } from '@/stores/modalStore'
import SvgIcons from '@/components/SvgIcons.vue'

const route = useRoute()
const modalStore = useModalStore()

watch(() => route.path, () => modalStore.closeAll())

</script>

<template>
 
  <ModalContainer />
  
  <div class="form-page">

    <main class="form-layout">

      <RouterView />
      <!-- Footer -->
     
    </main>
    
   <footer class="form-footer">
       <div class="footer-brand">
          <router-link to="/" class="main-header__brand-link" title="OutScribed Home">
            <SvgIcons name="logo" class="brand-logo" :size="25" />
          </router-link>
      </div>
      <div class="footer-links">
        <a href="/terms">Terms of Use</a>
        <a href="/privacy">Privacy</a>
        <a href="/disclaimers">Disclaimers</a>
      </div>
      <div class="footer-copyright">
      Copyright@2026 All. Rights Reserved.
      </div>
    </footer>
  </div>

</template>

<style lang="less" scoped>
@import "@/assets/css/variables.less";


.form-page {
    height: auto;
    min-height: 100lvh;
    background-color: var(--background-color);
    width: 100%;
    position: relative;
    z-index: 999;
    padding-bottom: 4rem;


    @media @smallDevice {
        padding-top: 2rem;
    }

    @media @largeDevice {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        row-gap: 1rem;
        padding-top: 2rem;
    }

    & .icon{
        display: flex;
        justify-content:center;
        padding: 2rem 0;

        & img{

            width: 45px;
            height: auto;
        }
    }

    & .form-footer {
    display: flex;
    justify-content: center;
    align-items: center;
     flex-direction: column;
        row-gap: 0.25rem;
    font-size: 0.875rem;
    //color: #718096;
    margin-top: 1.25rem;

    
    & svg {
        fill: var(--text-color);
        width: auto;
 height: 20px;
     
    }

    .footer-links {
        display: flex;
        justify-content: space-between;
        column-gap: 1.25rem;
        a {
        color: inherit;
        text-decoration: underline;

        &:hover { text-decoration: none; }
        }
    }

    .footer-copyright{
      font-size: 0.85rem;
    }
    }
}


    main.form-layout {
        width: @min-width;
        height: auto;
        margin: 0 auto;
        max-width: calc(100% - 20px);
        background: var(--background-color);
        border-radius: 21px;
        padding: 2.5rem 1rem;
        box-shadow: var(--box-shadow);
        border:1px solid var(--border-color);
        position:relative;
        z-index:100;

          @media @phone {
            padding: 1rem 0.5rem;
            border:none;
            box-shadow: none;
            border-radius:0;
        }

    }

</style>