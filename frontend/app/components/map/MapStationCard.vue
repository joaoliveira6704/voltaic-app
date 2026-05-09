<!-- components/map/MapStationCard.vue -->
<template>
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
      v-if="station"
      :class="[
        'absolute z-[999] bg-white shadow-2xl pointer-events-auto',
        isMobile
          ? 'bottom-0 left-0 right-0 rounded-t-2xl px-5 pt-4 pb-8'
          : 'left-4 top-1/2 -translate-y-1/2 w-80 rounded-2xl px-5 py-5',
      ]"
    >
      <!-- Handle bar (mobile only) -->
      <div v-if="isMobile" class="flex justify-center mb-4">
        <div class="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-base font-bold text-gray-900 tracking-tight truncate">
            {{ station.title }}
          </h2>
          <!-- State badge -->
          <span
            :class="[
              'inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
              stateBadgeClass,
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="stateDotClass" />
            {{ stateLabel }}
          </span>
        </div>

        <!-- Close button -->
        <button
          class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ml-2 shrink-0"
          @click="emit('close')"
        >
          <X class="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div class="h-px bg-gray-100 mb-4" />

      <!-- Connectors -->
      <div class="mb-4">
        <span
          class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2"
        >
          Connectors
        </span>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="type in displayedConnectors"
            :key="type"
            :class="[
              'px-2.5 py-1 rounded-full text-xs font-medium border',
              isCompatibleConnector(type)
                ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#16a34a]'
                : 'bg-gray-50 border-gray-200 text-gray-600',
            ]"
          >
            {{ type }}
          </span>
          <span
            v-if="station.connector.socketTypes.length > 3"
            class="px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 border-gray-200 text-gray-400"
          >
            +{{ station.connector.socketTypes.length - 3 }}
          </span>
        </div>
      </div>

      <!-- Max power -->
      <div class="mb-4">
        <span
          class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1"
        >
          Max Power
        </span>
        <span class="text-sm font-semibold text-gray-800">
          {{ station.connector.maxPower }} kW
        </span>
      </div>

      <div class="h-px bg-gray-100 mb-4" />

      <!-- Footer: compatible icon + favorite button -->
      <div class="flex items-center justify-between">
        <!-- Compatible indicator -->
        <div class="flex items-center gap-1.5">
          <Zap
            :class="[
              'w-4 h-4',
              isCompatible ? 'text-[#22c55e]' : 'text-gray-300',
            ]"
          />
          <span
            :class="[
              'text-xs font-medium',
              isCompatible ? 'text-[#22c55e]' : 'text-gray-400',
            ]"
          >
            {{ isCompatible ? "Compatible" : "Not compatible" }}
          </span>
        </div>

        <!-- Favorite button -->
        <button
          :disabled="favLoading"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
            isFavorite
              ? 'bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100'
              : 'bg-white border-gray-200 text-gray-600 hover:border-yellow-300 hover:text-yellow-600',
            favLoading && 'opacity-50 cursor-not-allowed',
          ]"
          @click="toggleFavorite"
        >
          <Star
            :class="[
              'w-3.5 h-3.5',
              isFavorite ? 'fill-yellow-400 text-yellow-400' : '',
            ]"
          />
          {{ isFavorite ? "Saved" : "Save" }}
        </button>
      </div>
    </div>
  </Transition>

  <!-- Mobile backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="station && isMobile"
      class="absolute inset-0 z-[998] bg-black/30 backdrop-blur-sm"
      @click="emit('close')"
    />
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { X, Zap, Star } from "lucide-vue-next";
import { useUserStore } from "@/stores/user.ts";
import type { Station } from "@/types/station";

const props = defineProps<{
  station: Station | null;
  isMobile: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const userStore = useUserStore();
const favLoading = ref(false);

// ── State ─────────────────────────────────────────────────────────────────────

const stateBadgeClass = computed(() => {
  switch (props.station?.state) {
    case "available":
      return "bg-green-50 text-green-700";
    case "unavailable":
      return "bg-red-50 text-red-700";
    case "maintenance":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-gray-50 text-gray-600";
  }
});

const stateDotClass = computed(() => {
  switch (props.station?.state) {
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

const stateLabel = computed(() => {
  switch (props.station?.state) {
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

// ── Connectors ────────────────────────────────────────────────────────────────

const displayedConnectors = computed(
  () => props.station?.connector.socketTypes.slice(0, 3) ?? [],
);

const userConnectors = computed(
  () => userStore.currentUser?.vehicles?.map((v) => v.connector) ?? [],
);

function isCompatibleConnector(type: string) {
  return userConnectors.value.includes(type);
}

const isCompatible = computed(
  () =>
    props.station?.connector.socketTypes.some((t) =>
      userConnectors.value.includes(t),
    ) ?? false,
);

// ── Favorites ─────────────────────────────────────────────────────────────────

const isFavorite = computed(
  () =>
    userStore.currentUser?.favorites?.includes(
      props.station?.stationId ?? "",
    ) ?? false,
);

async function toggleFavorite() {
  if (!props.station) return;
  favLoading.value = true;
  try {
    if (isFavorite.value) {
      await userStore.removeFavorite(props.station.stationId);
    } else {
      await userStore.addFavorite(props.station.stationId);
    }
  } finally {
    favLoading.value = false;
  }
}
</script>
