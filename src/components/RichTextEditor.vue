<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createQuill, destroyQuill, getQuillHTML, setHtml } from '@/utils/quillHelper'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLDivElement | null>(null)
const toolbarRef = ref<HTMLDivElement | null>(null)
let isInternalChange = false

onMounted(() => {
  if (editorRef.value && toolbarRef.value) {
    createQuill(
      editorRef.value,
      toolbarRef.value,
      false,
      "Type in details here...",
      "snow"
    )

    setHtml(editorRef.value, props.modelValue || '')

    const quillInstance = (editorRef.value as any).__quill
    if (quillInstance) {
      quillInstance.on('text-change', () => {
        isInternalChange = true
        emit('update:modelValue', getQuillHTML(editorRef.value!))
      })
    }
  }
})

watch(() => props.modelValue, (newValue) => {
  if (isInternalChange) {
    isInternalChange = false
    return
  }
  if (editorRef.value) {
    setHtml(editorRef.value, newValue || '')
  }
})

onBeforeUnmount(() => {
  if (editorRef.value) {
    destroyQuill(editorRef.value)
  }
})
</script>

<template>

  <div class="form-editor">
    
    <!-- Quill Toolbar renders directly inside component -->
    <div ref="toolbarRef" class="ql-toolbar ql-snow">
      <span class="ql-formats">
        <button class="ql-header" value="1"></button>
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <button class="ql-strike"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered"></button>
        <button class="ql-list" value="bullet"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-link"></button>
      </span>
    </div>

    <!-- Editor Canvas -->
    <div ref="editorRef" class="ql-editor-container"></div>
  </div>
</template>

<style scoped>
@import 'quill/dist/quill.core.css';
@import 'quill/dist/quill.snow.css';
@import "@/assets/css/form-editor.less";
</style>