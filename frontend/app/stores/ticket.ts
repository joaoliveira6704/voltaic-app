import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { toast } from "vue-sonner";
import type { Ticket, PaginatedResponse } from "@/types/ticket";

interface CreateTicketPayload {
  stationId?: string;
  title: string;
  description: string;
  remarks?: string;
  status?: string;
}

interface UpdateTicketPayload {
  title?: string;
  description?: string;
  remarks?: string;
  status?: string;
}

export const useTicketStore = defineStore("ticket", () => {
  const tickets = ref<Ticket[]>([]);
  const isLoaded = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const total = ref(0);
  const dashboardStats = ref(null);

  const token = () => useCookie("token").value;
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  async function fetchDashboardStats() {
    try {
      const data = await $fetch<any>(
        `${apiBase()}/api/tickets?view=dashboard`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      dashboardStats.value = data;
    } catch (e) {
      console.error("Failed to fetch ticket dashboard stats:", e);
    }
  }

  async function fetchTickets(page = 1, limit = 20, params: Record<string, string> = {}) {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...params,
      });
      const data = await $fetch<PaginatedResponse<Ticket>>(
        `${apiBase()}/api/tickets?${query}`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      tickets.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
      total.value = data.total;
    } catch (e) {
      console.error("Failed to fetch tickets:", e);
    }
  }

  async function fetchMyTickets(page = 1, limit = 5, params: Record<string, string> = {}) {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...params,
      });
      const data = await $fetch<PaginatedResponse<Ticket>>(
        `${apiBase()}/api/users/me/tickets?${query}`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      tickets.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
      total.value = data.total;
    } catch (e) {
      console.error("Failed to fetch my tickets:", e);
    }
  }

  async function fetchCompanyTickets(page = 1, limit = 5, params: Record<string, string> = {}) {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...params,
      });
      const data = await $fetch<PaginatedResponse<Ticket>>(
        `${apiBase()}/api/users/me/company/tickets?${query}`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      tickets.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
      total.value = data.total;
    } catch (e) {
      console.error("Failed to fetch company tickets:", e);
    }
  }

  async function fetchStationTickets(stationId: string, page = 1, limit = 1) {
    try {
      const data = await $fetch<PaginatedResponse<Ticket>>(
        `${apiBase()}/api/stations/${stationId}/tickets?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token()}` },
        },
      );
      tickets.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
      total.value = data.total;
    } catch (e) {
      console.error("Failed to fetch station tickets:", e);
    }
  }

  async function createTicket(payload: CreateTicketPayload) {
    try {
      const data = await $fetch<{ ticketId: string }>(
        `${apiBase()}/api/tickets`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
          },
          body: payload,
        },
      );
      toast.success("Ticket created successfully");
      return data;
    } catch (e) {
      console.error("Failed to create ticket:", e);
      toast.error("Failed to create ticket");
      throw e;
    }
  }

  async function updateTicket(ticketId: string, payload: UpdateTicketPayload) {
    try {
      const data = await $fetch<Ticket>(
        `${apiBase()}/api/tickets/${ticketId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
          },
          body: payload,
        },
      );
      tickets.value = tickets.value.map((t) =>
        t.ticketId === ticketId ? { ...t, ...data } : t,
      );
      toast.success("Ticket updated successfully");
      return data;
    } catch (e) {
      console.error("Failed to update ticket:", e);
      toast.error("Failed to update ticket");
      throw e;
    }
  }

  async function deleteTicket(ticketId: string, ticketTitle: string) {
    const confirmed = await Swal.fire({
      title: "Confirm Delete",
      text: `You are about to delete the following ticket: ${ticketTitle}`,
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
      await $fetch(`${apiBase()}/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });

      tickets.value = tickets.value.filter((t) => t.ticketId !== ticketId);
      toast.success("Ticket deleted successfully");
    } catch (e) {
      console.error("Failed to delete ticket:", e);
      toast.error("Failed to delete ticket");
      throw e;
    }
  }

  return {
    tickets,
    isLoaded,
    currentPage,
    totalPages,
    total,
    dashboardStats,
    fetchTickets,
    fetchDashboardStats,
    fetchMyTickets,
    fetchCompanyTickets,
    fetchStationTickets,
    createTicket,
    updateTicket,
    deleteTicket,
  };
});
