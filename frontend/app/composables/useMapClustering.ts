// composables/useMapClustering.ts
import { ref, watch } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { Map, Marker } from "maplibre-gl";
import type { Station } from "@/types/station";

interface ClusterGroup {
  groupId: string;
  stations: Station[];
  center: [number, number];
}

// ── Zoom level thresholds ─────────────────────────────────────────────────────
export const ZOOM_INDIVIDUAL = 13; // zoom > 13: only individual markers
// zoom <= 13: only group markers

export function useMapClustering(
  mapInstance: Ref<Map | null>,
  isReady: Ref<boolean>,
  filteredStations: ComputedRef<Station[]>,
  MarkerClass: Ref<typeof Marker | null>,
  currentZoom: Ref<number>,
) {
  const clusterMarkers = ref<Marker[]>([]);
  const clusterGroups = ref<Map<string, ClusterGroup>>(new Map());

  function calculateClusterCenter(stations: Station[]): [number, number] {
    let totalLng = 0;
    let totalLat = 0;
    let count = 0;

    stations.forEach((station) => {
      const coords = station.location?.coordinates;
      if (coords && coords.length === 2) {
        totalLng += coords[0];
        totalLat += coords[1];
        count++;
      }
    });

    return count > 0 ? [totalLng / count, totalLat / count] : [0, 0];
  }

  function calculateMarkerSize(stationCount: number): number {
    const baseSize = 40;
    const maxSize = 80;
    return Math.min(baseSize + (stationCount - 1) * 4, maxSize);
  }

  function buildClusterGroups(): Map<string, ClusterGroup> {
    const groups = new Map<string, ClusterGroup>();

    filteredStations.value.forEach((station) => {
      if (!station.groupId) return;

      if (!groups.has(station.groupId)) {
        groups.set(station.groupId, {
          groupId: station.groupId,
          stations: [],
          center: [0, 0],
        });
      }

      const group = groups.get(station.groupId)!;
      group.stations.push(station);
    });

    groups.forEach((group) => {
      group.center = calculateClusterCenter(group.stations);
    });

    return groups;
  }

  function clearClusterMarkers() {
    clusterMarkers.value.forEach((m) => m.remove());
    clusterMarkers.value = [];
  }

  function renderClusterMarkers() {
    if (!mapInstance.value || !MarkerClass.value || !isReady.value) return;

    // zoom > ZOOM_INDIVIDUAL: hide clusters, individual markers take over
    if (currentZoom.value > ZOOM_INDIVIDUAL) {
      clearClusterMarkers();
      return;
    }

    clearClusterMarkers();
    clusterGroups.value = buildClusterGroups();

    clusterGroups.value.forEach((group) => {
      const stationCount = group.stations.length;
      const size = calculateMarkerSize(stationCount);

      const el = document.createElement("div");
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: #0ea5e9;
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${Math.max(12, size / 3)}px;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        cursor: pointer;
      `;
      el.textContent = stationCount.toString();

      const marker = new MarkerClass.value!({ element: el })
        .setLngLat(group.center)
        .addTo(mapInstance.value!);

      el.addEventListener("click", async () => {
        if (!mapInstance.value) return;
        const maplibre = await import("maplibre-gl");
        const bounds = new maplibre.LngLatBounds();
        group.stations.forEach((station) => {
          const coords = station.location?.coordinates;
          if (coords && coords.length === 2) {
            bounds.extend([coords[0], coords[1]]);
          }
        });

        // ── Zoom level when expanding a cluster ───────────────────────────
        mapInstance.value.flyTo({
          center: bounds.getCenter(),
          zoom: ZOOM_INDIVIDUAL + 1,
          duration: 800,
        });
      });

      clusterMarkers.value.push(marker);
    });
  }

  watch(
    [isReady, filteredStations, currentZoom],
    () => renderClusterMarkers(),
    { immediate: true },
  );

  return { renderClusterMarkers, clearClusterMarkers };
}
