<script setup lang="ts">
import { Skeleton } from "~/components/ui/Skeleton";
import type { LogEntry } from "~/composables/useStation";

const { t } = useI18n();
const props = defineProps<{
    logs: LogEntry[];
    loading?: boolean;
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
        <template v-if="loading">
            <div class="space-y-2 p-2">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-3/4" />
                <Skeleton class="h-4 w-5/6" />
                <Skeleton class="h-4 w-1/2" />
                <Skeleton class="h-4 w-4/5" />
                <Skeleton class="h-4 w-2/3" />
            </div>
        </template>
        <template v-else-if="logs.length">
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
        </template>
        <div v-else class="flex items-center justify-center h-full text-gray-500 text-xs">
            {{ t("noLogs") }}
        </div>
    </div>
</template>
