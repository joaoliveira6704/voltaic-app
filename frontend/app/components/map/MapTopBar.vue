<template>
  <div
    class="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3 pointer-events-none"
  >
    <div class="flex items-center gap-2 pointer-events-auto">
      <button
        v-for="filter in filters"
        :key="filter.key"
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-md backdrop-blur-sm border',
          filter.active
            ? 'bg-[#22c55e] border-[#16a34a] text-white shadow-[#22c55e]/30'
            : 'bg-white/90 border-white/60 text-gray-600 hover:bg-white',
        ]"
        @click="emit('toggle-filter', filter.key)"
      >
        <component :is="filter.icon" class="w-3.5 h-3.5" />
        {{ filter.label }}
      </button>

      <button
        :class="[
          'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 shadow-md backdrop-blur-sm border',
          sidebarOpen
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white/90 border-white/60 text-gray-600 hover:bg-white',
        ]"
        @click="emit('toggle-sidebar')"
      >
        <SlidersHorizontal class="w-4 h-4" />
      </button>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-150 ease-in"
        enter-from-class="scale-75 opacity-0"
        leave-to-class="scale-75 opacity-0"
      >
        <button
          v-if="selectedConnectorsCount > 0"
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-500 border border-red-400 text-white text-xs font-semibold shadow-md transition-all duration-200 hover:bg-red-600"
          @click="emit('clear-connectors')"
        >
          <X class="w-3 h-3" />
          {{ selectedConnectorsCount }}
        </button>
      </Transition>
    </div>

    <div class="pointer-events-auto">
      <NuxtLink
        to="/profile"
        class="flex items-center justify-center w-9 h-9 rounded-full bg-[#22c55e] text-white font-bold text-sm shadow-md hover:bg-[#16a34a] transition-colors duration-200 uppercase"
      >
        {{ userInitial }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { SlidersHorizontal, X } from "lucide-vue-next";
import { useUserStore } from "@/stores/user";
import type { MapFilter, MapFilterKey } from "@/types/mapFilter";

defineProps<{
  filters: MapFilter[];
  sidebarOpen: boolean;
  selectedConnectorsCount: number;
}>();

const emit = defineEmits<{
  "toggle-filter": [key: MapFilterKey];
  "toggle-sidebar": [];
  "clear-connectors": [];
}>();

const userStore = useUserStore();
const userInitial = computed(() =>
  (userStore.currentUser?.firstName || userStore.currentUser?.username || "?")
    .charAt(0)
    .toUpperCase(),
);
</script>
