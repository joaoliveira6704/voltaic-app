<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const userStore = useUserStore();
console.log(userStore.currentUser);

const { t } = useI18n();

const isLoaded = computed(() => userStore.isLoaded);

const navLinks = computed(() => {
    const user = userStore.currentUser;
    const userRole = userStore.userRole;

    if (!isLoaded.value) return [];

    if (!user) {
        return [
            { path: "/", label: t("nav.home") },
            { path: "/login", label: t("nav.login") },
            { path: "/signup", label: t("nav.signup") },
        ];
    }

    if (userRole === "admin") {
        return [
            { path: "/", label: t("nav.home") },
            { path: "/profile", label: t("nav.profile") },
            { path: "/admin", label: t("nav.admin") },
        ];
    }

    return [
        { path: "/", label: "Home" },
        { path: "/profile", label: "Profile" },
    ];
});
</script>

<template>
    <div
        class="h-screen w-full flex flex-col bg-white dark:border-[#232323] dark:bg-[#0a0a0a] dark:selection:bg-white dark:selection:text-[#0a0a0a]"
    >
        <nav
            class="shrink-0 w-full border-b border-gray-100 bg-white dark:border-[#232323] dark:bg-[#0a0a0a]"
        >
            <div
                class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8"
            >
                <NuxtLink to="/" class="flex items-center gap-1">
                    <NuxtImg src="/voltaic-logo.svg" width="50" />
                </NuxtLink>

                <div
                    class="flex items-center gap-1 text-black dark:text-white/80"
                >
                    <Button
                        v-for="link in navLinks"
                        :key="link.path"
                        variant="ghost"
                        as-child
                        class="text-xs"
                    >
                        <NuxtLink
                            :to="link.path"
                            active-class="text-[#007bff]"
                            >{{ link.label }}</NuxtLink
                        >
                    </Button>
                </div>
            </div>
        </nav>

        <main class="flex-1 overflow-y-scroll">
            <slot />
        </main>

        <footer
            class="shrink-0 w-full border-t border-gray-100 bg-white dark:bg-[#0a0a0a] py-4 dark:border-[#232323]"
        >
            <div
                class="container mx-auto max-w-7xl px-4 md:px-8 flex justify-between items-center"
            >
                <Label class="text-[10px] text-gray-400 uppercase"
                    >© 2026 Voltaic</Label
                >
                <div class="flex gap-4">
                    <Button
                        variant="link"
                        class="p-0 h-auto text-[10px] text-gray-400"
                        >Privacy</Button
                    >
                    <Button
                        variant="link"
                        class="p-0 h-auto text-[10px] text-gray-400"
                        >Terms</Button
                    >
                </div>
            </div>
        </footer>
    </div>
</template>
