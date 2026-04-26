<script setup lang="ts">
/**
 * DashboardGrid - Senior Implementation
 * Horizontal: Cell A (20%), Right Column (80%)
 * Vertical: B (25%), C (25%), D (50%)
 */
interface Props {
  gap?: string;
}

withDefaults(defineProps<Props>(), {
  gap: "gap-4",
});
</script>

<template>
  <div
    :class="[
      'grid w-full h-full p-20',
      'grid-cols-1 lg:grid-cols-[1fr_4fr]',
      'lg:grid-rows-[1fr_1fr_2fr]',
      gap,
    ]"
  >
    <div class="lg:col-start-1 lg:row-span-3 min-h-0">
      <slot name="cell-a" />
    </div>

    <div class="lg:col-start-2 lg:row-start-1 min-h-0">
      <slot name="cell-b" />
    </div>

    <div class="lg:col-start-2 lg:row-start-2 min-h-0">
      <slot name="cell-c" />
    </div>

    <div class="lg:col-start-2 lg:row-start-3 min-h-0">
      <slot name="cell-d" />
    </div>
  </div>
</template>
