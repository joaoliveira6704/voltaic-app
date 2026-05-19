// composables/useMapInstance.ts
import { ref, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";
import type { Station } from "@/types/station";
import { useGeolocation } from "@/composables/useGeolocation";

const TILE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
const TILE_DARK = "https://tiles.openfreemap.org/styles/fiord";
const FALLBACK_CENTER: [number, number] = [-8.6291, 41.1579]; // Porto

export function useMapInstance(
  isDark: Ref<boolean>,
  firstStation: Ref<Station | undefined>,
) {
  const mapContainer = ref<HTMLElement | null>(null);
  const mapInstance = ref<import("maplibre-gl").Map | null>(null);
  const MarkerClass = ref<typeof import("maplibre-gl").Marker | null>(null);
  const PopupClass = ref<typeof import("maplibre-gl").Popup | null>(null);
  const isReady = ref(false);
  const currentZoom = ref(13);

  const {
    getUserLocation,
    flyToUser,
    loading: locating,
    error: locationError,
  } = useGeolocation(mapInstance);

  function resetNorth() {
    mapInstance.value?.easeTo({ bearing: 0, pitch: 0, duration: 400 });
  }

  watch(isDark, (dark) => {
    const map = mapInstance.value;
    if (!map) return;
    map.setStyle(dark ? TILE_DARK : TILE_LIGHT);
  });

  onMounted(async () => {
    if (!mapContainer.value) return;

    const maplibre = await import("maplibre-gl");
    await import("maplibre-gl/dist/maplibre-gl.css");

    MarkerClass.value = maplibre.Marker;
    PopupClass.value = maplibre.Popup;

    // Try user location first, fall back to first station, then Porto
    const userCoords = await getUserLocation();
    const stationCoords = firstStation.value?.location.coordinates;
    const center: [number, number] =
      userCoords ??
      (stationCoords ? [stationCoords[0], stationCoords[1]] : FALLBACK_CENTER);

    const map = new maplibre.Map({
      container: mapContainer.value,
      style: isDark.value ? TILE_DARK : TILE_LIGHT,
      center,
      zoom: 13,
      minZoom: 3,
      attributionControl: false,
    });

    map.on("load", () => {
      isReady.value = true;
      map.setProjection({
        type: "globe", // Set projection to globe
      });
    });

    map.on("zoom", () => {
      currentZoom.value = map.getZoom();
    });

    mapInstance.value = map;
    map.on("style.load", () => {
      map.setProjection({
        type: "globe", // Set projection to globe
      });
    });
    map.addControl(
      new maplibre.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
    );
  });

  onUnmounted(() => {
    mapInstance.value?.remove();
  });

  return {
    mapContainer,
    mapInstance,
    MarkerClass,
    PopupClass,
    isReady,
    currentZoom,
    resetNorth,
    flyToUser,
    locating,
    locationError,
  };
}
