// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { toast } from "vue-sonner";
import type { Station } from "~/types/station";

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const useStationStore = defineStore("station", () => {
  const { api } = useApi();
  const stations = shallowRef([]);
  const companyStations = shallowRef([]);
  const currentStation = ref(null);
  const isLoaded = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const dashboardStats = ref(null);

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchStations(page = 1, limit = 20, params: Record<string, string> = {}) {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...params,
      });
      const data = await api<PaginatedResponse<Station>>(
        `/api/stations?${query}`,
      );
      stations.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
    } catch (e) {
      console.error("Failed to fetch stations:", e);
    }
  }

  async function fetchDashboardStats() {
    try {
      const data = await api<any>("/api/stations?view=dashboard");
      dashboardStats.value = data;
    } catch (e) {
      console.error("Failed to fetch station dashboard stats:", e);
    }
  }

  async function fetchCompanyStations() {
    try {
      const data = await api<Station[]>("/api/users/my_company/stations");
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
      const payload = {
        ...station,
        telemetry,
      };

      const response = await api<any>("/api/stations", {
        method: "POST",
        body: payload,
      });

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
      await api(`/api/stations/${stationId}`, { method: "DELETE" });

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
    distanceKm: number = 10,
  ) {
    try {
      const data = await api<Station[]>(
        `/api/stations?near=${lat},${lng}&maxDistance=${distanceKm}`,
      );
      stations.value = data;
      currentPage.value = 1;
      totalPages.value = 1;
    } catch (e) {
      console.error("Failed to fetch nearby stations:", e);
    }
  }

  async function startCharge(station: Station, plate: string) {
    if (station.state === "unavailable") return;

    try {
      const res = await api<any>("/api/usages", {
        method: "POST",
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
      const res = await api<any>(`/api/usages/${usageId}`, {
        method: "PATCH",
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
      const res = await api<any>(`/api/stations/${id}`);
      currentStation.value = res;
      isLoaded.value = true;
    } catch (e) {
      console.error("Failed to fetch station by id:", e);
      toast.error("Failed to fetch station by id");
    }
  }

  async function executeCommand(id: string, command: string) {
    try {
      const res = await api<any>(`/api/stations/${id}/execute`, {
        method: "POST",
        body: { command },
      });
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
    currentPage,
    totalPages,
    dashboardStats,
    fetchStations,
    fetchDashboardStats,
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
