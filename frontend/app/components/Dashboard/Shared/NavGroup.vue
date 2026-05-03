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

const roleMap: Partial<Record<UserRole, NavItem>> = {
    admin: {
        label: t("nav.admin"),
        icon: Shield,
        path: "/admin",
    },
    worker: {
        label: t("nav.worker"),
        icon: Wrench,
        path: "/worker",
    },
    "company-manager": {
        label: t("nav.companyManager"),
        icon: Wrench,
        path: "/company-manager",
    },
};

const navigationLinks = computed(() => {
    const userRole: UserRole = userStore.userRole ?? "client";
    const navMap = getNavigationMap(t);

    let role: UserRole = "client";
    if (route.path.startsWith("/admin")) {
        role = (userStore.currentUser?.role as UserRole) || "admin";
    }

    const links: NavItem[] = [...(navMap[role] || [])];

    if (
        userRole !== "client" &&
        !route.path.startsWith("/admin") &&
        roleMap[userRole]
    ) {
        links.push(roleMap[userRole]!);
    }

    return links;
});
</script>
<template>
    <nav class="flex flex-col gap-2">
        <NuxtLink
            v-for="link in navigationLinks"
            :key="link.label"
            :to="link.path"
            class="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md dark:bg-[#171717] dark:hover:bg-[#272727]"
            :class="{
                'bg-gray-100 dark:bg-[#232323]': link.path === route.path,
            }"
        >
            <component :is="link.icon" class="h-4 w-4" />
            <span class="text-sm font-medium">{{ link.label }}</span>
        </NuxtLink>
    </nav>
</template>
