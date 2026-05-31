// stores/auth.ts
import { defineStore } from "pinia";
import { toast } from "vue-sonner";

type ResetStep = "email" | "token" | "password" | "success";

export const useAuthStore = defineStore("auth", () => {
  const { api } = useApi();

  // ── State ─────────────────────────────────────────────────────────────────

  const resetStep = ref<ResetStep>("email");
  const resetEmail = ref("");
  const resetToken = ref("");
  const isLoading = ref(false);

  // ── Actions ───────────────────────────────────────────────────────────────

  async function sendRecoveryEmail(email: string) {
    isLoading.value = true;
    try {
      await api("/api/users/forgot-password", {
        method: "POST",
        body: { email },
      });
      resetEmail.value = email;
      resetStep.value = "token";
    } catch (e) {
      toast.error("Failed to send recovery email", {
        description: e?.data?.message || "Please try again.",
      });
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    isLoading.value = true;
    try {
      await api("/api/users", {
        method: "POST",
        body: {
          username,
          firstName,
          lastName,
          email,
          password,
          role: "client",
        },
      });
      toast.success("Account created successfully.");
    } catch (e: any) {
      if (!e?.data?.details) {
        toast.error("Failed to create account" + (e?.data?.message ? `: ${e.data.message}` : ""));
      }
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function validateResetToken(token: string) {
    isLoading.value = true;
    console.log("authStore: ", token);
    try {
      await api(`/api/users/forgot-password/${token}`, {
        method: "POST",
      });
      console.log("authStore: after fetch");
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
      await api("/api/users/reset-password", {
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
    validateResetToken,
    resetPassword,
    register,
    $reset,
  };
});
