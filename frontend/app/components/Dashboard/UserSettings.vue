<script setup lang="ts">
import { ref } from "vue";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const darkMode = ref(false);
const hidePlates = ref(false);
const language = ref("en");

defineEmits(["update:settings"]);

const handleSave = () => {
  console.log("Settings Saved:", {
    dark: darkMode.value,
    hide: hidePlates.value,
    lang: language.value,
  });
};
</script>

<template>
  <div class="flex flex-col gap-6 py-2 font-mono h-full">
    <div class="flex items-center justify-between group">
      <span class="text-sm font-bold text-neutral-700 uppercase tracking-tight">
        Dark Mode
      </span>
      <Switch
        v-model:checked="darkMode"
        class="data-[state=checked]:bg-blue-600"
      />
    </div>

    <div class="flex items-center justify-between group">
      <span class="text-sm font-bold text-neutral-700 uppercase tracking-tight">
        Hide plates
      </span>
      <Switch
        v-model:checked="hidePlates"
        class="data-[state=checked]:bg-blue-600"
      />
    </div>

    <div class="flex flex-col gap-2 mt-2">
      <label
        class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest"
      >
        Language
      </label>
      <Select v-model="language">
        <SelectTrigger class="w-full font-mono border-neutral-200">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent class="font-mono bg-white">
          <SelectItem value="en">English (US)</SelectItem>
          <SelectItem value="pt">Portuguese (PT)</SelectItem>
          <SelectItem value="es">Spanish (ES)</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="mt-auto pt-3">
      <Button
        class="w-full bg-[#007AFF] hover:bg-blue-700 text-white font-bold py-6 rounded-lg transition-all active:scale-[0.98]"
        @click="handleSave"
      >
        Delete log history
      </Button>
    </div>
  </div>
</template>
