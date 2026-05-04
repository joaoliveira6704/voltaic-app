<script setup lang="ts">
import { computed } from "vue";

// 1. Define the specific allowed types
type StationStatus = "available" | "ticket" | "off";

interface Props {
    status: StationStatus;
    label?: string; // Optional: Override the text if needed
}

const props = defineProps<Props>();

// 2. Map the status to the specific color ball
const statusConfig = computed(() => {
    const map = {
        available: { color: "bg-green-500", text: "Available" },
        ticket: { color: "bg-yellow-400", text: "Ticket Open" },
        off: { color: "bg-red-500", text: "Offline" },
    };
    return map[props.status];
});
</script>

<template>
    <div
        class="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-100 bg-neutral-50/50 hover:bg-white transition-all group"
    >
        <div
            :class="[
                'w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]',
                statusConfig.color,
            ]"
        ></div>

        <span
            class="text-[10px] font-bold uppercase text-neutral-500 group-hover:text-black transition-colors"
        >
            {{ label || statusConfig.text }}
        </span>
    </div>
</template>
