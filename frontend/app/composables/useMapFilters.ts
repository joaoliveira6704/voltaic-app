// composables/useMapFilters.ts
import { ref, computed } from "vue";
import { Star, Zap, Tag } from "lucide-vue-next";
import { useStationStore } from "@/stores/station";
import { useUserStore } from "@/stores/user";
import { ALL_CONNECTORS } from "@/constants/connectors";
import type { Station } from "@/types/station";
import type { MapFilter, MapFilterKey } from "@/types/mapFilter";

export function useMapFilters() {
  const userStore = useUserStore();
  const stationStore = useStationStore();

  const userConnectors = computed(
    () => userStore.currentUser?.vehicles?.map((v) => v.connector) ?? [],
  );
  const userFavorites = computed(() => userStore.currentUser?.favorites ?? []);

  const filters = ref<MapFilter[]>([
    { key: "favs", label: "Favs", icon: Star, active: false },
    { key: "compatible", label: "Compatible", icon: Zap, active: false },
    { key: "free", label: "Free", icon: Tag, active: false },
  ]);

  const sidebarOpen = ref(false);
  const selectedConnectors = ref<string[]>([]);

  // ── Distance filter ───────────────────────────────────────────────────────
  const sliderValue = ref(10); // ── Default slider position in km ────────
  const distanceActive = ref(false);
  const userLocation = ref<[number, number] | null>(null);
  const isGeolocating = ref(false);

  async function getUserLocation(): Promise<[number, number] | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
        () => resolve(null),
        {
          timeout: 5000,
          enableHighAccuracy: false,
          maximumAge: 30_000,
        },
      );
    });
  }

  const isFilterActive = (key: MapFilterKey) =>
    filters.value.find((f) => f.key === key)?.active ?? false;

  function toggleFilter(key: MapFilterKey) {
    const filter = filters.value.find((f) => f.key === key);
    if (filter) filter.active = !filter.active;
  }

  function toggleConnector(connector: string) {
    const idx = selectedConnectors.value.indexOf(connector);
    if (idx === -1) selectedConnectors.value.push(connector);
    else selectedConnectors.value.splice(idx, 1);
  }

  function onSliderChange(value: number) {
    sliderValue.value = value;
  }

  async function onSliderCommit(
    value: number,
    coords: [number, number] | null,
  ) {
    sliderValue.value = value;

    let location = coords ?? userLocation.value;
    if (!location) {
      isGeolocating.value = true;
      location = await getUserLocation();
      isGeolocating.value = false;
    }

    if (!location) return;

    userLocation.value = location;
    distanceActive.value = true;

    const [lng, lat] = location;
    await stationStore.fetchNearbyStations(lat, lng, value);
  }

  async function resetSidebarFilters() {
    selectedConnectors.value = [];
    sliderValue.value = 10;
    distanceActive.value = false;
    // Reset to full station list
    await stationStore.fetchStations();
  }

  const allStations = computed(() => stationStore.stations as Station[]);

  const filteredStations = computed(() =>
    allStations.value.filter((station) => {
      if (
        isFilterActive("favs") &&
        !userFavorites.value.includes(station.stationId)
      )
        return false;

      if (isFilterActive("compatible")) {
        const match = station.connector.socketTypes.some((t) =>
          userConnectors.value.includes(t),
        );
        if (!match) return false;
      }

      if (isFilterActive("free") && station.state !== "available") return false;

      if (selectedConnectors.value.length > 0) {
        const match = station.connector.socketTypes.some((t) =>
          selectedConnectors.value.includes(t),
        );
        if (!match) return false;
      }

      return true;
    }),
  );

  return {
    filters,
    sidebarOpen,
    selectedConnectors,
    allConnectors: ALL_CONNECTORS,
    filteredStations,
    sliderValue,
    distanceActive,
    userLocation,
    isGeolocating,
    toggleFilter,
    toggleConnector,
    resetSidebarFilters,
    onSliderChange,
    onSliderCommit,
    getUserLocation,
  };
}
