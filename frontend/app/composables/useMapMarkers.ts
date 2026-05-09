import { ref, watch } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { Map, Marker } from "maplibre-gl";
import type { Station, StationState } from "@/types/station";
import { ZOOM_INDIVIDUAL } from "@/composables/useMapClustering";

const STATE_COLORS: Record<StationState, string> = {
  available: "#22c55e",
  unavailable: "#ef4444",
  maintenance: "#9ca3af",
};

// ── Zoom level where clustering starts (zoom out to group stations) ────────────
const CLUSTER_ZOOM_THRESHOLD = 13;

export function useMapMarkers(
  mapInstance: Ref<Map | null>,
  isReady: Ref<boolean>,
  filteredStations: ComputedRef<Station[]>,
  MarkerClass: Ref<typeof Marker | null>,
  currentZoom: Ref<number>,
  onMarkerClick?: (station: Station) => void,
) {
  const markers = ref<Marker[]>([]);

  function clearMarkers() {
    markers.value.forEach((m) => m.remove());
    markers.value = [];
  }

  function renderMarkers() {
    if (!mapInstance.value || !MarkerClass.value || !isReady.value) {
      return;
    }
    if (currentZoom.value <= ZOOM_INDIVIDUAL) {
      clearMarkers();
      return;
    }

    clearMarkers();

    // Only show individual markers when zoom > threshold (zoomed in)
    if (currentZoom.value <= CLUSTER_ZOOM_THRESHOLD) {
      return;
    }

    filteredStations.value.forEach((station) => {
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

      markers.value.push(marker);
    });

    const markerCoords = markers.value.map((m) => m.getLngLat());
    console.log("All marker coordinates:", markerCoords);
  }

  watch([isReady, filteredStations, currentZoom], () => renderMarkers(), {
    immediate: true,
  });

  return { renderMarkers, clearMarkers };
}
