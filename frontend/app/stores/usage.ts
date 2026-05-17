// stores/usage.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";

interface Usage {
  usageId: string;
  name: string;
}

export const useUsageStore = defineStore("usage", () => {
  const usages = ref<any[]>([]);
  const isLoaded = ref(false);

  // ── Getters ──────────────────────────────────────────────────────────────

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Call composables lazily inside actions, not at store setup time
  const token = () => useCookie("token").value;
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchUserActiveUsages(userId: string) {
    try {
      const tokenValue = token();
      if (!tokenValue) return;

      const res = await $fetch(
        `${apiBase()}/api/usages?userId=${userId}&active=true`,
        {
          headers: {
            Authorization: `Bearer ${tokenValue}`,
          },
        },
      );
      console.log(res);
      usages.value = res;
      isLoaded.value = true;
    } catch (e) {
      console.error("Failed to fetch user active usages:", e);
    }
  }

  async function fetchUserUsages(userId: string) {
    try {
      const tokenValue = token();
      if (!tokenValue) return;

      const res = await $fetch(`${apiBase()}/api/usages`, {
        query: { userId },
        headers: {
          Authorization: `Bearer ${tokenValue}`,
        },
      });
      console.log(res);
      usages.value = res;
      isLoaded.value = true;
    } catch (e) {
      console.error("Failed to fetch user active usages:", e);
    }
  }

  return {
    usages,
    isLoaded,
    fetchUserActiveUsages,
    fetchUserUsages,
  };
});
