import { ref, watch, onUnmounted } from "vue";
import type { Ref } from "vue";
import type { Map } from "maplibre-gl";
import { useStationStore } from "@/stores/station";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useMapLookingLocation(
  mapInstance: Ref<Map | null>,
  isReady: Ref<boolean>,
  distanceActive: Ref<boolean>,
) {
  const lookingCenter = ref<[number, number] | null>(null);
  const lookingRadius = ref<number | null>(null);
  const stationStore = useStationStore();

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let moveEndHandler: (() => void) | null = null;
  let lastFetchCenter: [number, number] | null = null;
  let lastFetchZoom: number | null = null;

  function getLookingInfo() {
    const map = mapInstance.value;
    if (!map) return null;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const bounds = map.getBounds();

    const lat = center.lat;
    const lng = center.lng;

    const dLatHalf = (bounds.getNorth() - bounds.getSouth()) / 2;
    const dLngHalf = (bounds.getEast() - bounds.getWest()) / 2;

    const rLat = haversineKm(lat, lng, lat + dLatHalf, lng);
    const rLng = haversineKm(lat, lng, lat, lng + dLngHalf);
    const radius = (rLat + rLng) / 2;

    lookingCenter.value = [lng, lat];
    lookingRadius.value = Math.round(radius * 100) / 100;

    return { lat, lng, zoom, radius };
  }

  function logLookingInfo() {
    const info = getLookingInfo();
    if (!info) return;

    console.log(
      `[Looking] ${new Date().toISOString()} | center: ${info.lat.toFixed(4)}, ${info.lng.toFixed(4)} | zoom: ${info.zoom.toFixed(1)} | radius: ~${info.radius.toFixed(2)} km`,
    );
  }

  function isSignificantMovement(
    center: [number, number],
    zoom: number,
    radius: number,
  ): boolean {
    if (!lastFetchCenter || lastFetchZoom === null) return true;

    const dist = haversineKm(
      center[1],
      center[0],
      lastFetchCenter[1],
      lastFetchCenter[0],
    );
    const zoomChanged = Math.abs(zoom - lastFetchZoom) > 0.5;

    return dist > radius * 0.25 || zoomChanged;
  }

  function onLookingChange(skipMovementCheck = false) {
    logLookingInfo();

    if (distanceActive.value) return;
    if (!lookingCenter.value || lookingRadius.value === null) return;

    const [lng, lat] = lookingCenter.value;
    const map = mapInstance.value;
    const zoom = map?.getZoom() ?? 0;

    const shouldFetch =
      skipMovementCheck ||
      isSignificantMovement(lookingCenter.value, zoom, lookingRadius.value);

    if (shouldFetch) {
      lastFetchCenter = lookingCenter.value;
      lastFetchZoom = zoom;
      stationStore.fetchNearbyStations(lat, lng, lookingRadius.value);
    }
  }

  function start() {
    const map = mapInstance.value;
    if (!map || !isReady.value) return;

    moveEndHandler = () => onLookingChange();
    map.on("moveend", moveEndHandler);

    intervalId = setInterval(() => onLookingChange(), 10_000);

    onLookingChange(true);
  }

  function stop() {
    const map = mapInstance.value;
    if (moveEndHandler && map) {
      map.off("moveend", moveEndHandler);
      moveEndHandler = null;
    }
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  const unwatch = watch(isReady, (ready) => {
    if (ready) start();
  });

  onUnmounted(() => {
    stop();
    unwatch();
  });

  return {
    lookingCenter,
    lookingRadius,
  };
}
