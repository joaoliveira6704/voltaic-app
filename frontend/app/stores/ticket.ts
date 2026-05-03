// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";

export const useTicketStore = defineStore("ticket", () => {
    const tickets = ref([]);
    const isLoaded = ref(false);

    // ── Getters ──────────────────────────────────────────────────────────────

    // ── Helpers ───────────────────────────────────────────────────────────────

    // Call composables lazily inside actions, not at store setup time
    const token = () => useCookie("token").value;
    const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

    // ── Actions ───────────────────────────────────────────────────────────────

    async function fetchTickets() {
        try {
            const data = await $fetch<any[]>(`${apiBase()}/api/tickets`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            tickets.value = data;
        } catch (e) {
            console.error("Failed to fetch tickets:", e);
        }
    }

    return {
        tickets,
        isLoaded,
        fetchTickets,
    };
});
