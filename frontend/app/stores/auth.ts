// stores/auth.ts
import { defineStore } from "pinia";
import { toast } from "vue-sonner";

type ResetStep = "email" | "sent" | "token" | "password" | "success";

export const useAuthStore = defineStore("auth", () => {
  const apiBase = () => useRuntimeConfig().public.apiBaseUrl;

  // ── State ─────────────────────────────────────────────────────────────────

  const resetStep = ref<ResetStep>("email");
  const resetEmail = ref("");
  const resetToken = ref("");
  const isLoading = ref(false);

  // ── Actions ───────────────────────────────────────────────────────────────

  async function sendRecoveryEmail(email: string) {
    isLoading.value = true;
    try {
      await $fetch(`${apiBase()}/api/auth/forgot-password`, {
        method: "POST",
        body: { email },
      });
      resetEmail.value = email;
      resetStep.value = "sent";
    } catch (e) {
      toast.error("Failed to send recovery email", {
        description: e?.data?.message || "Please try again.",
      });
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function validateToken(token: string) {
    isLoading.value = true;
    try {
      await $fetch(`${apiBase()}/api/auth/reset-password/${token}`, {
        method: "GET",
      });
      resetToken.value = token;
      resetStep.value = "password";
    } catch (e) {
      toast.error("Invalid or expired token", {
        description: e?.data?.message || "Please request a new code.",
      });
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(newPassword: string) {
    isLoading.value = true;
    try {
      await $fetch(`${apiBase()}/api/auth/reset-password`, {
        method: "POST",
        body: { token: resetToken.value, newPassword },
      });
      resetStep.value = "success";
      toast.success("Password updated successfully.");
    } catch (e) {
      toast.error("Failed to reset password", {
        description: e?.data?.message || "Please try again.",
      });
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  function $reset() {
    resetStep.value = "email";
    resetEmail.value = "";
    resetToken.value = "";
    isLoading.value = false;
  }

  return {
    resetStep,
    resetEmail,
    resetToken,
    isLoading,
    sendRecoveryEmail,
    validateToken,
    resetPassword,
    $reset,
  };
});
