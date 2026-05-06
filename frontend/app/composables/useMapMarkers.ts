import { ref, watch } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { Map, Marker, Popup } from "maplibre-gl";
import type { Station, StationState } from "@/types/station";

const STATE_COLORS: Record<StationState, string> = {
  available: "#22c55e",
  unavailable: "#ef4444",
  inactive: "#9ca3af",
};

export function useMapMarkers(
  mapInstance: Ref<Map | null>,
  isReady: Ref<boolean>,
  filteredStations: ComputedRef<Station[]>,
  MarkerClass: Ref<typeof Marker | null>,
  PopupClass: Ref<typeof Popup | null>,
) {
  const markers = ref<Marker[]>([]);

  function clearMarkers() {
    markers.value.forEach((m) => m.remove());
    markers.value = [];
  }

  function renderMarkers() {
    if (
      !mapInstance.value ||
      !MarkerClass.value ||
      !PopupClass.value ||
      !isReady.value
    ) {
      return;
    }

    clearMarkers();

    filteredStations.value.forEach((station) => {
      const coords = station.location?.coordinates;
      if (!coords || coords.length !== 2) return;

      const [lng, lat] = coords;

      const popup = new PopupClass.value!({ offset: 25 }).setHTML(`
        <strong>${station.title}</strong><br/>
        ${station.connector.socketTypes.join(", ")}<br/>
        Max Power: ${station.connector.maxPower} kW<br/>
        State: ${station.state}
      `);

      const marker = new MarkerClass.value!({
        color: STATE_COLORS[station.state],
      })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapInstance.value!);

      markers.value.push(marker);
    });

    const markerCoords = markers.value.map(m => m.getLngLat());
    console.log("All marker coordinates:", markerCoords);
  }

  watch([isReady, filteredStations], () => renderMarkers(), {
    immediate: true,
  });

  return { renderMarkers, clearMarkers };
}
