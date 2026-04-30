// stores/user.ts
import { defineStore } from "pinia";
import Swal from "sweetalert2";

interface User {
  userId: string;
  username: string;
  role: "client" | "worker" | "company" | "admin";
  vehicles: Vehicle[];
  assignedTickets?: any[];
  tickets?: any[];
}

interface Vehicle {
  plate: string;
  model: string;
  slug: string;
  color: string;
  connector: string;
}

export const useUserStore = defineStore("user", () => {
  const currentUser = ref<User | null>(null);
  const chargingHistory = ref<any[] | null>(null);

  // ── Getters ──────────────────────────────────────────────────────────────

  const userRole = computed(() => currentUser.value?.role);

  const displayItems = computed(() => {
    const user = currentUser.value;
    if (!user) return [];
    if (userRole.value === "client") return user.vehicles || [];
    if (userRole.value === "worker") return user.assignedTickets || [];
    if (["company", "admin"].includes(userRole.value ?? ""))
      return user.tickets || [];
    return [];
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Call composables lazily inside actions, not at store setup time
  const token = () => useCookie("token").value;
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchCurrentUser() {
    try {
      currentUser.value = await $fetch<User>(`${apiBase()}/api/users/me`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
    } catch (e) {
      console.error("Failed to fetch user:", e);
      currentUser.value = null;
    }
  }

  async function fetchChargingHistory() {
    const userId = currentUser.value?.userId;
    if (!userId) return;
    try {
      chargingHistory.value = await $fetch(
        `${apiBase()}/api/usage/user/${userId}`,
        { headers: { Authorization: `Bearer ${token()}` } },
      );
    } catch (e) {
      console.error("Failed to fetch charging history:", e);
      chargingHistory.value = [];
    }
  }

  async function deleteVehicle(plate: string) {
    const confirmed = await Swal.fire({
      title: "Confirm Delete",
      text: `You are about to delete the following vehicle: ${plate}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Delete",
      reverseButtons: true,
      background: "#ffffff",
      customClass: {
        popup: "font-mono text-sm",
        cancelButton: "bg-white text-black hover:bg-gray-300",
      },
    });

    if (!confirmed.isConfirmed) return;

    if (!currentUser.value || !currentUser.value.vehicles) return;

    const updatedList = currentUser.value.vehicles.filter(
      (v) => v.plate !== plate,
    );

    currentUser.value = { ...currentUser.value, vehicles: updatedList };

    try {
      await $fetch(`${apiBase()}/api/users/me/vehicles/${plate}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
    } catch (e) {
      console.error("Failed to sync deletion:", e);
      await fetchCurrentUser();
    }
  }

  async function addVehicle(vehicle: Vehicle) {
    if (!currentUser.value) return;

    try {
      await $fetch(`${apiBase()}/api/users/me/vehicles`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: { ...vehicle },
      });

      const updatedList = [...(currentUser.value.vehicles ?? []), vehicle];

      // Optimistic update
      currentUser.value = { ...currentUser.value, vehicles: updatedList };
    } catch (e) {
      console.error("Failed to sync new vehicle:", e);
      // Roll back on failure
      await fetchCurrentUser();
      throw e; // re-throw so the modal can surface the error
    }
  }

  async function confirmLogout() {
    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Logout",
      reverseButtons: true,
      background: "#ffffff",
      customClass: {
        popup: "font-mono text-sm",
        cancelButton: "bg-white text-black hover:bg-gray-300",
      },
    });

    if (result.isConfirmed) {
      // Clear cookies
      useCookie("user").value = null;
      useCookie("token").value = null;

      // Clear state
      currentUser.value = null;

      await navigateTo("/login");
    }
  }

  return {
    currentUser,
    chargingHistory,
    userRole,
    displayItems,
    fetchCurrentUser,
    fetchChargingHistory,
    deleteVehicle,
    confirmLogout,
    addVehicle,
  };
});
