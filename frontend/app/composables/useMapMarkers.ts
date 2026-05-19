import { ref, watch, computed } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import type { Station, StationState } from "@/types/station";
import { ZOOM_INDIVIDUAL } from "@/composables/useMapClustering";
import { useUserStore } from "@/stores/user";

const STATE_COLORS: Record<StationState, string> = {
  available: "#22c55e",
  unavailable: "#B91C1C",
  maintenance: "#FBBF24",
};

// ── Zoom level where clustering starts (zoom out to group stations) ────────────
const CLUSTER_ZOOM_THRESHOLD = 13;

export function useMapMarkers(
  mapInstance: Ref<MapLibreMap | null>,
  isReady: Ref<boolean>,
  filteredStations: ComputedRef<Station[]>,
  MarkerClass: Ref<typeof Marker | null>,
  currentZoom: Ref<number>,
  onMarkerClick?: (station: Station) => void,
) {
  const markersMap = new Map<string, Marker>();
  const userStore = useUserStore();
  const userRole = computed(() => userStore.currentUser?.role);

  function clearMarkers() {
    markersMap.forEach((m) => m.remove());
    markersMap.clear();
  }

  function renderMarkers() {
    if (!mapInstance.value || !MarkerClass.value || !isReady.value) {
      return;
    }
    if (currentZoom.value <= ZOOM_INDIVIDUAL) {
      clearMarkers();
      return;
    }

    // Only show individual markers when zoom > threshold (zoomed in)
    if (currentZoom.value <= CLUSTER_ZOOM_THRESHOLD) {
      clearMarkers();
      return;
    }

    const newStationIds = new Set(filteredStations.value.map((s) => s.stationId));

    // Remove markers for stations no longer in the filtered list
    for (const [stationId, marker] of markersMap) {
      if (!newStationIds.has(stationId)) {
        marker.remove();
        markersMap.delete(stationId);
      }
    }

    // Clear all markers before re-rendering to pick up state changes
    clearMarkers();

    filteredStations.value.forEach((station) => {
      if (!station.alive && userRole.value !== "admin") return;

      const coords = station.location?.coordinates;
      if (!coords || coords.length !== 2) return;

      const [lng, lat] = coords;

      const marker = new MarkerClass.value!({
        color: STATE_COLORS[station.state],
      })
        .setLngLat([lng, lat])
        .addTo(mapInstance.value!);

      if (onMarkerClick) {
        marker.getElement().addEventListener("click", () => {
          onMarkerClick(station);
        });
      }

      markersMap.set(station.stationId, marker);
    });
  }

  watch([isReady, filteredStations, currentZoom], () => renderMarkers(), {
    immediate: true,
  });

  return { renderMarkers, clearMarkers };
}
