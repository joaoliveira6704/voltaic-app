<script setup lang="ts">
import type { LogEntry } from "~/composables/useStation";

const props = defineProps<{
    logs: LogEntry[];
}>();

const logConsoleRef = ref<HTMLElement | null>(null);

// Auto-scroll to bottom whenever logs change
watch(
    () => props.logs,
    async () => {
        await nextTick();
        if (logConsoleRef.value) {
            logConsoleRef.value.scrollTop = logConsoleRef.value.scrollHeight;
        }
    },
    { deep: true },
);
</script>

<template>
    <div
        ref="logConsoleRef"
        class="rounded h-80 overflow-y-auto p-2 space-y-0.5 scroll-smooth bg-gray-950"
    >
        <div
            v-for="(log, i) in logs"
            :key="i"
            class="font-mono text-xs leading-5 flex gap-1"
        >
            <span class="text-gray-400 shrink-0">[{{ log.time }}]</span>
            <span
                :class="{
                    'text-orange-400 font-semibold': log.type === 'critical',
                    'text-gray-200': log.type === 'info',
                    'text-cyan-400': log.type === 'system',
                }"
            >
                <span v-if="log.type === 'critical'" class="text-orange-400"
                    >[Critical]
                </span>
                {{ log.message }}
            </span>
        </div>
    </div>
</template>
