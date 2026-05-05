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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStationStore } from "@/stores/station";
import { useUserStore } from "@/stores/user";
import { Star, Zap, Tag, SlidersHorizontal, Navigation } from "lucide-vue-next";

definePageMeta({ ssr: false, layout: "none" });

// ── User ──────────────────────────────────────────────────────────────────────

const userStore = useUserStore();

if (!userStore.currentUser) {
  await userStore.fetchCurrentUser();
}

const userInitial = computed(() => {
  const user = userStore.currentUser;
  if (!user) return "?";
  return (user.firstName || user.username || "?").charAt(0).toUpperCase();
});

const isDark = computed(
  () => userStore.currentUser?.preferences?.darkMode ?? false,
);

// ── Filters ───────────────────────────────────────────────────────────────────

const filters = ref([
  { key: "favs", label: "Favs", icon: Star, active: false },
  { key: "compatible", label: "Compatible", icon: Zap, active: false },
  { key: "free", label: "Free", icon: Tag, active: false },
]);

const sidebarOpen = ref(false);

// ── Map ───────────────────────────────────────────────────────────────────────

interface Station {
  stationId: string;
  title: string;
  companyId: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
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

const TILE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
const TILE_DARK = "https://tiles.openfreemap.org/styles/dark";

const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: import("maplibre-gl").Map | null = null;

const stationStore = useStationStore();
await stationStore.fetchStations();

function resetNorth() {
  if (!mapInstance) return;
  mapInstance.easeTo({ bearing: 0, pitch: 0, duration: 400 });
}

onMounted(async () => {
  if (!mapContainer.value) return;

  const maplibre = await import("maplibre-gl");
  await import("maplibre-gl/dist/maplibre-gl.css");

  const Map = maplibre.Map;
  const Marker = maplibre.Marker;
  const Popup = maplibre.Popup;

  const stations = stationStore.stations as Station[];
  const firstStation = stations[0];
  const center: [number, number] = firstStation
    ? [
        firstStation.location.coordinates[1],
        firstStation.location.coordinates[0],
      ]
    : [-8.6291, 41.1579]; // MapLibre uses [lng, lat]

  mapInstance = new Map({
    container: mapContainer.value,
    style: isDark.value ? TILE_DARK : TILE_LIGHT,
    center,
    zoom: 13,
    attributionControl: false,
  });

  mapInstance.on("load", () => {
    stations.forEach((station) => {
      const [lat, lng] = station.location.coordinates;

      const popup = new Popup({ offset: 25 }).setHTML(`
        <strong>${station.title}</strong><br/>
        ${station.connector.socketTypes.join(", ")}<br/>
        Max Power: ${station.connector.maxPower} kW<br/>
        State: ${station.state}
      `);

      new Marker({ color: "#22c55e" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapInstance!);
    });
  });
});

onUnmounted(() => {
  mapInstance?.remove();
});
</script>
