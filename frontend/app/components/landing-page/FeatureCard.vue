<script setup lang="ts">
import { computed } from "vue";
// Import only the specific icons you want to support
import { Zap, Map, Shield } from "lucide-vue-next";

// 1. Create a static mapping
const iconMap = {
    Zap,
    Map,
    Shield,
} as const;

// 2. Define types based on the keys of your map
type IconName = keyof typeof iconMap;

const props = defineProps<{
    title: string;
    description: string;
    icon: IconName;
}>();

// 3. Simple lookup
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
