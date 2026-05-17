// stores/usage.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const useUsageStore = defineStore("usage", () => {
  const usages = ref<any[]>([]);
  const isLoaded = ref(false);

  const token = () => useCookie("token").value;
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  async function fetchUserActiveUsages(userId: string, page = 1, limit = 20) {
    try {
      const tokenValue = token();
      if (!tokenValue) return;

      const res = await $fetch<PaginatedResponse<any>>(
        `${apiBase()}/api/usages?userId=${userId}&active=true&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${tokenValue}` },
        },
      );
      usages.value = res.data;
      isLoaded.value = true;
    } catch (e) {
      console.error("Failed to fetch user active usages:", e);
    }
  }

  async function fetchUserUsages(userId: string, page = 1, limit = 20) {
    try {
      const tokenValue = token();
      if (!tokenValue) return;

      const res = await $fetch<PaginatedResponse<any>>(
        `${apiBase()}/api/usages?userId=${userId}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${tokenValue}` },
        },
      );
      usages.value = res.data;
      isLoaded.value = true;
    } catch (e) {
      console.error("Failed to fetch user usages:", e);
    }
  }

  return {
    usages,
    isLoaded,
    fetchUserActiveUsages,
    fetchUserUsages,
  };
});
