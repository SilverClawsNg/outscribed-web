<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  imageSource: string | null
  targetWidth: number  // e.g., 250 for profiles, 750 for tales/insights
  targetHeight: number // e.g., 250 for profiles, 562 for tales/insights
  aspectRatioLabel?: string
}>()

const emit = defineEmits<{
  (e: 'cropComplete', result: { base64String: string; contentType: string; dataUrl: string }): void
  (e: 'cancel'): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const scale = ref(1)
const minScale = ref(1)
const maxScale = ref(3)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const startTouch = ref<{ x: number; y: number }>({ x: 0, y: 0 })

let imgElement: HTMLImageElement | null = null

// Load source image into memory
watch(
  () => props.imageSource,
  (newSource) => {
    if (!newSource) return
    imgElement = new Image()
    imgElement.crossOrigin = 'anonymous'
    imgElement.src = newSource
    imgElement.onload = () => {
      initCanvasDimensions()
      drawCanvas()
    }
  },
  { immediate: true }
)

function initCanvasDimensions() {
  if (!imgElement || !canvasRef.value) return

  // Calculate minimum scale to cover the canvas target box completely
  const scaleX = props.targetWidth / imgElement.width
  const scaleY = props.targetHeight / imgElement.height
  const initialScale = Math.max(scaleX, scaleY)

  minScale.value = initialScale
  maxScale.value = initialScale * 3.5
  scale.value = initialScale

  // Center image inside the cropping frame
  panX.value = (props.targetWidth - imgElement.width * initialScale) / 2
  panY.value = (props.targetHeight - imgElement.height * initialScale) / 2
}

function clampPan() {
  if (!imgElement) return
  const currentWidth = imgElement.width * scale.value
  const currentHeight = imgElement.height * scale.value

  const minX = props.targetWidth - currentWidth
  const minY = props.targetHeight - currentHeight

  panX.value = Math.min(0, Math.max(minX, panX.value))
  panY.value = Math.min(0, Math.max(minY, panY.value))
}

function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !imgElement) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.drawImage(
    imgElement,
    panX.value,
    panY.value,
    imgElement.width * scale.value,
    imgElement.height * scale.value
  )
  ctx.restore()
}

// Interactive Panning Controls (Touch + Mouse)
function startPan(clientX: number, clientY: number) {
  isDragging.value = true
  startTouch.value = { x: clientX - panX.value, y: clientY - panY.value }
}

function movePan(clientX: number, clientY: number) {
  if (!isDragging.value) return
  panX.value = clientX - startTouch.value.x
  panY.value = clientY - startTouch.value.y
  clampPan()
  drawCanvas()
}

function endPan() {
  isDragging.value = false
}

function onZoomChange(e: Event) {
  scale.value = parseFloat((e.target as HTMLInputElement).value)
  clampPan()
  drawCanvas()
}

function confirmCrop() {
  const canvas = canvasRef.value
  if (!canvas) return

  // Export as compressed WebP or standard JPEG at 88% quality
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
  const base64String = dataUrl.split(',')[1] ?? ''

  emit('cropComplete', {
    base64String,
    contentType: 'image/jpeg',
    dataUrl
  })
}

function handleTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  startPan(touch.clientX, touch.clientY)
}

function handleTouchMove(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  movePan(touch.clientX, touch.clientY)
}

</script>
<template>
  <div class="cropper-backdrop">
    <div class="cropper-modal">
      <div class="cropper-header">
        <h3>Adjust & Crop Image</h3>
        <p v-if="aspectRatioLabel" class="subtext">{{ aspectRatioLabel }}</p>
      </div>

      <!-- Fluid display wrapper -->
      <div
        class="canvas-viewport"
        :style="{ '--aspect-ratio': `${targetWidth} / ${targetHeight}` }"
        @mousedown="startPan($event.clientX, $event.clientY)"
        @mousemove="movePan($event.clientX, $event.clientY)"
        @mouseup="endPan"
        @mouseleave="endPan"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend="endPan"
      >
        <canvas
          ref="canvasRef"
          :width="targetWidth"
          :height="targetHeight"
        ></canvas>
      </div>

      <div class="cropper-controls">
        <label for="zoom">Zoom</label>
        <input
          id="zoom"
          type="range"
          :min="minScale"
          :max="maxScale"
          :step="(maxScale - minScale) / 100"
          :value="scale"
          @input="onZoomChange"
        />
      </div>

      <div class="cropper-actions">
        <button type="button" class="btn btn--tertiary" @click="emit('cancel')">Cancel</button>
        <button type="button" class="btn btn--secondary" @click="confirmCrop">Apply & Save</button>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
   @import "@/assets/css/image-cropper.less";
</style>