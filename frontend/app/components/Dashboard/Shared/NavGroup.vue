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
        label: "Admin",
        icon: Shield,
        path: "/admin",
    },
    worker: {
        label: "Worker",
        icon: Wrench,
        path: "/worker",
    },
    "company-manager": {
        label: "Company Manager",
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
        <!-- 3. Iterate over the computed results -->
        <NuxtLink
            v-for="link in navigationLinks"
            :key="link.label"
            :to="link.path"
            class="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"
        >
            <component :is="link.icon" class="h-4 w-4" />
            <span class="text-sm font-medium">{{ link.label }}</span>
        </NuxtLink>
    </nav>
</template>
