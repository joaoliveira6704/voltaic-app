<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useDark } from "@vueuse/core";

import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Preferences } from "@/stores/user";

const userStore = useUserStore();
const { t } = useI18n();

// 1. Theme engine (controls the actual CSS class)
const isDark = useDark();

// 2. Local UI state (does NOT affect the theme until saved)
const darkMode = ref(userStore.currentUser?.preferences?.darkMode ?? false);
const hidePlates = ref(userStore.currentUser?.preferences?.hidePlates ?? false);
const language = ref(userStore.currentUser?.preferences?.language ?? "en");

const handleSave = async () => {
    const preferencesData = {
        darkMode: darkMode.value,
        hidePlates: hidePlates.value,
        language: language.value,
    };

    try {
        await userStore.editUserProfile({ preferences: preferencesData });
        isDark.value = darkMode.value;
    } catch {
        darkMode.value = userStore.currentUser?.preferences?.darkMode ?? false;
        hidePlates.value = userStore.currentUser?.preferences?.hidePlates ?? false;
        language.value = userStore.currentUser?.preferences?.language ?? "en";
    }
};
</script>

<template>
    <div
        class="flex flex-col gap-6 py-2 h-full w-full items-center justify-center text-center mx-auto"
    >
        <div class="flex flex-row justify-around gap-10">
            <div class="flex gap-2 items-center justify-between group">
                <span
                    class="text-sm font-bold text-neutral-700 dark:text-white/80 uppercase"
                >
                    {{ t("darkMode") }}
                </span>
                <Switch
                    v-model="darkMode"
                    class="data-[state=unchecked]:bg-neutral-300 data-[state=checked]:bg-green-600 [&>[data-slot=switch-thumb]]:bg-white dark:data-[state=unchecked]:bg-neutral-300/10 dark:data-[state=checked]:bg-green-600 dark:[&>[data-slot=switch-thumb]]:bg-white"
                />
            </div>

            <div class="flex gap-2 items-center justify-between group">
                <span
                    class="text-sm font-bold text-neutral-700 dark:text-white/80 uppercase"
                >
                    {{ t("hidePlates") }}
                </span>
                <Switch
                    v-model="hidePlates"
                    class="data-[state=unchecked]:bg-neutral-300 data-[state=checked]:bg-green-600 [&>[data-slot=switch-thumb]]:bg-white dark:data-[state=unchecked]:bg-neutral-300/10 dark:data-[state=checked]:bg-green-600 dark:[&>[data-slot=switch-thumb]]:bg-white"
                />
            </div>
        </div>

        <div class="flex flex-col gap-2 mt-2">
            <label class="text-[10px] font-bold text-neutral-400 uppercase">
                {{ t("language") }}
            </label>
            <Select v-model="language">
                <SelectTrigger
                    class="w-full border-neutral-200 dark:border-[#232323]"
                >
                    <SelectValue :placeholder="t('userSettings.selectLanguage')" />
                </SelectTrigger>
                <SelectContent
                    class="bg-white dark:bg-[#1a1a1a] dark:text-white/80 dark:border-[#232323]"
                >
                    <SelectItem
                        value="en"
                        class="cursor-pointer hover:bg-gray-200 dark:hover:bg-[#232323]"
                        >{{ t("lang.en") }}</SelectItem
                    >
                    <SelectItem
                        value="pt"
                        class="cursor-pointer hover:bg-gray-200 dark:hover:bg-[#232323]"
                        >{{ t("lang.pt") }}</SelectItem
                    >
                    <SelectItem
                        value="es"
                        class="cursor-pointer hover:bg-gray-200 dark:hover:bg-[#232323]"
                        >{{ t("lang.es") }}</SelectItem
                    >
                </SelectContent>
            </Select>
        </div>

        <div class="mt-auto pt-3 w-full">
            <Button
                class="w-full max-w-[300px] bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-lg transition-all active:scale-[0.98]"
                @click="handleSave"
            >
                {{ t("saveChanges") }}
            </Button>
        </div>
    </div>
</template>
