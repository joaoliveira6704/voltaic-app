<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";

const config = useRuntimeConfig();
const email = ref("");
const password = ref("");
const rememberMe = ref(true);
const isSubmitting = ref(false);
const { t } = useI18n();

function setCookie(name: string, value: string | null, maxAge: number | undefined) {
  const cookie = useCookie<string | null>(name, {
    path: "/",
    secure: location.protocol === "https:",
    sameSite: "lax",
    maxAge,
  });
  cookie.value = value;
}

interface LoginResponse {
    status: string;
    data: {
        token: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
    };
}

definePageMeta({
    layout: "landing",
});

useHead({
    title: t("login.title"),
    meta: [
        {
            name: "description",
            content: t("login.description"),
        },
    ],
});

const error = ref("");
const isEmailHighlighted = ref(false);
const isPasswordHighlighted = ref(false);

const handleLogin = async () => {
    if (isSubmitting.value) return;
    isEmailHighlighted.value = false;
    isPasswordHighlighted.value = false;
    if (!email.value || !password.value) {
        let message;
        if (!email.value && password.value) {
            isEmailHighlighted.value = true;
            message = "Email Required";
        } else if (!password.value && email.value) {
            isPasswordHighlighted.value = true;
            message = "Password Required";
        } else {
            isPasswordHighlighted.value = true;
            isEmailHighlighted.value = true;
            message = "Email and Password Required";
        }
        toast.error(message);
        return;
    }
    isSubmitting.value = true;
    console.log("Login attempt:", { email: email.value });

    try {
        const response = await $fetch<LoginResponse>(
            `${config.public.apiBaseUrl}/api/users/login`,
            {
                method: "POST",
                body: {
                    email: email.value,
                    password: password.value,
                },
            },
        );

        console.log("Login successful:", response);

        const maxAge = rememberMe.value ? 86400 * 30 : undefined;
        setCookie("token", response.data.token, maxAge);
        setCookie("refreshToken", response.data.refreshToken, maxAge);
        setCookie("user", JSON.stringify(response.data.user), maxAge);

        await navigateTo("/profile");
    } catch (err: unknown) {
        console.error("Login failed:", err);

        const errorData = err as {
            message?: string;
            data?: { message?: string };
        };

        error.value =
            errorData?.data?.message || errorData?.message || "Login failed";

        toast.error("Login Error", {
            description: error.value,
        });

        isPasswordHighlighted.value = true;
        isEmailHighlighted.value = true;
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div
        class="w-full flex flex-col items-center justify-center py-12 md:py-24 px-4"
    >
        <div class="flex items-end gap-1 mb-10 select-none">
            <NuxtImg src="/voltaic-logo.png" width="150" />
        </div>

        <form
            class="w-full max-w-[400px] rounded-xl border border-gray-100 bg-white dark:bg-[#0a0a0a] dark:border-[#232323] dark:text-white/50 p-6 shadow-sm md:p-10 space-y-6"
            @submit.prevent="handleLogin"
        >
            <!-- Email Field -->
            <div class="space-y-2">
                <Label for="email" class="text-xs font-bold uppercase">
                    {{ t("login.email") }}
                </Label>
                <Input
                    id="email"
                    v-model="email"
                    type="email"
                    :placeholder="t('login.emailPlaceholder')"
                    class="h-11 border-gray-200 dark:border-[#232323] focus-visible:ring-[#00c885]"
                    :disabled="isSubmitting"
                    :class="isEmailHighlighted ? '!border-red-500' : ''"
                />
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <Label for="password" class="text-xs font-bold uppercase">
                        {{ t("login.password") }}
                    </Label>
                    <NuxtLink
                        to="/recover-password"
                        class="text-[10px] text-[#007bff] hover:underline uppercase"
                    >
                        {{ t("login.forgot") }}
                    </NuxtLink>
                </div>
                <Input
                    id="password"
                    v-model="password"
                    type="password"
                    placeholder="••••••••"
                    class="h-11 border-gray-200 dark:border-[#232323] focus-visible:ring-[#00c885]"
                    :disabled="isSubmitting"
                    :class="isPasswordHighlighted ? '!border-red-500' : ''"
                />
            </div>

            <!-- Remember Me Section -->
            <div class="flex items-start gap-3 pt-2">
                <Checkbox
                    id="remember"
                    v-model:checked="rememberMe"
                    :disabled="isSubmitting"
                    class="mt-1 border-gray-300 data-[state=checked]:bg-[#00c885] data-[state=checked]:border-[#00c885]"
                />
                <div class="grid gap-1 leading-none">
                    <Label
                        for="remember"
                        class="text-sm font-bold text-gray-900 dark:text-white/50 cursor-pointer"
                    >
                        {{ t("login.rememberMe") }}
                    </Label>
                    <p class="text-[10px] text-gray-400">
                        {{ t("login.keepSessionActive") }}
                    </p>
                </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
                <Button
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] dark:text-black uppercase text-sm transition-all disabled:opacity-50"
                >
                    <span
                        v-if="isSubmitting"
                        class="flex items-center justify-center gap-2"
                    >
                        <svg
                            class="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                            />
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        {{ t("loading") }}
                    </span>
                    <span v-else>{{ t("login.submit") }}</span>
                </Button>
            </div>

            <!-- Footer Link -->
            <div
                class="pt-4 text-center border-t border-gray-50 dark:border-[#232323] mt-4"
            >
                <p class="text-[10px] text-gray-400 uppercase">
                    {{ t("login.newToVoltaic") }}
                    <NuxtLink
                        to="/signup"
                        class="text-[#007bff] font-bold hover:underline"
                    >
                        {{ t("nav.signup") }}
                    </NuxtLink>
                </p>
            </div>
        </form>
    </div>
</template>
