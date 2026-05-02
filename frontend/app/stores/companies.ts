// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";

interface Company {
  companyId: string;
  name: string;
}

export const useCompanyStore = defineStore("company", () => {
  const companies = ref<Company[]>([]);
  const isLoaded = ref(false);

  // ── Getters ──────────────────────────────────────────────────────────────

  const getCompanyName = computed(() => {
    return (companyId: string) =>
      companies.value.find((c) => c.companyId === companyId)?.name ?? "UNKNOWN";
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Call composables lazily inside actions, not at store setup time
  const token = () => useCookie("token").value;
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchCompanies() {
    try {
      const data = await $fetch<Company[]>(`${apiBase()}/api/companies`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      companies.value = data;
    } catch (e) {
      console.error("Failed to fetch companies:", e);
    }
  }

  return {
    companies,
    isLoaded,
    fetchCompanies,
    getCompanyName,
  };
});
