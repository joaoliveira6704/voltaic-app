<script setup lang="ts">
import { computed } from "vue";
import { Zap, Map, Shield } from "lucide-vue-next";

const iconMap = {
    Zap,
    Map,
    Shield,
} as const;

type IconName = keyof typeof iconMap;

const props = defineProps<{
    title: string;
    description: string;
    icon: IconName;
}>();

const dynamicIcon = computed(() => iconMap[props.icon]);
</script>

<template>
    <div
        class="p-8 bg-gray-50 dark:bg-[#171717] dark:border-[#232323] rounded-3xl border border-transparent hover:border-green-400 transition-all group"
    >
        <div
            class="w-14 h-14 bg-white dark:bg-[#1a1a1a] text-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-green-500 group-hover:text-white transition"
        >
            <component :is="dynamicIcon" :size="24" v-bind="$attrs" />
        </div>
        <h3 class="text-lg min-[500px]:text-xl font-bold mb-3 dark:text-white">
            {{ title }}
        </h3>
        <p class="text-gray-500 dark:text-white/50 leading-relaxed">
            {{ description }}
        </p>
    </div>
</template>
