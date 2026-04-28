<script setup lang="ts">
/**
 * HorizontalScroll - Scalable Wrapper
 * Use this to wrap any list of cards (Vehicles, Tickets, etc.)
 */
interface Props {
  scrollbar?: boolean;
}

withDefaults(defineProps<Props>(), {
  scrollbar: false,
});
</script>

<template>
  <div class="w-full">
    <div
      :class="[
        'flex w-full gap-4 overflow-x-auto pb-4 snap-x snap-mandatory',
        !scrollbar ? 'no-scrollbar' : '',
      ]"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Optional: Hide scrollbar but keep functionality */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
