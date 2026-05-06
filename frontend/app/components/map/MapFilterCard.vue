<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open && isMobile"
      class="absolute inset-0 z-[998] bg-black/30 backdrop-blur-sm"
      @click="emit('close')"
    />
  </Transition>

  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    :enter-from-class="
      isMobile ? 'translate-y-full opacity-0' : '-translate-x-4 opacity-0'
    "
    :leave-to-class="
      isMobile ? 'translate-y-full opacity-0' : '-translate-x-4 opacity-0'
    "
  >
    <div
      v-if="open"
      :class="[
        'absolute z-[999] bg-white shadow-2xl pointer-events-auto',
        isMobile
          ? 'bottom-0 left-0 right-0 rounded-t-2xl px-5 pt-4 pb-8 max-h-[70vh] overflow-y-auto'
          : 'left-4 top-1/2 -translate-y-1/2 w-80 rounded-2xl px-5 py-5 max-h-[75vh] overflow-y-auto',
      ]"
    >
      <div v-if="isMobile" class="flex justify-center mb-4">
        <div class="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-gray-900 tracking-tight">Filter</h2>
        <div class="flex items-center gap-3">
          <button
            class="text-sm font-medium text-[#22c55e] hover:text-[#16a34a] transition-colors"
            @click="emit('reset')"
          >
            Reset
          </button>
          <button
            class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            @click="emit('close')"
          >
            <X class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        v-if="selectedConnectors.length > 0"
        class="flex flex-wrap gap-2 mb-5"
      >
        <span
          v-for="c in selectedConnectors"
          :key="c"
          class="flex items-center gap-1 px-3 py-1 rounded-full bg-[#22c55e] text-white text-xs font-semibold"
        >
          {{ c }}
          <button @click="emit('toggle-connector', c)">
            <X class="w-3 h-3" />
          </button>
        </span>
      </div>

      <div class="h-px bg-gray-100 mb-5" />

      <div class="mb-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">Distance:</span>
          <span class="text-xs text-gray-400">km 0–100</span>
        </div>
        <div class="relative h-1.5 bg-gray-200 rounded-full">
          <div
            class="absolute left-0 top-0 h-full w-full bg-gray-200 rounded-full"
          />
        </div>
      </div>

      <div class="h-px bg-gray-100 mb-5" />

      <div>
        <span class="text-sm font-semibold text-gray-700 block mb-3">
          Socket type:
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="connector in allConnectors"
            :key="connector"
            :class="[
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
              selectedConnectors.includes(connector)
                ? 'bg-[#22c55e] border-[#16a34a] text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-[#22c55e] hover:text-[#22c55e]',
            ]"
            @click="emit('toggle-connector', connector)"
          >
            {{ connector }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";

defineProps<{
  open: boolean;
  isMobile: boolean;
  allConnectors: readonly string[];
  selectedConnectors: string[];
}>();

const emit = defineEmits<{
  close: [];
  reset: [];
  "toggle-connector": [connector: string];
}>();
</script>
