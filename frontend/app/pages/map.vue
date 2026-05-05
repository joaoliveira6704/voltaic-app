<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- Map -->
    <div ref="mapContainer" class="w-full h-full" />

    <!-- Top Bar -->
    <div
      class="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3 pointer-events-none"
    >
      <!-- Filter Pills -->
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
          @click="filter.active = !filter.active"
        >
          <component :is="filter.icon" class="w-3.5 h-3.5" />
          {{ filter.label }}
        </button>

        <!-- Side Filter Toggle -->
        <button
          :class="[
            'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 shadow-md backdrop-blur-sm border',
            sidebarOpen
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white/90 border-white/60 text-gray-600 hover:bg-white',
          ]"
          @click="sidebarOpen = !sidebarOpen"
        >
          <SlidersHorizontal class="w-4 h-4" />
        </button>

        <!-- Clear filters badge -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="scale-75 opacity-0"
          leave-to-class="scale-75 opacity-0"
        >
          <button
            v-if="selectedConnectors.length > 0"
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-500 border border-red-400 text-white text-xs font-semibold shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-red-600"
            @click="resetSidebarFilters"
          >
            <X class="w-3 h-3" />
            {{ selectedConnectors.length }}
          </button>
        </Transition>
      </div>

      <!-- User Avatar -->
      <div class="pointer-events-auto">
        <NuxtLink
          to="/profile"
          class="flex items-center justify-center w-9 h-9 rounded-full bg-[#22c55e] text-white font-bold text-sm shadow-md hover:bg-[#16a34a] transition-colors duration-200 uppercase"
        >
          {{ userInitial }}
        </NuxtLink>
      </div>
    </div>

    <!-- Filter Sidebar — desktop: floating card, mobile: bottom sheet -->
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
        v-if="sidebarOpen"
        :class="[
          'absolute z-[999] bg-white shadow-2xl pointer-events-auto',
          isMobile
            ? 'bottom-0 left-0 right-0 rounded-t-2xl px-5 pt-4 pb-8 max-h-[70vh] overflow-y-auto'
            : 'left-4 top-1/2 -translate-y-1/2 w-80 rounded-2xl px-5 py-5 max-h-[75vh] overflow-y-auto',
        ]"
      >
        <!-- Handle bar (mobile only) -->
        <div v-if="isMobile" class="flex justify-center mb-4">
          <div class="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-gray-900 tracking-tight">Filter</h2>
          <div class="flex items-center gap-3">
            <button
              class="text-sm font-medium text-[#22c55e] hover:text-[#16a34a] transition-colors"
              @click="resetSidebarFilters"
            >
              Reset
            </button>
            <button
              class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              @click="sidebarOpen = false"
            >
              <X class="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <!-- Active connector tags -->
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
            <button @click="toggleConnector(c)">
              <X class="w-3 h-3" />
            </button>
          </span>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gray-100 mb-5" />

        <!-- Distance slider placeholder -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">Distance:</span>
            <span class="text-xs text-gray-400">km 0–100</span>
          </div>
          <div class="relative h-1.5 bg-gray-200 rounded-full">
            <div
              class="absolute left-0 top-0 h-full w-full bg-gray-200 rounded-full"
            />
            <!-- Slider will go here -->
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gray-100 mb-5" />

        <!-- Socket type pills -->
        <div>
          <span class="text-sm font-semibold text-gray-700 block mb-3"
            >Socket type:</span
          >
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
              @click="toggleConnector(connector)"
            >
              {{ connector }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop (mobile only) -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen && isMobile"
        class="absolute inset-0 z-[998] bg-black/30 backdrop-blur-sm"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Reset North Button -->
    <div class="absolute bottom-8 right-4 z-[1000]">
      <button
        class="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 shadow-md hover:bg-white transition-all duration-200 group"
        title="Reset North"
        @click="resetNorth"
      >
        <Navigation
          class="w-5 h-5 text-gray-700 transition-transform duration-300 group-hover:text-[#22c55e]"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useStationStore } from "@/stores/station";
import { useUserStore } from "@/stores/user";
import {
  Star,
  Zap,
  Tag,
  SlidersHorizontal,
  Navigation,
  X,
} from "lucide-vue-next";

definePageMeta({ ssr: false, layout: "none" });

// ── User — loaded once, reused everywhere ─────────────────────────────────────

const userStore = useUserStore();

if (!userStore.currentUser) {
  await userStore.fetchCurrentUser();
}

const user = computed(() => userStore.currentUser);
const userInitial = computed(() =>
  (user.value?.firstName || user.value?.username || "?")
    .charAt(0)
    .toUpperCase(),
);
const isDark = computed(() => user.value?.preferences?.darkMode ?? false);
const userConnectors = computed(
  () => user.value?.vehicles?.map((v) => v.connector) ?? [],
);
const userFavorites = computed(() => user.value?.favorites ?? []);

// ── Responsive ────────────────────────────────────────────────────────────────

const isMobile = ref(false);

function updateIsMobile() {
  isMobile.value = window.innerWidth < 768;
}

// ── Filters ───────────────────────────────────────────────────────────────────

const filters = ref([
  { key: "favs", label: "Favs", icon: Star, active: false },
  { key: "compatible", label: "Compatible", icon: Zap, active: false },
  { key: "free", label: "Free", icon: Tag, active: false },
]);

const sidebarOpen = ref(false);
const isFilterActive = (key: string) =>
  filters.value.find((f) => f.key === key)?.active ?? false;

const allConnectors = [
  "Type2",
  "CHAdeMO",
  "CCS/SAE",
  "Type3",
  "Tesla",
  "J-1772",
  "Wall_Euro",
  "Caravan_Mains_Socket",
  "Dual_J-1772",
  "Dual_CHAdeMO",
  "Mennekes",
  "Dual_Mennekes",
  "Other",
];

const selectedConnectors = ref<string[]>([]);

function toggleConnector(connector: string) {
  const idx = selectedConnectors.value.indexOf(connector);
  if (idx === -1) {
    selectedConnectors.value.push(connector);
  } else {
    selectedConnectors.value.splice(idx, 1);
  }
}

function resetSidebarFilters() {
  selectedConnectors.value = [];
}

// ── Station types ─────────────────────────────────────────────────────────────

interface Station {
  stationId: string;
  title: string;
  companyId: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  connector: {
    socketTypes: string[];
    maxPower: number;
  };
  telemetry: {
    amperage: number;
    voltage: number;
    temperature: number;
  };
  state: "available" | "unavailable" | "inactive";
  alive: boolean;
}

// ── Store & filtered list ─────────────────────────────────────────────────────

const stationStore = useStationStore();
await stationStore.fetchStations();

const allStations = computed(() => stationStore.stations as Station[]);

const filteredStations = computed(() => {
  return allStations.value.filter((station) => {
    if (
      isFilterActive("favs") &&
      !userFavorites.value.includes(station.stationId)
    )
      return false;

    if (isFilterActive("compatible")) {
      const hasMatch = station.connector.socketTypes.some((type) =>
        userConnectors.value.includes(type),
      );
      if (!hasMatch) return false;
    }

    if (isFilterActive("free") && station.state !== "available") return false;

    if (selectedConnectors.value.length > 0) {
      const hasMatch = station.connector.socketTypes.some((type) =>
        selectedConnectors.value.includes(type),
      );
      if (!hasMatch) return false;
    }

    return true;
  });
});

// ── Map ───────────────────────────────────────────────────────────────────────

const TILE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
const TILE_DARK = "https://tiles.openfreemap.org/styles/fiord";

const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: import("maplibre-gl").Map | null = null;
let MarkerClass: typeof import("maplibre-gl").Marker;
let PopupClass: typeof import("maplibre-gl").Popup;

const markers = ref<import("maplibre-gl").Marker[]>([]);

function getMarkerColor(state: Station["state"]): string {
  switch (state) {
    case "available":
      return "#22c55e";
    case "unavailable":
      return "#ef4444";
    case "inactive":
      return "#9ca3af";
  }
}

function clearMarkers() {
  markers.value.forEach((m) => m.remove());
  markers.value = [];
}

function renderMarkers() {
  clearMarkers();
  filteredStations.value.forEach((station) => {
    const [lat, lng] = station.location.coordinates;

    const popup = new PopupClass({ offset: 25 }).setHTML(`
      <strong>${station.title}</strong><br/>
      ${station.connector.socketTypes.join(", ")}<br/>
      Max Power: ${station.connector.maxPower} kW<br/>
      State: ${station.state}
    `);

    const marker = new MarkerClass({ color: getMarkerColor(station.state) })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(mapInstance!);

    markers.value.push(marker);
  });
}

function resetNorth() {
  if (!mapInstance) return;
  mapInstance.easeTo({ bearing: 0, pitch: 0, duration: 400 });
}

onMounted(async () => {
  updateIsMobile();
  window.addEventListener("resize", updateIsMobile);

  if (!mapContainer.value) return;

  const maplibre = await import("maplibre-gl");
  await import("maplibre-gl/dist/maplibre-gl.css");

  MarkerClass = maplibre.Marker;
  PopupClass = maplibre.Popup;

  const firstStation = allStations.value[0];
  const center: [number, number] = firstStation
    ? [
        firstStation.location.coordinates[1],
        firstStation.location.coordinates[0],
      ]
    : [-8.6291, 41.1579];

  mapInstance = new maplibre.Map({
    container: mapContainer.value,
    style: isDark.value ? TILE_DARK : TILE_LIGHT,
    center,
    zoom: 13,
    attributionControl: false,
  });

  mapInstance.on("load", () => {
    renderMarkers();
  });
});

watch(filteredStations, () => {
  if (mapInstance) renderMarkers();
});

onUnmounted(() => {
  mapInstance?.remove();
  window.removeEventListener("resize", updateIsMobile);
});
</script>
