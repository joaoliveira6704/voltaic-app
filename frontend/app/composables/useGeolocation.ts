// composables/useGeolocation.ts
import { ref } from "vue";
import type { Ref } from "vue";
import type { Map, Marker } from "maplibre-gl";

export function useGeolocation(mapInstance: Ref<Map | null>) {
  const userLocation = ref<[number, number] | null>(null);
  const error = ref<string | null>(null);
  const loading = ref(false);

  let userMarker: Marker | null = null;

  async function getUserLocation(): Promise<[number, number] | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
        () => resolve(null),
        {
          timeout: 5000,
          enableHighAccuracy: false, // faster, uses WiFi/cell instead of GPS
          maximumAge: 30_000, // use cached position if less than 30s old
        },
      );
    });
  }

  async function placeUserMarker(coords: [number, number]) {
    const map = mapInstance.value;
    if (!map) return;

    const maplibre = await import("maplibre-gl");

    // Remove existing user marker if present
    userMarker?.remove();

    // Custom user location dot element
    const el = document.createElement("div");
    el.style.cssText = `
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #3b82f6;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.3);
    `;

    userMarker = new maplibre.Marker({ element: el })
      .setLngLat(coords)
      .addTo(map);
  }

  async function flyToUser() {
    if (!navigator.geolocation) {
      error.value = "Geolocation not supported";
      return;
    }

    if (!mapInstance.value) {
      error.value = "Map not ready";
      return;
    }

    loading.value = true;
    error.value = null;

    const coords = await getUserLocation();
    loading.value = false;

    if (!coords) {
      error.value = "Location access denied";
      return;
    }

    userLocation.value = coords;
    await placeUserMarker(coords);

    // ── Zoom level when centering on user location ────────────────────────────
    const USER_LOCATION_ZOOM = 15;

    mapInstance.value.flyTo({
      center: coords,
      zoom: USER_LOCATION_ZOOM,
      duration: 800,
    });
  }

  function removeUserMarker() {
    userMarker?.remove();
    userMarker = null;
  }

  return {
    userLocation,
    error,
    loading,
    getUserLocation,
    flyToUser,
    removeUserMarker,
  };
}
