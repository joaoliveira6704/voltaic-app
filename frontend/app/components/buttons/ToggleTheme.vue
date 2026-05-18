<script setup lang="ts">
import { useDark } from "@vueuse/core";
import { watch } from "vue";
import { Switch } from "@/components/ui/switch";
import { MoonIcon, SunIcon } from "lucide-vue-next";
const userStore = useUserStore();
const isDark = useDark();
onMounted(async () => {
    // Set the theme based on user preferences from the store
    await userStore.fetchUserProfile();
    if (userStore.currentUser?.preferences?.darkMode !== undefined) {
        isDark.value = userStore.currentUser.preferences.darkMode;
    }
});
watch(isDark, async (newVal) => {
    await userStore.editUserProfile({
        preferences: {
            ...userStore.currentUser?.preferences, // Keep other preferences like language
            darkMode: newVal,
        },
    });
});
</script>
<template>
    <div class="flex gap-4 items-center group px-4 py-2">
        <span
            class="text-sm font-bold text-neutral-700 uppercase dark:text-neutral-300"
        >
            <!-- <MoonIcon
                v-if="isDark"
                class="text-neutral-700 dark:text-neutral-300 h-6 w-6"
            />
            <SunIcon v-else class="text-neutral-700 dark:text-neutral-300" /> -->
            <SunIcon
                @click="isDark = false"
                class="text-neutral-700 dark:text-neutral-300"
            />
        </span>
        <Switch
            v-model="isDark"
            class="data-[state=unchecked]:bg-neutral-300 data-[state=checked]:bg-green-600 [&>[data-slot=switch-thumb]]:bg-white"
        />

        <MoonIcon class="text-neutral-700 dark:text-neutral-300 h-6 w-6" />
    </div>
</template>
