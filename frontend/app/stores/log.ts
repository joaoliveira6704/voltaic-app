// stores/log.ts
import { defineStore } from "pinia";

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const useLogStore = defineStore("log", () => {
  const { api } = useApi();
  const logs = ref([]);
  const isLoaded = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);

  async function fetchLogs(page = 1, limit = 50) {
    try {
      const data = await api<PaginatedResponse<any>>(
        `/api/logs?page=${page}&limit=${limit}`,
      );
      logs.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
    } catch (e) {
      console.error("Failed to fetch logs:", e);
    }
  }

  async function fetchStationLogs(id: string, page = 1, limit = 50) {
    try {
      const data = await api<PaginatedResponse<any>>(
        `/api/logs?stationId=${id}&page=${page}&limit=${limit}`,
      );
      logs.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
    } catch (e) {
      console.error("Failed to fetch station logs:", e);
    }
  }

  return {
    logs,
    isLoaded,
    currentPage,
    totalPages,
    fetchLogs,
    fetchStationLogs,
  };
});
