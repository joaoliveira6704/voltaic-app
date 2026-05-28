// stores/user.ts
import { useColorMode } from "@vueuse/core";
import { toast } from "vue-sonner";
import { defineStore } from "pinia";
import Swal from "sweetalert2";
import type { Usage } from "~/types/usage";

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password?: string;
  currentPassword?: string;
  newPassword?: string;
  companyName?: string;
  role: "client" | "worker" | "company-manager" | "admin";
  vehicles?: Vehicle[];
  chargingHistory?: Usage[];
  preferences?: Preferences;
}

export interface Preferences {
  darkMode: boolean;
  language: "en" | "pt" | "es";
  hidePlates: boolean;
}

interface Vehicle {
  plate: string;
  model: string;
  slug: string;
  color: string;
  connector: string;
}

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const isLoaded = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const chargingHistory = ref<any[] | null>(null);
  const favoriteStations = ref<any[]>([]);
  const dashboardStats = ref(null);
  const colorMode = useColorMode();
  const { setLocale, setLocaleCookie } = useI18n();

  const { api } = useApi();

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

  const getUserById = (userId: string) => {
    return (
      users.value.find((u) => u.userId === userId)?.username || "Unknown User"
    );
  };
  // ── Actions ───────────────────────────────────────────────────────────────

  async function fetchUsers(
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
      const data = await api<PaginatedResponse<User>>(
        `/api/users?${query}`,
      );
      users.value = data.data;
      currentPage.value = data.page;
      totalPages.value = data.pages;
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  }

  async function createUser(user: User) {
    try {
      const res = await api<{ userId: string }>("/api/users", {
        method: "POST",
        headers: { Authorization: `Bearer ${useCookie("token").value}` },
        body: user,
      });
      users.value.push({ ...user, userId: res.userId });
      return res;
    } catch (e) {
      console.error("Failed to add user:", e);
      throw e.data;
    }
  }

  async function deleteUser(userId: string, username: string) {
    if (userId == currentUser.value?.userId) {
      toast.error("Cannot delete current user", {
        description: "You cannot delete your own account.",
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: "Confirm Delete",
      text: `You are about to delete the following user: ${username}`,
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
      await api(`/api/users/${userId}`, { method: "DELETE" });
      toast.success("User deleted", {
        description: `@${username} has been deleted successfully.`,
      });
      users.value = users.value.filter((user) => user.userId !== userId);
    } catch (e) {
      toast.error("Cannot delete current user", {
        description: "There was an error deleting the user.",
      });

      throw e;
    }
  }

  async function fetchDashboardStats() {
    try {
      const data = await api<{ total: number }>("/api/users?view=dashboard");
      dashboardStats.value = data;
    } catch (e) {
      console.error("Failed to fetch user dashboard stats:", e);
    }
  }

  async function fetchCurrentUser() {
    try {
      const data = await api<User>("/api/users/me");
      currentUser.value = data;

      colorMode.preference = data.preferences?.darkMode ? "dark" : "light";

      if (data.preferences?.language) {
        await setLocale(data.preferences.language);
        await setLocaleCookie(data.preferences.language);
      }
    } catch (e) {
      console.error("Failed to fetch user:", e);
      currentUser.value = null;
    } finally {
      isLoaded.value = true;
    }
  }

  async function editUserProfile(
    changes: Partial<
      Pick<
        User,
        | "firstName"
        | "lastName"
        | "username"
        | "email"
        | "newPassword"
        | "currentPassword"
        | "preferences"
      > & {
        currentPassword: string;
        newPassword: string;
      }
    >,
  ) {
    try {
      await api("/api/users/me", {
        method: "PATCH",
        body: changes,
      });

      if (changes.preferences && currentUser.value) {
        currentUser.value.preferences = changes.preferences;
      } else {
        fetchUserProfile();
      }

      if (changes.preferences?.language) {
        await setLocale(changes.preferences.language);
      }

      toast.success("Changes Applied Successfully");
    } catch (e) {
      toast.error("Error Applying Changes: " + e);
    }
  }

  async function fetchUserProfile() {
    isLoaded.value = false;
    console.log("fetching profile");
    try {
      const data = await api<User>("/api/users/me?profile=true");
      currentUser.value = data;
      console.log(data);

      colorMode.preference = data.preferences?.darkMode ? "dark" : "light";

      if (data.preferences?.language) {
        await setLocale(data.preferences.language);
        await setLocaleCookie(data.preferences.language);
      }
    } catch (e) {
      toast.error("Failed to fetch profile");
    } finally {
      isLoaded.value = true;
    }
  }

  async function editUser(userId: string, payload: Partial<User>) {
    try {
      await api(`/api/users/${userId}`, {
        method: "PATCH",
        body: payload,
      });
      toast.success("User updated", {
        description: "User updated successfully.",
      });
    } catch (e) {
      toast.error("Failed to edit user", {
        description: `There was an error editing the user: ${e}`,
      });
    }
  }

  async function editUserRole(
    userId: string,
    role: "client" | "worker" | "company-manager" | "admin",
  ) {
    if (userId === currentUser.value?.userId) {
      toast.error("Cannot edit own role", {
        description: "You cannot edit your own role.",
      });
      return;
    }
    try {
      await api(`/api/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      });
      toast.success("User Role updated", {
        description: "User Role updated successfully.",
      });
      users.value = users.value.map((user) =>
        user.userId === userId ? { ...user, role } : user,
      );
    } catch (e) {
      toast.error("Failed to edit user role", {
        description: `There was an error editing the user role: ${e}`,
      });
    }
  }

  async function fetchChargingHistory(page = 1, limit = 20) {
    const userId = currentUser.value?.userId;
    if (!userId) return;
    try {
      const data = await api<PaginatedResponse<any>>(
        `/api/usages?userId=${userId}&page=${page}&limit=${limit}`,
      );
      chargingHistory.value = data.data;
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
      customClass: {
        popup:
          " text-sm dark:bg-[#0a0a0a] dark:border dark:border-[#171717] rounded-xl dark:text-white/80",
        cancelButton:
          "bg-white text-black hover:bg-gray-300 dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#2a2a2a]",
      },
    });

    if (!confirmed.isConfirmed) return;

    if (!currentUser.value || !currentUser.value.vehicles) return;

    const updatedList = currentUser.value.vehicles.filter(
      (v) => v.plate !== plate,
    );

    currentUser.value = { ...currentUser.value, vehicles: updatedList };

    try {
      await api(`/api/users/me/vehicles/${plate}`, { method: "DELETE" });
      toast.success("Vehicle deleted", {
        description: `Vehicle with plate:${plate} has been deleted successfully.`,
      });
      currentUser.value.vehicles = updatedList;
    } catch (e) {
      console.error("Failed to sync deletion:", e);
      toast.error("Failed to delete vehicle", {
        description: `Vehicle with plate:${plate} could not be deleted.`,
      });
    }
  }

  async function addVehicle(vehicle: Vehicle) {
    console.log("adding vehicle: ", vehicle);
    if (!currentUser.value) return;
    let updatedList;
    try {
      await api("/api/users/me/vehicles", {
        method: "POST",
        body: { ...vehicle },
      });

      updatedList = [...(currentUser.value.vehicles ?? []), vehicle];

      // Optimistic update
      currentUser.value = { ...currentUser.value, vehicles: updatedList };
      toast.success("Vehicle added", {
        description: `Vehicle has been added successfully.`,
      });
    } catch (e) {
      console.error("Failed to sync new vehicle:", e);
      // Roll back on failure
      toast.error("Failed to add vehicle", {
        description: `There was an error adding the vehicle.`,
      });
      currentUser.value.vehicles = updatedList;
      throw e; // re-throw so the modal can surface the error
    }
  }

  async function addFavorite(stationId: string) {
    try {
      const data = await api<string[]>("/api/users/me/favorites", {
        method: "POST",
        body: { stationId },
      });
      if (currentUser.value) {
        currentUser.value = { ...currentUser.value, favorites: data };
      }
      toast.success("Added to favorites");
    } catch (e) {
      toast.error("Failed to add favorite");
      throw e;
    }
  }

  async function removeFavorite(stationId: string) {
    const confirmed = await Swal.fire({
      title: "Confirm Delete",
      text: 'Are you sure you want to remove this station from your favorites?',
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

    if (!confirmed.isConfirmed) return false;

    try {
      const data = await api<string[]>(
        `/api/users/me/favorites/${stationId}`,
        { method: "DELETE" },
      );
      if (currentUser.value) {
        currentUser.value = { ...currentUser.value, favorites: data };
      }
      toast.success("Removed from favorites");
      return true;
    } catch (e) {
      toast.error("Failed to remove favorite");
      throw e;
    }
  }

  async function fetchFavoriteStations() {
    try {
      const data = await api<any[]>("/api/users/me/favorites/stations");
      favoriteStations.value = data;
    } catch (e) {
      console.error("Failed to fetch favorite stations:", e);
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
      input: "checkbox",
      inputValue: 0,
      inputPlaceholder: "Remove all sessions",
      inputAttributes: {
        style: "accent-color:#00c885;background:transparent",
      },
      customClass: {
        popup:
          " text-sm dark:bg-[#0a0a0a] dark:border dark:border-[#171717] rounded-xl dark:text-white/80",
        cancelButton:
          "bg-white text-black hover:bg-gray-300 dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#2a2a2a]",
        inputLabel:
          "text-xs text-gray-500 dark:text-white/50 ml-2",
      },
    });

    if (result.isConfirmed) {
      const refreshToken = useCookie("refreshToken").value;

      if (refreshToken) {
        try {
          await api("/api/auth/logout", {
            method: "POST",
            body: { refreshToken },
          });
        } catch {
          // Silently ignore — we clear cookies anyway
        }
        if (result.value) {
          try {
            await api("/api/auth/logout-all", { method: "POST" });
          } catch {
            // Silently ignore
          }
        }
      }

      // Clear cookies
      useCookie("user").value = null;
      useCookie("token").value = null;
      useCookie("refreshToken").value = null;

      // Clear state
      currentUser.value = null;

      window.location.href = "/login";
    }
  }

  return {
    currentUser,
    isLoaded,
    dashboardStats,
    chargingHistory,
    userRole,
    currentPage,
    totalPages,
    displayItems,
    fetchCurrentUser,
    fetchDashboardStats,
    fetchChargingHistory,
    deleteVehicle,
    confirmLogout,
    addVehicle,
    editUserProfile,
    fetchUsers,
    users,
    createUser,
    getUserById,
    deleteUser,
    editUser,
    editUserRole,
    addFavorite,
    removeFavorite,
    favoriteStations,
    fetchUserProfile,
    fetchFavoriteStations,
  };
});
