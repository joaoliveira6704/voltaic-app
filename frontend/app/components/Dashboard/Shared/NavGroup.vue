<script setup lang="ts">
import {
    getNavigationMap,
    type UserRole,
    type NavItem,
} from "@/utils/navigation";
import { Shield, Wrench } from "lucide-vue-next";

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();

const navigationLinks = computed(() => {
    const roleMap: Partial<Record<UserRole, NavItem>> = {
        admin: {
            label: t("nav.admin"),
            icon: Shield,
            path: "/admin",
        },
        worker: {
            label: t("nav.worker"),
            icon: Wrench,
            path: "/company/stations",
        },
        "company-manager": {
            label: t("nav.companyManager"),
            icon: Wrench,
            path: "/company", // change to /company/manage
        },
    };

    const userRole: UserRole = userStore.userRole ?? "client";
    const navMap = getNavigationMap(t);

    let role: UserRole = "client";
    if (route.path.startsWith("/admin")) {
        role = (userStore.currentUser?.role as UserRole) || "admin";
    }

    if (route.path.startsWith("/company")) {
        role = (userStore.currentUser?.role as UserRole) || "worker";
    }

    const links: NavItem[] = [...(navMap[role] || [])];

    if (
        userRole !== "client" &&
        !route.path.startsWith("/admin") &&
        !route.path.startsWith("/company") &&
        roleMap[userRole]
    ) {
        links.push(roleMap[userRole]!);
    }

    return links;
});
</script>
<template>
    <nav class="flex flex-col gap-2 py-1">
        <NuxtImg src="voltaic-logo.png" class="w-12 h-12 mb-4" />
        <NuxtLink
            v-for="link in navigationLinks"
            :key="link.label"
            :to="link.path"
            class="flex items-center justify-start md:justify-start text-left sm:text-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md dark:bg-[#171717] dark:hover:bg-[#272727]"
            :class="{
                'bg-gray-100 dark:bg-[#232323]': link.path === route.path,
            }"
        >
            <component :is="link.icon" class="h-4 w-4 shrink-0" />
            <span class="text-sm">{{ link.label }}</span>
        </NuxtLink>
    </nav>
</template>
