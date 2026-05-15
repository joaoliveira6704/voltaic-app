<!-- components/map/MapFilterCard.vue -->
<template>
    <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
    >
        <div
            v-if="open && isMobile"
            class="absolute inset-0 z-[998] bg-black/30 backdrop-blur-sm"
            @click="emit('close')"
        />
    </Transition>
    <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        :enter-from-class="
            isMobile ? 'translate-y-full opacity-0' : '-translate-x-4 opacity-0'
        "
        :leave-to-class="
            isMobile ? 'translate-y-full opacity-0' : '-translate-x-4 opacity-0'
        "
    >
        <div
            v-if="open"
            :class="[
                'absolute z-[999] bg-white shadow-2xl pointer-events-auto',
                isMobile
                    ? 'bottom-0 left-0 right-0 rounded-t-2xl px-5 pt-4 pb-8 max-h-[70vh] overflow-y-auto'
                    : 'left-4 top-1/2 -translate-y-1/2 w-80 rounded-2xl px-5 py-5 max-h-[75vh] overflow-y-auto',
            ]"
        >
            <div v-if="isMobile" class="flex justify-center mb-4">
                <div class="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div class="flex items-center justify-between mb-5">
                <h2 class="text-lg font-bold text-gray-900 tracking-tight">
                    {{ t("map.filter") }}
                </h2>
                <div class="flex items-center gap-3">
                    <button
                        class="text-sm font-medium text-[#22c55e] hover:text-[#16a34a] transition-colors"
                        @click="emit('reset')"
                    >
                        {{ t("map.reset") }}
                    </button>
                    <button
                        class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        @click="emit('close')"
                    >
                        <X class="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            <div
                v-if="selectedConnectors.length > 0"
                class="flex flex-wrap gap-2 mb-5"
            >
                <span
                    v-for="c in selectedConnectors"
                    :key="c"
                    class="flex items-center gap-1 px-3 py-1 rounded-full bg-[#22c55e] text-white text-xs font-semibold"
                >
                    {{ CONNECTOR_LABELS[c] || c }}
                    <button @click="emit('toggle-connector', c)">
                        <X class="w-3 h-3" />
                    </button>
                </span>
            </div>

            <div class="h-px bg-gray-100 mb-5" />

            <!-- Distance slider -->
            <div class="mb-5">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-semibold text-gray-700">{{
                        t("map.distance")
                    }}</span>
                    <span class="text-xs font-medium text-[#22c55e]">
                        {{
                            distanceActive
                                ? t("map.km", { value: sliderValue })
                                : t("map.off")
                        }}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="300"
                    step="1"
                    :value="sliderValue"
                    class="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#22c55e] bg-gray-200"
                    @input="onSliderInput"
                    @change="onSliderChange"
                />
                <div class="flex justify-between mt-1">
                    <span class="text-xs text-gray-400">{{
                        t("map.km", { value: 1 })
                    }}</span>
                    <span class="text-xs text-gray-400">{{
                        t("map.km", { value: 300 })
                    }}</span>
                </div>
            </div>

            <div class="h-px bg-gray-100 mb-5" />

            <div>
                <span class="text-sm font-semibold text-gray-700 block mb-3">{{
                    t("map.socketType")
                }}</span>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="connector in allConnectors"
                        :key="connector"
                        :class="[
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                            selectedConnectors.includes(connector)
                                ? 'bg-[#22c55e] border-[#16a34a] text-white'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-[#22c55e] hover:text-[#22c55e]',
                        ]"
                        @click="emit('toggle-connector', connector)"
                    >
                        {{ CONNECTOR_LABELS[connector] || connector }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { X } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { CONNECTOR_LABELS } from "@/constants/connectors";

const { t } = useI18n();

defineProps<{
    open: boolean;
    isMobile: boolean;
    allConnectors: readonly string[];
    selectedConnectors: string[];
    distanceActive: boolean;
    sliderValue: number;
}>();

const emit = defineEmits<{
    close: [];
    reset: [];
    "toggle-connector": [connector: string];
    "slider-change": [value: number];
    "slider-commit": [value: number];
}>();

function onSliderInput(e: Event) {
    const value = Number((e.target as HTMLInputElement).value);
    emit("slider-change", value);
}

function onSliderChange(e: Event) {
    // fires when user releases the slider
    const value = Number((e.target as HTMLInputElement).value);
    emit("slider-commit", value);
}
</script>
