<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
import { Home, LogIn, Shield, User, UserPlus } from "lucide-vue-next";

const userStore = useUserStore();
console.log(userStore.currentUser);

const { t } = useI18n();

const isLoaded = computed(() => userStore.isLoaded);

const navLinks = computed(() => {
    const user = userStore.currentUser;
    const userRole = userStore.userRole;

    if (!user) {
        return [
            { path: "/", label: t("nav.home"), icon: Home },
            { path: "/login", label: t("nav.login"), icon: LogIn },
            { path: "/signup", label: t("nav.signup"), icon: UserPlus },
        ];
    }

    if (userRole === "admin") {
        return [
            { path: "/", label: t("nav.home"), icon: Home },
            { path: "/profile", label: t("nav.profile"), icon: User },
            { path: "/admin", label: t("nav.admin"), icon: Shield },
        ];
    }

    return [
        { path: "/", label: t("nav.home"), icon: Home },
        { path: "/profile", label: t("nav.profile"), icon: User },
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
                        <NuxtLink :to="link.path" active-class="text-[#007bff]">
                            <span class="hidden md:block">{{
                                link.label
                            }}</span>
                            <component
                                v-if="link.icon"
                                :is="link.icon"
                                class="w-4 h-4"
                            />
                        </NuxtLink>
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
                <Label class="text-[10px] text-gray-400 uppercase">{{
                    t("layout.footer.copyright", { year: 2026 })
                }}</Label>
                <div class="flex gap-4">
                    <Button
                        variant="link"
                        class="p-0 h-auto text-[10px] text-gray-400"
                        >{{ t("layout.footer.privacy") }}</Button
                    >
                    <Button
                        variant="link"
                        class="p-0 h-auto text-[10px] text-gray-400"
                        >{{ t("layout.footer.terms") }}</Button
                    >
                </div>
            </div>
        </footer>
        <Toaster position="top-right" rich-colors close-button theme="dark" />
    </div>
</template>
