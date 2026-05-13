<script setup lang="ts">
import type { StationState } from "~/composables/useStation";

const { t } = useI18n();
import {
    PowerIcon,
    PowerOffIcon,
    RotateCwIcon,
    PenIcon,
} from "lucide-vue-next";

defineProps<{
    isBusy: boolean;
    isRestarting: boolean;
    alive: boolean;
    state: StationState;
}>();

const emit = defineEmits<{
    (e: "shutdown"): void;
    (e: "restart"): void;
    (e: "start"): void;
}>();
</script>

<template>
    <div class="flex items-center justify-between flex-wrap gap-3">
        <span
            class="text-sm font-semibold text-gray-600 dark:text-gray-300 tracking-wide"
        >
            {{ t("company.stations.stationControls") }}
        </span>

        <div class="flex gap-2">
            <button
                class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-50"
                :disabled="isBusy"
                @click="emit('register')"
            >
                <PenIcon class="w-4 h-4" />
                {{ t("company.stations.registerIntervention") }}
            </button>
            <!-- Offline: show Start only -->
            <template v-if="!alive">
                <button
                    class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-green-500 hover:bg-green-600 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isBusy"
                    @click="emit('start')"
                >
                    <PowerIcon class="w-4 h-4" />
                    {{ t("company.stations.start") }}
                </button>
            </template>

            <!-- Online: show Shutdown + Restart -->
            <template v-else>
                <button
                    class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-red-500 hover:bg-red-600 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isBusy"
                    @click="emit('shutdown')"
                >
                    <PowerOffIcon class="w-4 h-4" />
                    {{ t("company.stations.shutdown") }}
                </button>

                <button
                    class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-yellow-400 hover:bg-yellow-500 active:scale-95 text-gray-900 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isBusy"
                    @click="emit('restart')"
                >
                    <RotateCwIcon
                        :class="{ 'animate-spin': isRestarting }"
                        class="w-4 h-4"
                    />
                    {{ t("company.stations.restart") }}
                </button>
            </template>
        </div>
    </div>
</template>
