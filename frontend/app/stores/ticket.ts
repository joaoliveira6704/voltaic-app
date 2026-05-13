// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import { toast } from "vue-sonner";

export const useTicketStore = defineStore("ticket", () => {
    const tickets = ref([]);
    const isLoaded = ref(false);

    // ── Getters ──────────────────────────────────────────────────────────────

    // ── Helpers ───────────────────────────────────────────────────────────────

    // Call composables lazily inside actions, not at store setup time
    const token = () => useCookie("token").value;
    const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

    // ── Actions ───────────────────────────────────────────────────────────────

    async function fetchTickets(limit?: number, offset?: number) {
        try {
            let url = `${apiBase()}/api/tickets`;
            if (limit !== undefined) url += `?limit=${limit}&offset=${offset ?? 0}`;
            const data = await $fetch<any[]>(url, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            tickets.value = data;
        } catch (e) {
            console.error("Failed to fetch tickets:", e);
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
                popup: " text-sm dark:bg-[#0a0a0a] dark:border dark:border-[#171717] rounded-xl dark:text-white/80",
                cancelButton:
                    "bg-white text-black hover:bg-gray-300 dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#2a2a2a]",
            },
        });

        if (!confirmed.isConfirmed) return;

        try {
            await $fetch<any>(`${apiBase()}/api/tickets/${ticketId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            });

            tickets.value = tickets.value.filter(
                (t) => t.ticketId !== ticketId,
            );
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
        fetchTickets,
        deleteTicket,
    };
});
