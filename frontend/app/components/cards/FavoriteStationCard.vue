<script setup lang="ts">
import { Star, MapPin } from "lucide-vue-next";
import { CONNECTOR_LABELS } from "@/constants/connectors";
import type { Station } from "@/types/station";

interface Props {
  station: Station;
}

const props = defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();

const { t } = useI18n();

const stateLabel = computed(() => {
  switch (props.station.state) {
    case "available":
      return "Available";
    case "unavailable":
      return "Unavailable";
    case "maintenance":
      return "Maintenance";
    default:
      return "Unknown";
  }
});

const stateDotClass = computed(() => {
  switch (props.station.state) {
    case "available":
      return "bg-green-500";
    case "unavailable":
      return "bg-red-500";
    case "maintenance":
      return "bg-orange-500";
    default:
      return "bg-gray-400";
  }
});
</script>

<template>
  <div class="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#232323] rounded-xl p-5 flex flex-col gap-3 transition-all duration-300">
    <div class="flex items-start justify-between gap-2">
      <h3 class="text-sm font-bold text-gray-900 dark:text-white/80 truncate flex-1">
        {{ station.title }}
      </h3>
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
        :class="{
          'bg-green-50 text-green-700': station.state === 'available',
          'bg-red-50 text-red-700': station.state === 'unavailable',
          'bg-orange-50 text-orange-700': station.state === 'maintenance',
          'bg-gray-50 text-gray-600': !['available', 'unavailable', 'maintenance'].includes(station.state),
        }"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="stateDotClass" />
        {{ stateLabel }}
      </span>
    </div>

    <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40">
      <MapPin class="w-3.5 h-3.5 shrink-0" />
      <span class="truncate">{{ station.location.coordinates.join(", ") }}</span>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="type in station.connector.socketTypes"
        :key="type"
        class="px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 border-gray-200 text-gray-600 dark:bg-[#0a0a0a] dark:border-[#2a2a2a] dark:text-white/60"
      >
        {{ CONNECTOR_LABELS[type] ?? type }}
      </span>
    </div>

    <div class="text-xs font-semibold text-gray-800 dark:text-white/60">
      {{ station.connector.maxPower }} kW
    </div>

    <button
      class="flex items-center justify-center gap-1.5 w-full mt-1 px-3 py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
      @click="emit('remove')"
    >
      <Star class="w-3.5 h-3.5" />
      Remove from favorites
    </button>
  </div>
</template>
