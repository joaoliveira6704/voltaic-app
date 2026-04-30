<script setup lang="ts">
import { ref, computed, watch } from "vue";
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
const darkMode = ref(userStore.currentUser?.preferences?.darkMode ?? false);
const hidePlates = ref(userStore.currentUser?.preferences?.hidePlates ?? false);
const language = ref(userStore.currentUser?.preferences?.language ?? "en");

const emit = defineEmits(["saveUserSettings"]);

const preferences = computed(
  (): Preferences => ({
    darkMode: darkMode.value,
    hidePlates: hidePlates.value,
    language: language.value,
  }),
);

const handleSave = () => {
  const preferencesData = preferences.value;

  console.log("Settings saving:", preferencesData);

  emit("saveUserSettings", preferencesData);

  userStore.editUserProfile({ preferences: preferencesData });

  language.value = preferencesData.language;
};
</script>

<template>
  <div
    class="flex flex-col gap-6 py-2 font-mono h-full w-full items-center justify-center text-center mx-auto"
  >
    <div class="flex flex-row justify-around gap-10">
      <div class="flex gap-2 items-center justify-between group">
        <span
          class="text-sm font-bold text-neutral-700 uppercase tracking-tight"
        >
          {{ t("darkMode") }}
        </span>
        <Switch
          v-model="darkMode"
          class="data-[state=unchecked]:bg-neutral-300 data-[state=checked]:bg-blue-600 [&>[data-slot=switch-thumb]]:bg-white"
        />
      </div>

      <div class="flex gap-2 items-center justify-between group">
        <span
          class="text-sm font-bold text-neutral-700 uppercase tracking-tight"
        >
          {{ t("hidePlates") }}
        </span>
        <Switch
          v-model="hidePlates"
          class="data-[state=unchecked]:bg-neutral-300 data-[state=checked]:bg-blue-600 [&>[data-slot=switch-thumb]]:bg-white"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2 mt-2">
      <label
        class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest"
      >
        {{ t("language") }}
      </label>
      <Select v-model="language">
        <SelectTrigger class="w-full font-mono border-neutral-200">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent class="font-mono bg-white">
          <SelectItem value="en" class="cursor-pointer hover:bg-gray-200">{{
            t("en")
          }}</SelectItem>
          <SelectItem value="pt" class="cursor-pointer hover:bg-gray-200">{{
            t("pt")
          }}</SelectItem>
          <SelectItem value="es" class="cursor-pointer hover:bg-gray-200">{{
            t("es")
          }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="mt-auto pt-3 w-full">
      <Button
        class="w-full max-w-[300px] bg-[#007AFF] hover:bg-blue-700 text-white font-bold py-6 rounded-lg transition-all active:scale-[0.98]"
        @click="handleSave"
      >
        {{ t("saveChanges") }}
      </Button>
    </div>
  </div>
</template>
