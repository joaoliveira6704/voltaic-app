<!-- components/map/MapThemeButton.vue -->
<template>
    <div v-if="!isPending" class="absolute bottom-32 right-4 z-7">
        <button
            class="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 shadow-md hover:bg-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            :aria-label="t('map.theme.ariaLabel')"
            :title="t('map.theme.title')"
            @click="toggleDarkMode"
        >
            <MoonIcon
                v-if="!isDark"
                class="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-[#22c55e]"
            />
            <SunIcon
                v-else
                class="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-[#22c55e]"
            />
        </button>
    </div>
</template>

<script setup lang="ts">
import { watch, onMounted, computed } from "vue";
import { MoonIcon, SunIcon } from "lucide-vue-next";

import { useI18n } from "vue-i18n";

const { t } = useI18n();
const userStore = useUserStore();
const colorMode = useColorMode();
const isDark = computed(() => colorMode.preference === "dark");
const isPending = ref(true);

onMounted(() => {
    if (!userStore.currentUser && useCookie("token").value) {
        userStore.fetchCurrentUser().finally(() => {
            const pref = userStore.currentUser?.preferences?.darkMode;
            if (pref !== undefined) {
                colorMode.preference = pref ? "dark" : "light";
            }
            isPending.value = false;
        });
    } else {
        isPending.value = false;
    }
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
