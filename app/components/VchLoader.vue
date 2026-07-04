<template>
  <div class="vch-loader" role="status" :aria-label="label || 'Loading'">
    <img
      src="/vch-tank-loader.svg"
      class="vch-loader-img"
      :style="{ width: `${width}px` }"
      alt=""
      aria-hidden="true"
    >
    <p v-if="label" class="vch-loader-label">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
// The SVG already includes its own LOADING... text; pass a label only when
// you want extra context (e.g. "Saving entry...").
withDefaults(defineProps<{
  label?: string
  width?: number
}>(), {
  label: '',
  width: 240
})
</script>

<style scoped>
.vch-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.vch-loader-img {
  height: auto;
  max-width: 100%;
}

.vch-loader-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94a3b8;
  animation: vch-loader-pulse 1.6s ease-in-out infinite;
}

@keyframes vch-loader-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
</style>
