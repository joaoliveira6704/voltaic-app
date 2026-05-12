// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";

interface Company {
  companyId: string;
  name: string;
}

export const useCompanyStore = defineStore("company", () => {
  const companies = ref<Company[]>([]);
  const currentCompany = ref<Company | undefined>(undefined);
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

  async function deleteCompany(companyId: string, companyName: string) {
    const confirmed = await Swal.fire({
      title: "Confirm Delete",
      text: `You are about to delete the following company: ${companyName}`,
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
      await $fetch<any>(`${apiBase()}/api/companies/${companyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });

      companies.value = companies.value.filter(
        (c) => c.companyId !== companyId,
      );
      toast.success("Company deleted successfully");
    } catch (e) {
      console.error("Failed to delete company:", e);
      toast.error("Failed to delete company");
      throw e;
    }
  }

  async function fetchCurrentCompany() {
    try {
      const response = await $fetch<any>(`${apiBase()}/api/users/me/company`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      currentCompany.value = response;
      isLoaded.value = true;
    } catch (e) {
      console.error("Failed to get user company:", e);
    }
  }

  async function createCompany(company: any) {
    try {
      const response = await $fetch<any>(`${apiBase()}/api/companies`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: company,
      });

      // Use the response from the server which contains the real DB object
      companies.value.push(response);
      toast.success("Station added successfully");
      return response;
    } catch (e) {
      console.error("Failed to add station:", e);
      toast.error("Failed to add station");
      throw e;
    }
  }

  return {
    companies,
    isLoaded,
    fetchCompanies,
    getCompanyName,
    deleteCompany,
    createCompany,
    fetchCurrentCompany,
    currentCompany,
  };
});
