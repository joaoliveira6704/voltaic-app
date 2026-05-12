// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { toast } from "vue-sonner";

export const useStationStore = defineStore("station", () => {
  const stations = ref([]);
  const isLoaded = ref(false);

  // ── Getters ──────────────────────────────────────────────────────────────

  function getCompanyStations(groupIds: string[]) {
    return stations.value.filter((s) => groupIds.includes(s.groupId));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Call composables lazily inside actions, not at store setup time
  const token = () => useCookie("token").value;
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchStations() {
    try {
      const data = await $fetch<any[]>(`${apiBase()}/api/stations`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      stations.value = data;
    } catch (e) {
      console.error("Failed to fetch stations:", e);
    }
  }

  async function createStation(station: any) {
    const telemetry = {
      temperature: 0,
      amperage: 0,
      voltage: 0,
    };

    try {
      // Create a clean payload with telemetry included
      const payload = {
        ...station,
        telemetry,
      };

      const response = await $fetch<any>(`${apiBase()}/api/stations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: payload,
      });

      // Use the response from the server which contains the real DB object
      stations.value.push(response);
      toast.success("Station added successfully");
      return response;
    } catch (e) {
      console.error("Failed to add station:", e);
      toast.error("Failed to add station");
      throw e;
    }
  }

  async function deleteStation(stationId: string, stationName: string) {
    const confirmed = await Swal.fire({
      title: "Confirm Delete",
      text: `You are about to delete the following station: ${stationName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Delete",
      reverseButtons: true,
      customClass: {
        popup:
          " text-sm dark:bg-[#0a0a0a] dark:border dark:border-[#171717] rounded-xl dark:text-white/80",
        cancelButton:
          "bg-white text-black hover:bg-gray-300 dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#2a2a2a]",
      },
    });

    if (!confirmed.isConfirmed) return;

    try {
      await $fetch<any>(`${apiBase()}/api/stations/${stationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });

      stations.value = stations.value.filter((s) => s.stationId !== stationId);
      toast.success("Station deleted successfully");
    } catch (e) {
      console.error("Failed to delete station:", e);
      toast.error("Failed to delete station");
      throw e;
    }
  }

  async function fetchNearbyStations(
    lat: number,
    lng: number,
    distanceKm: number = 10, // ── Default search radius in kilometers ──────────
  ) {
    try {
      const data = await $fetch<{
        success: boolean;
        count: number;
        data: any[];
      }>(`${apiBase()}/api/stations/radius/${lat}/${lng}/${distanceKm}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      stations.value = data.data;
    } catch (e) {
      console.error("Failed to fetch nearby stations:", e);
    }
  }

  async function startCharge(station: Station, plate: string) {
    if (station.state === "unavailable") return;

    try {
      const res = await $fetch<any>(`${apiBase()}/api/usage/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: { stationId: station.stationId, plate: plate },
      });
      console.log(res);
      toast.success("Station started charging");
      station.state = "unavailable";
      stations.value = stations.value.map((s) =>
        s.stationId === station.stationId ? { ...s, state: "unavailable" } : s,
      );
      return res;
    } catch (e) {
      console.error("Failed to start charge:", e);
      toast.error("Failed to start charge");
    }
  }

  async function stopCharge(usageId: string, stationId: string) {
    try {
      const res = await $fetch<any>(`${apiBase()}/api/usage/${usageId}/end`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
      console.log(res);

      stations.value = stations.value.map((s) =>
        s.stationId === stationId ? { ...s, state: "available" } : s,
      );
      toast.success("Station stopped charging");
    } catch (e) {
      console.error("Failed to stop charge:", e);
      toast.error("Failed to stop charge");
    }
  }

  return {
    stations,
    isLoaded,
    fetchStations,
    fetchNearbyStations,
    createStation,
    deleteStation,
    getCompanyStations,
    startCharge,
    stopCharge,
  };
});

// remember to add fetchNearbyStations to the return object
