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

interface DashboardData {
  stations: {
    available: number;
    unavailable: number;
    maintenance: number;
    inactive: { stationId: string; name: string }[];
  };
  tickets: {
    open: number;
    closed: number;
    resolved: number;
    unresolved: number;
  };
  usage: {
    thisWeek: number;
    lastWeek: number;
    percentageDelta: number;
  };
  weeklyTotals: {
    weekStart: string;
    total: number;
  }[];
  latestTickets: {
    ticketId: string;
    title: string;
    status: string;
    groupName: string;
    createdAt: string;
  }[];
}

interface WeeklyDrilldown {
  days: {
    date: string;
    groups: {
      groupId: string;
      name: string;
      uses: number;
    }[];
  }[];
}

export const useCompanyStore = defineStore("company", () => {
  const { api } = useApi();
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

  async function fetchDashboardStats() {
    try {
      const data = await api<any>("/api/companies?view=dashboard");
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
      const data = await api<PaginatedResponse<Company>>(
        `/api/companies?${query}`,
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
      await api(`/api/companies/${companyId}`, { method: "DELETE" });
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
      const response = await api<any>("/api/users/my_company");
      currentCompany.value = response;
      isLoaded.value = true;
    } catch (e) {
      console.error("Failed to get user company:", e);
    }
  }

  async function createCompany(company: any) {
    try {
      const response = await api<any>("/api/companies", {
        method: "POST",
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

  async function fetchDashboard(): Promise<DashboardData> {
    /*  return {
      stations: {
        available: 12,
        unavailable: 3,
        maintenance: 2,
        inactive: [{ stationId: "s1", name: "Station A" }],
      },
      tickets: { open: 5, closed: 8, resolved: 12, unresolved: 3 },
      usage: { thisWeek: 45, lastWeek: 32, percentageDelta: 41 },
      weeklyTotals: [
        { weekStart: "2026-05-11", total: 45 },
        { weekStart: "2026-05-04", total: 32 },
        { weekStart: "2026-04-27", total: 28 },
      ],
      latestTickets: [
        {
          ticketId: "t1",
          title: "Station offline",
          status: "open",
          groupName: "Group A",
          createdAt: "2026-05-20T10:00:00Z",
        },
      ],
    }; */
    const data = await api<DashboardData>(
      "/api/companies/me/dashboard",
    );
    return data;
  }

  async function fetchWeekDrilldown(
    weekStart: string,
  ): Promise<WeeklyDrilldown> {
    /*  return {
      days: [
        {
          date: weekStart,
          groups: [{ groupId: "g1", name: "Group A", uses: 12 }],
        },
      ],
    }; */
    const data = await api<WeeklyDrilldown>(
      `/api/companies/me/dashboard/week?start=${weekStart}`,
    );
    return data;
  }

  // ── Group Assignment ───────────────────────────────────────────────────────

  async function fetchCompanyGroups(
    companyId: string,
  ): Promise<{ assigned: Group[]; unassigned: Group[] }> {
    const data = await api<{ assigned: Group[]; unassigned: Group[] }>(
      `/api/companies/${companyId}/groups`,
    );
    return data;
  }

  async function assignGroup(companyId: string, groupId: string) {
    await api(`/api/companies/${companyId}/groups/assign`, {
      method: "PATCH",
      body: { groupId },
    });
  }

  async function unassignGroup(companyId: string, groupId: string) {
    await api(`/api/companies/${companyId}/groups/unassign`, {
      method: "PATCH",
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
    fetchWeekDrilldown,
    fetchDashboard,
  };
});
