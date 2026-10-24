<!-- components/common/CommentRichTextEditor.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import {
  createQuill,
  getQuillHTML,
  setHtml,
  destroyQuill
} from '@/utils/quillHelper'
import 'quill/dist/quill.snow.css'
import HelpIcon from '@/components/HelpIcon.vue';

const props = defineProps<{
  modelValue: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save'): void
}>()

const toolbarRef = ref<HTMLElement | null>(null)
const editorRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!editorRef.value || !toolbarRef.value) return

  // 1. Initialize Quill via helper
  createQuill(
    editorRef.value,
    toolbarRef.value,
    false,
    'Type in comment...',
    'snow'
  )

  await nextTick()

  const quillInstance = (editorRef.value as any).__quill

  // 2. Load initial content safely if present
  if (props.modelValue && editorRef.value) {
    setHtml(editorRef.value, props.modelValue)
  }

  // 3. Attach text-change listener
  if (quillInstance) {
    quillInstance.on('text-change', () => {
      if (!editorRef.value) return
      
      const rawHtml = getQuillHTML(editorRef.value)
      const cleanHtml = rawHtml === '<p><br></p>' ? '' : rawHtml

      emit('update:modelValue', cleanHtml)
    })
  }
})

// 4. Watch modelValue for async loads / updates (e.g. editing an existing comment)
watch(
  () => props.modelValue,
  (newVal) => {
    if (!editorRef.value) return

    const currentHtml = getQuillHTML(editorRef.value)
    const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml
    const normalizedNew = newVal || ''

    // Prevent cursor jumping by updating only when values truly differ
    if (normalizedNew !== normalizedCurrent) {
      setHtml(editorRef.value, normalizedNew)
    }
  }
)

onBeforeUnmount(() => {
  if (editorRef.value) {
    destroyQuill(editorRef.value)
  }
})

</script>
<template>
  <div class="comment-editor-container">
    <!-- STUCK TOOLBAR + INLINE SAVE HEADER -->
    <div class="comment-editor-toolbar-header">
      <button
        type="button"
        class="btn btn--primary"
        :disabled="isSubmitting"
        @click="emit('save')"
      >
        {{ isSubmitting ? 'Saving...' : 'Save' }}
      </button>

      <div ref="toolbarRef" class="ql-toolbar ql-snow custom-toolbar">
        <span class="ql-formats">
          <button class="ql-bold" title="Bold"></button>
          <button class="ql-italic" title="Italic"></button>
          <button class="ql-underline" title="Underline"></button>
          <button class="ql-strike" title="Strikethrough"></button>
        </span>

        <span class="ql-formats">
          <button class="ql-list" value="ordered" title="Numbered List"></button>
          <button class="ql-list" value="bullet" title="Bullet List"></button>
        </span>

        <span class="ql-formats">
          <button class="ql-link" title="Insert Link"></button>
        </span>

        <!-- Grouped inside ql-formats for consistent toolbar layout -->
        <span class="ql-formats">
          <HelpIcon topic="CreateComment" :use-icon="true" />
        </span>
      </div>
    </div>

    <!-- SCROLLABLE EDITOR CANVAS -->
    <div class="comment-editor-body">
      <div ref="editorRef" class="ql-editor-container"></div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import 'quill/dist/quill.core.css';
@import 'quill/dist/quill.snow.css';
@import "@/assets/css/variables.less";

.comment-editor-container {
  display: flex;
  flex-direction: column;
  //border: 1px solid var(--border-color);
  //border-radius: 6px;
  background-color: var(--background-color);
  overflow: hidden;

  .comment-editor-toolbar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--border-color);
   background-color: var(--background-color);
    position: sticky;
    top: 0;
    z-index: 5;

    .custom-toolbar {
      border: none !important;
      padding: 0 !important;
      background: transparent !important;
    }
    
  .submit-btn{
    color: var(--muted-link-color);
    text-transform: uppercase;
    font-weight: 600;

    &.submitting,
    &:hover{
        
        color: @link-color;
    }

  }


  }

  .comment-editor-body {
    min-height: 140px;
    max-height: 260px;
    overflow-y: auto;

    :deep(.ql-container.ql-snow) {
      border: none !important;
        font-family: @font-family;
        font-size: 1rem;
        color: var(--muted-text-color);
    }

    
    :deep(.ql-editor) {
      min-height: 140px;
      padding: 0.75rem 0;
      color: var(--text-color);

      &.ql-blank::before {
        font-style: normal;
        left: 0;
        font-size: 1rem;
        color: var(--muted-text-color);
        font-style: italic;
      }

     
    }
  }
}
</style>