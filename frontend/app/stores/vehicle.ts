// stores/vehicle.ts
import { defineStore } from "pinia";

interface ChargePort {
  kind: string;
  connector: string;
  location?: {
    side: string;
    position: string;
  };
}

interface CatalogVehicle {
  _id: string;
  unique_code: string;
  make: { slug: string; name: string };
  model: { slug: string; name: string };
  year: number;
  variant?: { slug: string; name: string; kind: string };
  charge_ports: ChargePort[];
  vehicle_type: string;
  availability?: { status: string; start_year: number };
  [key: string]: any;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const useVehicleStore = defineStore("vehicle", () => {
  const vehicles = ref<CatalogVehicle[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;
  const token = () => useCookie("token").value;

  vehicles.value = [];

  async function fetchVehicles(page = 1, limit = 50) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<PaginatedResponse<CatalogVehicle>>(
        `${apiBase()}/api/vehicles?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      vehicles.value = data.data;
    } catch (e) {
      console.error("Failed to fetch vehicle catalog:", e);
      error.value = "Failed to load vehicle catalog.";
      vehicles.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return { vehicles, isLoading, error, fetchVehicles };
});
