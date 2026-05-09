import { ref, watch } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { Map, Marker } from "maplibre-gl";
import type { Station } from "@/types/station";

interface ClusterGroup {
  groupId: string;
  stations: Station[];
  center: [number, number];
}

// ── Zoom level where clustering starts (zoom out to group stations) ────────────
const CLUSTER_ZOOM_THRESHOLD = 13;

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
    const size = baseSize + (stationCount - 1) * 4;
    return Math.min(size, maxSize);
  }

  function buildClusterGroups(): Map<string, ClusterGroup> {
    const groups = new Map<string, ClusterGroup>();

    filteredStations.value.forEach((station) => {
      const groupId = station.groupId || "default";

      if (!groups.has(groupId)) {
        groups.set(groupId, {
          groupId,
          stations: [],
          center: [0, 0],
        });
      }

      const group = groups.get(groupId)!;
      group.stations.push(station);
    });

    // Calculate center for each group
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
    if (
      !mapInstance.value ||
      !MarkerClass.value ||
      !isReady.value ||
      currentZoom.value > CLUSTER_ZOOM_THRESHOLD
    ) {
      return;
    }

    clearClusterMarkers();
    clusterGroups.value = buildClusterGroups();

    clusterGroups.value.forEach((group) => {
      const stationCount = group.stations.length;

      // Skip rendering individual markers if there's only one station
      if (stationCount === 1) {
        return;
      }

      const size = calculateMarkerSize(stationCount);

      // Create custom cluster marker element
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

      // Handle cluster marker click
      el.addEventListener("click", async () => {
        if (!mapInstance.value) return;

        const maplibre = await import("maplibre-gl");

        // Calculate bounds for all stations in cluster
        const bounds = new maplibre.LngLatBounds();
        group.stations.forEach((station) => {
          const coords = station.location?.coordinates;
          if (coords && coords.length === 2) {
            bounds.extend([coords[0], coords[1]]);
          }
        });

        // ── Animation parameters matching the "locate me" button ────────────────
        mapInstance.value.flyTo({
          center: bounds.getCenter(),
          zoom: 15,
          duration: 800,
        });
      });

      clusterMarkers.value.push(marker);
    });
  }

  watch(
    [isReady, filteredStations, currentZoom],
    () => renderClusterMarkers(),
    {
      immediate: true,
    },
  );

  return { renderClusterMarkers, clearClusterMarkers };
}
