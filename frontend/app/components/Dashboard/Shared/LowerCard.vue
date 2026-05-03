<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-vue-next";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";

const userStore = useUserStore();

const route = useRoute();

const currentUser = computed(() => userStore.currentUser);

onMounted(async () => {
    if (!userStore.currentUser) {
        await userStore.fetchCurrentUser();
    }
});

const avatarUrl = computed(() => {
    // 1. Handle the loading state explicitly
    if (!userStore.currentUser?.username) {
        return ""; // Or a placeholder URL
    }

    const seed = String(userStore.currentUser.username).toLowerCase();

    // 2. Generate the avatar
    const avatar = createAvatar(bottts, {
        seed: seed,
        backgroundColor: ["#F0F0F0"],
    });

    return avatar.toDataUri();
});
const handleLogout = () => {
    userStore.confirmLogout();
};
</script>

<template>
    <nav class="flex flex-col w-full gap-1 font-mono">
        <ToggleTheme v-if="!route.path.startsWith('/profile')" />
        <Button
            as-child
            class="w-full flex justify-start gap-3 h-11 px-4 transition-all group cursor-pointer hover:bg-gray-200 dark:hover:bg-[#232323]"
            :class="
                route.path === '/profile'
                    ? 'bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#232323]'
                    : 'filter grayscale hover:grayscale-0'
            "
        >
            <NuxtLink to="/profile" class="flex gap-3 items-center w-full">
                <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    class="h-6 w-6 shrink-0"
                />
                <div
                    v-else
                    class="h-6 w-6 shrink-0 bg-gray-200 animate-pulse rounded-full"
                />

                <span class="text-xs font-bold uppercase tracking-tight">
                    {{ currentUser?.firstName }}
                    {{ currentUser?.lastName?.charAt(0) }}.
                </span>
            </NuxtLink>
        </Button>

        <Button
            class="w-full flex justify-start gap-3 h-11 px-4 transition-all group cursor-pointer hover:bg-gray-100 dark:hover:bg-[#272727] filter grayscale hover:grayscale-0"
            @click="handleLogout"
        >
            <LogOut class="ml-2.5 h-6 w-6 shrink-0 transition-colors" />
            <span class="text-xs font-bold uppercase tracking-tight">
                Logout
            </span>
        </Button>
    </nav>
</template>
