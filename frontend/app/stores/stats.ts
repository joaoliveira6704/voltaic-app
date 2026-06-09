import { defineStore } from "pinia";

export interface LandingStats {
  totalUsers: number;
  totalStations: number;
  totalCompanies: number;
  totalCompletedUsages: number;
}

export const useStatsStore = defineStore("stats", () => {
  const landingStats = ref<LandingStats | null>(null);

  async function fetchLandingStats() {
    if (landingStats.value) return;
    const { api } = useApi();
    landingStats.value = await api<LandingStats>("/api/stats");
  }

  return { landingStats, fetchLandingStats };
});
