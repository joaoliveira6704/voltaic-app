<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Skeleton } from "~/components/ui/Skeleton";
import { LogOut } from "lucide-vue-next";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";

const { t } = useI18n();
const userStore = useUserStore();

const route = useRoute();

const currentUser = computed(() => userStore.currentUser);

let cachedAvatar = "";

const avatarUrl = computed(() => {
    if (!userStore.currentUser?.username) return "";

    const seed = String(userStore.currentUser.username).toLowerCase();

    if (cachedAvatar) return cachedAvatar;

    const avatar = createAvatar(bottts, {
        seed: seed,
        backgroundColor: ["#F0F0F0"],
    });

    cachedAvatar = avatar.toDataUri();
    return cachedAvatar;
});
const handleLogout = () => {
    userStore.confirmLogout();
};
</script>

<template>
    <nav class="flex flex-col w-full gap-1 py-1">
        <ToggleTheme v-if="!route.path !== '/profile'" />
        <Button
            as-child
            class="w-full flex justify-start gap-3 h-11 px-4 transition-all text-black group cursor-pointer bg-white dark:bg-[#171717] hover:bg-gray-200 dark:hover:bg-[#232323] dark:text-white"
            :class="
                route.path === '/profile'
                    ? ' hover:bg-gray-200 bg-gray-100 dark:hover:bg-[#232323] dark:bg-[#272727] dark:text-white'
                    : 'filter grayscale hover:grayscale-0'
            "
        >
            <NuxtLink to="/profile" class="flex gap-3 items-center w-full">
                <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    class="h-6 w-6 shrink-0"
                />
                <Skeleton v-else class="h-6 w-6 shrink-0 rounded-full" />

                <span class="text-xs font-bold uppercase">
                    {{ currentUser?.firstName }}
                    {{ currentUser?.lastName?.charAt(0) }}.
                </span>
            </NuxtLink>
        </Button>

        <Button
            class="w-full flex justify-start gap-3 h-11 transition-all group dark:bg-[#171717] dark:text-white cursor-pointer bg-white text-black hover:bg-gray-100 dark:hover:bg-[#272727] filter grayscale hover:grayscale-0"
            @click="handleLogout"
        >
            <LogOut class="ml-2.5 h-6 w-6 shrink-0 transition-colors" />
            <span class="text-xs font-bold uppercase">
                {{ t("lowerCard.logout") }}
            </span>
        </Button>
    </nav>
</template>
