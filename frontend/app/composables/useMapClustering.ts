import { ref, watch, shallowRef } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import type { Station } from "@/types/station";

interface ClusterGroup {
  groupId: string;
  stations: Station[];
  center: [number, number];
}

export const ZOOM_INDIVIDUAL = 13;

export function useMapClustering(
  mapInstance: Ref<MapLibreMap | null>,
  isReady: Ref<boolean>,
  filteredStations: ComputedRef<Station[]>,
  MarkerClass: Ref<typeof Marker | null>,
  currentZoom: Ref<number>,
) {
  const clusterMarkersMap = new Map<string, Marker>();
  const clusterGroups = shallowRef(new Map<string, ClusterGroup>());

  let zoomDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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

  function getCellSize(): number {
    const CLUSTER_RADIUS_PX = 40;
    return CLUSTER_RADIUS_PX * (360 / (256 * Math.pow(2, currentZoom.value)));
  }

  function buildGeoClusters(): Map<string, ClusterGroup> {
    const groups = new Map<string, ClusterGroup>();
    const cellSize = getCellSize();

    filteredStations.value.forEach((station) => {
      const coords = station.location?.coordinates;
      if (!coords || coords.length !== 2) return;

      const cellX = Math.floor(coords[0] / cellSize);
      const cellY = Math.floor(coords[1] / cellSize);
      const cellKey = `${cellX}:${cellY}`;

      if (!groups.has(cellKey)) {
        groups.set(cellKey, {
          groupId: cellKey,
          stations: [],
          center: [0, 0],
        });
      }

      groups.get(cellKey)!.stations.push(station);
    });

    groups.forEach((group) => {
      group.center = calculateClusterCenter(group.stations);
    });

    return groups;
  }

  function calculateMarkerSize(stationCount: number): number {
    const baseSize = 40;
    const maxSize = 80;
    return Math.min(baseSize + (stationCount - 1) * 4, maxSize);
  }

  function clearClusterMarkers() {
    clusterMarkersMap.forEach((m) => m.remove());
    clusterMarkersMap.clear();
  }

  function renderClusterMarkers() {
    if (!mapInstance.value || !MarkerClass.value || !isReady.value) return;

    if (currentZoom.value > ZOOM_INDIVIDUAL) {
      clearClusterMarkers();
      return;
    }

    clusterGroups.value = buildGeoClusters();

    const newGroupIds = new Set(clusterGroups.value.keys());

    for (const [groupId, marker] of clusterMarkersMap) {
      if (!newGroupIds.has(groupId)) {
        marker.remove();
        clusterMarkersMap.delete(groupId);
      }
    }

    clusterGroups.value.forEach((group) => {
      const existing = clusterMarkersMap.get(group.groupId);

      if (existing) {
        existing.setLngLat(group.center);
        const el = existing.getElement();
        el.textContent = group.stations.length.toString();
        return;
      }

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
        let hasValidCoords = false;
        group.stations.forEach((station) => {
          const coords = station.location?.coordinates;
          if (coords && coords.length === 2) {
            bounds.extend([coords[0], coords[1]]);
            hasValidCoords = true;
          }
        });

        if (!hasValidCoords) return;

        mapInstance.value.fitBounds(bounds, {
          padding: 50,
          duration: 800,
        });
      });

      clusterMarkersMap.set(group.groupId, marker);
    });
  }

  function onRenderTrigger() {
    if (zoomDebounceTimer) {
      clearTimeout(zoomDebounceTimer);
    }
    zoomDebounceTimer = setTimeout(() => {
      renderClusterMarkers();
    }, 100);
  }

  watch(
    [isReady, filteredStations],
    () => renderClusterMarkers(),
    { immediate: true },
  );

  watch(currentZoom, () => onRenderTrigger());

  return { renderClusterMarkers, clearClusterMarkers };
}
