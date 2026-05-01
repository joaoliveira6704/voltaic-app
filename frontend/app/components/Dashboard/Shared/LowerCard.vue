<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-vue-next";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";

const userStore = useUserStore();

const currentUser = userStore.currentUser;

const avatarUrl = computed(() => {
    const username = userStore.currentUser?.username;
    console.log(username);

    const seed = username ? String(username).toLowerCase() : "default";

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
        <Button
            class="w-full flex justify-start gap-3 h-11 px-4 transition-all group cursor-pointer hover:bg-gray-400 filter grayscale hover:grayscale-0"
        >
            <NuxtLink
                to="/profile"
                class="flex gap-3 items-center justify-center"
            >
                <img :src="avatarUrl" class="h-6 w-6 shrink-0" />
                <span class="text-xs font-bold uppercase tracking-tight">
                    {{ currentUser?.firstName }}
                    {{ currentUser?.lastName.charAt(0).toUpperCase() }}.
                </span>
            </NuxtLink>
        </Button>

        <Button
            class="w-full flex justify-start gap-3 h-11 px-4 transition-all group cursor-pointer hover:bg-gray-400 filter grayscale hover:grayscale-0"
        >
            <NuxtLink
                @click="handleLogout"
                class="flex gap-3 items-center justify-center"
            >
                <LogOut class="h-4 w-4 shrink-0 transition-colors" />
                <span class="text-xs font-bold uppercase tracking-tight">
                    Logout
                </span>
            </NuxtLink>
        </Button>
    </nav>
</template>
