<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const isSubmitting = ref(false);
const { t } = useI18n();

const form = ref({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    acceptedTerms: true,
});

definePageMeta({ layout: "landing" });

useHead({
    title: t("signup.title"),
    meta: [
        {
            name: "description",
            content: t("signup.description"),
        },
    ],
});

const authStore = useAuthStore();

const handleRegister = async () => {
    isSubmitting.value = true;
    try {
        await authStore
            .register(
                form.value.username,
                form.value.firstName,
                form.value.lastName,
                form.value.email,
                form.value.password,
            )
            .then(() => {
                navigateTo("/login");
            });
    } catch (err: unknown) {
        console.error("Register failed:", err);

        const error = err as {
            message?: string;
            data?: { error?: string };
        };

        const errorMessage =
            error.data?.error || error.message || t("signup.error");

        alert(`${t("error")}: ${errorMessage}`);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="w-full flex flex-col items-center justify-center py-12 px-4">
        <div class="flex items-end gap-1 mb-10 select-none">
            <NuxtImg src="/voltaic-logo.png" width="150" />
        </div>

        <Card
            class="w-full max-w-[420px] dark:border-[#232323] dark:bg-[#0a0a0a] shadow-sm overflow-hidden"
        >
            <CardContent class="p-6 md:p-10">
                <form class="space-y-6" @submit.prevent="handleRegister">
                    <div class="space-y-2">
                        <Label
                            for="username"
                            class="text-xs font-bold uppercase text-gray-500 dark:text-zinc-400"
                            >Username</Label
                        >
                        <Input
                            id="username"
                            v-model="form.username"
                            type="text"
                            :placeholder="t('signup.usernamePlaceholder')"
                            class="h-11 dark:border-[#232323]"
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label
                                for="firstName"
                                class="text-xs font-bold uppercase text-gray-500 dark:text-zinc-400"
                                >{{ t("signup.firstName") }}</Label
                            >
                            <Input
                                id="firstName"
                                v-model="form.firstName"
                                :placeholder="t('signup.firstNamePlaceholder')"
                                class="h-11 dark:border-[#232323]"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label
                                for="lastName"
                                class="text-xs font-bold uppercase text-gray-500 dark:text-zinc-400"
                                >{{ t("signup.lastName") }}</Label
                            >
                            <Input
                                id="lastName"
                                v-model="form.lastName"
                                :placeholder="t('signup.lastNamePlaceholder')"
                                class="h-11 dark:border-[#232323]"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label
                            for="email"
                            class="text-xs font-bold uppercase text-gray-500 dark:text-zinc-400"
                            >{{ t("signup.email") }}</Label
                        >
                        <Input
                            id="email"
                            v-model="form.email"
                            type="email"
                            :placeholder="t('signup.emailPlaceholder')"
                            class="h-11 dark:border-[#232323]"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label
                            for="password"
                            class="text-xs font-bold uppercase text-gray-500 dark:text-zinc-400"
                            >{{ t("signup.password") }}</Label
                        >
                        <Input
                            id="password"
                            v-model="form.password"
                            type="password"
                            placeholder="••••••••"
                            class="h-11 dark:border-[#232323]"
                        />
                    </div>

                    <div class="flex items-center gap-3">
                        <Checkbox
                            id="terms"
                            v-model:checked="form.acceptedTerms"
                            class="mt-1 dark:text-white"
                        />
                        <div class="grid gap-1">
                            <Label
                                for="terms"
                                class="text-[10px] text-gray-900 dark:text-white cursor-pointer"
                            >
                                {{ t("signup.agreeTerms") }}
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        :disabled="isSubmitting"
                        class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] uppercase dark:text-black text-sm disabled:opacity-50"
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
                        <span v-else>{{ t("signup.submit") }}</span>
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
</template>
