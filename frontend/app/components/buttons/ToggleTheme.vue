<script setup lang="ts">
import { MoonIcon, SunIcon } from "lucide-vue-next";
import { useColorMode } from "@vueuse/core";
const userStore = useUserStore();
const colorMode = useColorMode();
const isDark = computed(() => colorMode.preference === "dark");
const isPending = ref(true);

onMounted(() => {
    userStore.fetchCurrentUser().finally(() => {
        const pref = userStore.currentUser?.preferences?.darkMode;
        if (pref !== undefined) {
            colorMode.preference = pref ? "dark" : "light";
        }
        isPending.value = false;
    });
});

function toggleDarkMode() {
    colorMode.preference = colorMode.preference === "dark" ? "light" : "dark";
}

watch(
    () => colorMode.preference,
    async (newVal) => {
        await userStore.editUserProfile({
            preferences: {
                ...userStore.currentUser?.preferences,
                darkMode: newVal === "dark",
            },
        });
    },
);
</script>
<template>
    <button
        v-if="!isPending"
        class="w-full flex items-center rounded-md justify-center md:justify-start gap-3 h-11 px-4 transition-all group dark:bg-[#171717] dark:text-white cursor-pointer bg-white text-black hover:bg-gray-100 dark:hover:bg-[#272727]"
        aria-label="Toggle dark mode"
        @click="toggleDarkMode"
    ><SunIcon

        class="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-300"
    />
        <Switch v-model="isDark" @change="toggleDarkMode"/>
        <MoonIcon
            class="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-300"
        />


    </button>
</template>
