<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const config = useRuntimeConfig();
const email = ref("");
const password = ref("");
const rememberMe = ref(true);

interface LoginResponse {
    token: string;
    data: {
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
    title: "Voltaic - Login",
    meta: [
        {
            name: "description",
            content:
                "Login to your Voltaic account to manage your EV charging sessions.",
        },
    ],
});

const handleLogin = async () => {
    console.log("Login attempt:", {
        email: email.value,
        password: password.value,
    });

    try {
        const response = await $fetch<LoginResponse>(
            `${config.public.apiBaseUrl}/api/auth/login`,
            {
                method: "POST",
                body: {
                    email: email.value,
                    password: password.value,
                },
            },
        );

        console.log("Login successful:", response);
        alert("Login successful!");
        document.cookie = `token=${response.token}; path=/; max-age=86400; secure; sameSite=Lax`;
        document.cookie = `user=${JSON.stringify(response.data.user)}; path=/; max-age=86400; secure; sameSite=Lax`;
        window.location.href = "/profile";
    } catch (err: unknown) {
        console.error("Login failed:", err);

        const errorData = err as {
            message?: string;
            data?: { message?: string };
        };

        const errorMessage =
            errorData?.data?.message || errorData?.message || "Login failed";

        alert("Login failed: " + errorMessage);
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
            <div class="space-y-2">
                <Label
                    for="email"
                    class="font-mono text-xs font-bold uppercase tracking-wider"
                >
                    Email
                </Label>
                <Input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="example@voltaic.com"
                    class="h-11 font-mono border-gray-200 dark:border-[#232323] focus-visible:ring-[#00c885]"
                />
            </div>

            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <Label
                        for="password"
                        class="font-mono text-xs font-bold uppercase tracking-wider"
                    >
                        Password
                    </Label>
                    <NuxtLink
                        to="/recover-password"
                        class="text-[10px] font-mono text-[#007bff] hover:underline uppercase"
                    >
                        Forgot?
                    </NuxtLink>
                </div>
                <Input
                    id="password"
                    v-model="password"
                    type="password"
                    placeholder="********"
                    class="h-11 font-mono border-gray-200 dark:border-[#232323] focus-visible:ring-[#00c885]"
                />
            </div>

            <div class="flex items-start gap-3 pt-2">
                <Checkbox
                    id="remember"
                    v-model:checked="rememberMe"
                    class="mt-1 border-gray-300 data-[state=checked]:bg-[#00c885] data-[state=checked]:border-[#00c885]"
                />
                <div class="grid gap-1 leading-none">
                    <Label
                        for="remember"
                        class="font-mono text-sm font-bold text-gray-900 dark:text-white/50 cursor-pointer"
                    >
                        Remember me
                    </Label>
                    <p class="font-mono text-[10px] text-gray-400">
                        Keep my session active
                    </p>
                </div>
            </div>

            <div class="pt-2">
                <Button
                    type="submit"
                    class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] dark:text-black font-mono uppercase tracking-widest text-sm transition-all"
                >
                    Login
                </Button>
            </div>

            <div
                class="pt-4 text-center border-t border-gray-50 dark:border-[#232323] mt-4"
            >
                <p
                    class="font-mono text-[10px] text-gray-400 uppercase tracking-tight"
                >
                    New to Voltaic?
                    <NuxtLink
                        to="/signup"
                        class="text-[#007bff] font-bold hover:underline"
                    >
                        Create account
                    </NuxtLink>
                </p>
            </div>
        </form>
    </div>
</template>
