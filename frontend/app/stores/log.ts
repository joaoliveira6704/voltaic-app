// stores/log.ts
import { defineStore } from "pinia";

export const useLogStore = defineStore("log", () => {
  const logs = ref([]);
  const isLoaded = ref(false);

  // ── Getters ──────────────────────────────────────────────────────────────

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Call composables lazily inside actions, not at store setup time
  const token = () => useCookie("token").value;
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchLogs() {
    try {
      const data = await $fetch<any[]>(`${apiBase()}/api/logs`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      logs.value = data;
    } catch (e) {
      console.error("Failed to fetch logs:", e);
    }
  }

  async function fetchStationLogs(id: string) {
    try {
      const data = await $fetch<any[]>(
        `${apiBase()}/api/logs?stationId=${id}`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      logs.value = data;
    } catch (e) {
      console.error("Failed to fetch station logs:", e);
    }
  }

  return {
    logs,
    isLoaded,
    fetchLogs,
    fetchStationLogs,
  };
});
