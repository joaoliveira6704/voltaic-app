// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";

export const useStationStore = defineStore("station", () => {
    const stations = ref([]);
    const isLoaded = ref(false);

    // ── Getters ──────────────────────────────────────────────────────────────

    // ── Helpers ───────────────────────────────────────────────────────────────

    // Call composables lazily inside actions, not at store setup time
    const token = () => useCookie("token").value;
    const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

    // ── Actions ───────────────────────────────────────────────────────────────

    async function fetchStations() {
        try {
            const data = await $fetch<any[]>(`${apiBase()}/api/stations`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            stations.value = data;
        } catch (e) {
            console.error("Failed to fetch stations:", e);
        }
    }

    return {
        stations,
        isLoaded,
        fetchStations,
    };
});
