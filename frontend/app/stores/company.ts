// stores/company.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Company {
  companyId: string;
  name: string;
  memberCount?: number;
}

interface Group {
  groupId: string;
  name: string;
}

export const useCompanyStore = defineStore("company", () => {
  const companies = ref<Company[]>([]);
  const currentCompany = ref<Company | undefined>(undefined);
  const isLoaded = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const dashboardStats = ref(null);

  function getCompanyName(companyId: string) {
    return (
      companies.value.find((c) => c.companyId === companyId)?.name ?? "UNKNOWN"
    );
  }

  const token = () => useCookie("token").value;
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  async function fetchDashboardStats() {
    try {
      const data = await $fetch<any>(
        `${apiBase()}/api/companies?view=dashboard`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      dashboardStats.value = data;
    } catch (e) {
      console.error("Failed to fetch company dashboard stats:", e);
    }
  }

  async function fetchCompanies(
    page = 1,
    limit = 20,
    params: Record<string, string> = {},
  ) {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...params,
      });
      const data = await $fetch<PaginatedResponse<Company>>(
        `${apiBase()}/api/companies?${query}`,
        { headers: { Authorization: `Bearer ${token()}` } },
      );
      companies.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
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
      companies.value.push(response);
      toast.success("Station added successfully");
      return response;
    } catch (e) {
      console.error("Failed to add station:", e);
      toast.error("Failed to add station");
      throw e;
    }
  }

  // ── Group Assignment ───────────────────────────────────────────────────────

  async function fetchCompanyGroups(
    companyId: string,
  ): Promise<{ assigned: Group[]; unassigned: Group[] }> {
    const data = await $fetch<{ assigned: Group[]; unassigned: Group[] }>(
      `${apiBase()}/api/companies/${companyId}/groups`,
      { headers: { Authorization: `Bearer ${token()}` } },
    );
    return data;
  }

  async function assignGroup(companyId: string, groupId: string) {
    await $fetch(`${apiBase()}/api/companies/${companyId}/groups/assign`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}` },
      body: { groupId },
    });
  }

  async function unassignGroup(companyId: string, groupId: string) {
    await $fetch(`${apiBase()}/api/companies/${companyId}/groups/unassign`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}` },
      body: { groupId },
    });
  }

  return {
    companies,
    isLoaded,
    currentPage,
    totalPages,
    dashboardStats,
    fetchCompanies,
    fetchDashboardStats,
    getCompanyName,
    deleteCompany,
    createCompany,
    fetchCurrentCompany,
    currentCompany,
    fetchCompanyGroups,
    assignGroup,
    unassignGroup,
  };
});
