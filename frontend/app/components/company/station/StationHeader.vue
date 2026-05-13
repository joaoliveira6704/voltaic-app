<script setup lang="ts">
import type { StationState } from "~/composables/useStation"; // was StationStatus

const props = defineProps<{
    state: StationState;
    alive: boolean;
    statusLabel: string;
    title: string; // was used in template but never declared
    stationId: string; // was used in template but never declared
}>();

console.log(props.alive, props.state);

const statusClass = computed(() => ({
    "bg-green-500 text-white": props.alive && props.state === "available",
    "bg-blue-500 text-white": props.alive && props.state === "unavailable",
    "bg-yellow-500 text-white animate-pulse":
        props.alive && props.state === "maintenance",
    "bg-red-500 text-white": !props.alive,
}));
</script>

<template>
    <div
        class="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-200 dark:border-gray-700"
    >
        <span
            class="font-mono text-sm text-gray-500 dark:text-gray-400 tracking-wide"
        >
            {{ title }} — {{ stationId }}
        </span>
        <span
            class="px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300"
            :class="statusClass"
        >
            Station Status: {{ statusLabel }}
        </span>
    </div>
</template>
