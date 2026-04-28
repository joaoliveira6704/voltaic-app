<script setup lang="ts">
interface Props {
  gap?: string;
  splitCellD?: boolean; // New prop to trigger the split
}

withDefaults(defineProps<Props>(), {
  gap: "gap-4",
  splitCellD: false,
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

    <div
      :class="[
        'lg:col-start-2 lg:row-start-3 min-h-0',
        splitCellD ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : '',
      ]"
    >
      <template v-if="splitCellD">
        <div class="min-h-0">
          <slot name="cell-d-left" />
        </div>
        <div class="min-h-0">
          <slot name="cell-d-right" />
        </div>
      </template>
      <template v-else>
        <slot name="cell-d" />
      </template>
    </div>
  </div>
</template>
