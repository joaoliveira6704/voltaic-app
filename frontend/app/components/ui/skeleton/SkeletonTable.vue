<script setup lang="ts">
import Skeleton from "./Skeleton.vue"

defineProps<{
  columns?: number
  rows?: number
}>()
</script>

<template>
  <div class="w-full">
    <div class="border-b border-neutral-100 dark:border-[#272727]">
      <div
        class="px-6 py-3"
        :style="{ display: 'grid', gridTemplateColumns: `repeat(${columns ?? 6}, 1fr)`, gap: '1rem' }"
      >
        <Skeleton v-for="col in columns ?? 6" :key="'h-' + col" class="h-4" />
      </div>
    </div>
    <div
      v-for="row in rows ?? 5"
      :key="'r-' + row"
      class="border-b border-neutral-50 dark:border-[#272727] last:border-0"
    >
      <div
        class="px-6 py-4"
        :style="{ display: 'grid', gridTemplateColumns: `repeat(${columns ?? 6}, 1fr)`, gap: '1rem' }"
      >
        <Skeleton v-for="col in columns ?? 6" :key="'c-' + row + '-' + col" class="h-4" />
      </div>
    </div>
  </div>
</template>
