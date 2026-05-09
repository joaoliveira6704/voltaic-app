<!-- pages/map.vue -->
<template>
  <div class="relative w-full h-screen overflow-hidden">
    <div
      ref="mapContainer"
      class="w-full h-full"
      @click="sidebarOpen = false"
    />

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
      :distance-active="distanceActive"
      :slider-value="sliderValue"
      @close="sidebarOpen = false"
      @reset="resetSidebarFilters"
      @toggle-connector="toggleConnector"
      @slider-change="onSliderChange"
      @slider-commit="(val) => onSliderCommit(val, userLocation)"
    />

    <MapStationCard
      :station="selectedStation"
      :is-mobile="isMobile"
      @close="selectedStation = null"
    />

    <MapLocateButton :locating="locating" @click="flyToUser" />
    <MapNorthButton @click="resetNorth" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useStationStore } from "@/stores/station";
import { useResponsive } from "@/composables/useResponsive";
import { useMapFilters } from "@/composables/useMapFilters";
import { useMapInstance } from "@/composables/useMapInstance";
import { useMapMarkers } from "@/composables/useMapMarkers";
import { useMapClustering } from "@/composables/useMapClustering";
import type { Station } from "@/types/station";

definePageMeta({ ssr: false, layout: false });

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
  sliderValue,
  distanceActive,
  userLocation,
  toggleFilter,
  toggleConnector,
  resetSidebarFilters,
  onSliderChange,
  onSliderCommit,
} = useMapFilters();

const {
  mapContainer,
  mapInstance,
  MarkerClass,
  isReady,
  currentZoom,
  resetNorth,
  flyToUser,
  locating,
} = useMapInstance(isDark, firstStation);

// ── Station Card ───────────────────────────────────────────────────────────────

const selectedStation = ref<Station | null>(null);

useMapMarkers(
  mapInstance,
  isReady,
  filteredStations,
  MarkerClass,
  currentZoom,
  (station) => {
    selectedStation.value = station;
  },
);

useMapClustering(
  mapInstance,
  isReady,
  filteredStations,
  MarkerClass,
  currentZoom,
);
</script>
