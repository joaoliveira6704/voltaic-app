<!-- pages/map.vue -->
<template>
  <div class="relative w-full h-screen overflow-hidden">
    <div ref="mapContainer" class="w-full h-full" />
    <MapTopBar
      :filters="filters"
      :sidebar-open="sidebarOpen"
      :selected-connectors-count="selectedConnectors.length"
      @toggle-filter="toggleFilter"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @clear-connectors="resetSidebarFilters"
    />
    <MapFilterCard
      :open="sidebarOpen"
      :is-mobile="isMobile"
      :all-connectors="allConnectors"
      :selected-connectors="selectedConnectors"
      @close="sidebarOpen = false"
      @reset="resetSidebarFilters"
      @toggle-connector="toggleConnector"
    />
    <MapLocateButton :locating="locating" @click="flyToUser" />
    <MapNorthButton @click="resetNorth" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useStationStore } from "@/stores/station";
import { useResponsive } from "@/composables/useResponsive";
import { useMapFilters } from "@/composables/useMapFilters";
import { useMapInstance } from "@/composables/useMapInstance";
import { useMapMarkers } from "@/composables/useMapMarkers";
import type { Station } from "@/types/station";

definePageMeta({ ssr: false, layout: "none" });

// ── User ──────────────────────────────────────────────────────────────────────

const userStore = useUserStore();
if (!userStore.currentUser) await userStore.fetchCurrentUser();
const isDark = computed(
  () => userStore.currentUser?.preferences?.darkMode ?? false,
);

// ── Stations ──────────────────────────────────────────────────────────────────

const stationStore = useStationStore();
await stationStore.fetchStations();
const firstStation = computed(
  () => stationStore.stations[0] as Station | undefined,
);

// ── Composables ───────────────────────────────────────────────────────────────

const { isMobile } = useResponsive();

const {
  filters,
  sidebarOpen,
  selectedConnectors,
  allConnectors,
  filteredStations,
  toggleFilter,
  toggleConnector,
  resetSidebarFilters,
} = useMapFilters();

const {
  mapContainer,
  mapInstance,
  MarkerClass,
  PopupClass,
  isReady,
  resetNorth,
  flyToUser,
  locating,
} = useMapInstance(isDark, firstStation);

useMapMarkers(mapInstance, isReady, filteredStations, MarkerClass, PopupClass);
</script>
