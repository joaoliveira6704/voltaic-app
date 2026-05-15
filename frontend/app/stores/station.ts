// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { toast } from "vue-sonner";
import type { Station } from "~/types/station";

export const useStationStore = defineStore("station", () => {
  const stations = shallowRef([]);
  const companyStations = shallowRef([]);
  const currentStation = ref(null);
  const isLoaded = ref(false);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const token = useCookie("token");
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchStations(limit?: number, offset?: number) {
    try {
      let url = `${apiBaseUrl}/api/stations`;
      if (limit !== undefined) url += `?limit=${limit}&offset=${offset ?? 0}`;
      const data = await $fetch<Station[]>(url, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      stations.value = data;
    } catch (e) {
      console.error("Failed to fetch stations:", e);
    }
  }

  async function fetchCompanyStations() {
    try {
      const data = await $fetch<Station[]>(
        `${apiBaseUrl}/api/stations/company`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );
      companyStations.value = data;
    } catch (e) {
      console.error("Failed to fetch company stations:", e);
    }
  }

  async function createStation(station: Station) {
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

      const response = await $fetch<any>(`${apiBaseUrl}/api/stations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token.value}` },
        body: payload,
      });

      // Use the response from the server which contains the real DB object
      stations.value = [...stations.value, response];
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
      await $fetch<any>(`${apiBaseUrl}/api/stations/${stationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token.value}` },
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
        data: Station[];
      }>(`${apiBaseUrl}/api/stations/radius/${lat}/${lng}/${distanceKm}`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      stations.value = data.data;
    } catch (e) {
      console.error("Failed to fetch nearby stations:", e);
    }
  }

  async function startCharge(station: Station, plate: string) {
    if (station.state === "unavailable") return;

    try {
      const res = await $fetch<any>(`${apiBaseUrl}/api/usage/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token.value}` },
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
      const res = await $fetch<any>(`${apiBaseUrl}/api/usage/${usageId}/end`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token.value}` },
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

  async function fetchStationById(id: string) {
    try {
      const res = await $fetch<any>(`${apiBaseUrl}/api/stations/${id}`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      currentStation.value = res;
      isLoaded.value = true;
    } catch (e) {
      console.error("Failed to fetch station by id:", e);
      toast.error("Failed to fetch station by id");
    }
  }

  async function executeCommand(id: string, command: string) {
    try {
      const res = await $fetch<any>(
        `${apiBaseUrl}/api/stations/${id}/execute`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token.value}` },
          body: { command },
        },
      );
      console.log(res);
      toast.success("Command executed successfully");
    } catch (e) {
      console.error("Failed to execute station command:", e);
      toast.error("Failed to execute station command");
    }
  }

  return {
    stations,
    companyStations,
    isLoaded,
    fetchStations,
    fetchCompanyStations,
    fetchNearbyStations,
    createStation,
    deleteStation,
    startCharge,
    stopCharge,
    fetchStationById,
    executeCommand,
    currentStation,
  };
});

// remember to add fetchNearbyStations to the return object
