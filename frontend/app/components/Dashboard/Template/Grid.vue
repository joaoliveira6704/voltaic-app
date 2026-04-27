<script setup lang="ts">
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
      'grid w-full h-fit p-5 lg:p-15',
      'grid-cols-1 lg:grid-cols-[1fr_4fr]',
      'lg:grid-rows-[auto_auto_auto]',
      'h-fit',
      gap,
    ]"
  >
    <div class="hidden lg:block lg:col-start-1 lg:row-span-3 min-h-0">
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
