// composables/useMapFilters.ts
import { ref, computed } from "vue";
import { Star, Zap, EvCharger, Building } from "lucide-vue-next";
import { useStationStore } from "@/stores/station";
import { useUserStore } from "@/stores/user";
import { useCompanyStore } from "@/stores/company";
import { ALL_CONNECTORS } from "@/constants/connectors";
import type { Station } from "@/types/station";
import type { MapFilter, MapFilterKey } from "@/types/mapFilter";

export function useMapFilters() {
  const userStore = useUserStore();
  const stationStore = useStationStore();
  const companyStore = useCompanyStore();

  const userConnectors = computed(
    () => userStore.currentUser?.vehicles?.map((v) => v.connector) ?? [],
  );
  const userFavorites = computed(() => userStore.currentUser?.favorites ?? []);
  const currentCompany = computed(() => companyStore.currentCompany);
  const companyStationIds = ref<string[]>([]);

  const filters = ref<MapFilter[]>([
    { key: "favs", label: "Favs", labelKey: "map.filters.favs", icon: Star, active: false },
    { key: "compatible", label: "Compatible", labelKey: "map.filters.compatible", icon: Zap, active: false },
    { key: "free", label: "Available", labelKey: "map.filters.free", icon: EvCharger, active: false },
  ]);

  if (currentCompany.value) {
    filters.value.push({
      key: "company",
      label: "Company Managed",
      labelKey: "map.filters.company",
      icon: Building,
      active: false,
    });
  }

  const sidebarOpen = ref(false);
  const selectedConnectors = ref<string[]>([]);

  // ── Distance filter ───────────────────────────────────────────────────────
  const sliderValue = ref(10);
  const distanceActive = ref(false);
  const userLocation = ref<[number, number] | null>(null);
  const isGeolocating = ref(false);

  async function getUserLocation(): Promise<[number, number] | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: false, maximumAge: 30_000 },
      );
    });
  }

  const isFilterActive = (key: MapFilterKey) =>
    filters.value.find((f) => f.key === key)?.active ?? false;

  async function toggleFilter(key: MapFilterKey) {
    const filter = filters.value.find((f) => f.key === key);
    if (!filter) return;

    filter.active = !filter.active;

    // When toggling company filter on, fetch company stations
    if (key === "company" && filter.active && currentCompany.value) {
      await stationStore.fetchCompanyStations();
      companyStationIds.value = (
        stationStore.companyStations ?? []
      ).map((s: Station) => s.stationId);
    } else if (key === "company" && !filter.active) {
      companyStationIds.value = [];
    }
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
    companyStationIds.value = [];
    const companyFilter = filters.value.find((f) => f.key === "company");
    if (companyFilter) companyFilter.active = false;
    await stationStore.fetchStations();
  }

  const allStations = computed(() => stationStore.stations as Station[]);

  const filteredStations = computed(() => {
    const favsActive = isFilterActive("favs");
    const compatibleActive = isFilterActive("compatible");
    const freeActive = isFilterActive("free");
    const companyActive = isFilterActive("company");
    const hasSelectedConnectors = selectedConnectors.value.length > 0;

    return allStations.value.filter((station) => {
      if (favsActive && !userFavorites.value.includes(station.stationId))
        return false;

      if (compatibleActive) {
        const match = station.connector.socketTypes.some((t) =>
          userConnectors.value.includes(t),
        );
        if (!match) return false;
      }

      if (freeActive && station.state !== "available") return false;

      if (companyActive && !companyStationIds.value.includes(station.stationId))
        return false;

      if (hasSelectedConnectors) {
        const match = station.connector.socketTypes.some((t) =>
          selectedConnectors.value.includes(t),
        );
        if (!match) return false;
      }

      return true;
    });
  });

  return {
    filters,
    currentCompany,
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
