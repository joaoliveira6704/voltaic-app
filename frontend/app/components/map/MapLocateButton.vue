<!-- components/map/MapLocateButton.vue -->
<template>
  <div class="absolute bottom-20 right-4 z-[1000]">
    <button
      :disabled="locating"
      class="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 shadow-md hover:bg-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      title="Find my location"
      @click="emit('click')"
    >
      <LocateFixed
        v-if="!locating"
        class="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-[#22c55e]"
      />
      <Loader2 v-else class="w-5 h-5 text-[#22c55e] animate-spin" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { LocateFixed, Loader2 } from "lucide-vue-next";

defineProps<{
  locating: boolean;
}>();

const emit = defineEmits<{ click: [] }>();
</script>
