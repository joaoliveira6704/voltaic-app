<script setup lang="ts">
import { computed } from "vue";

const { t } = useI18n();

type StationStatus = "available" | "ticket" | "off";

interface Props {
    status: StationStatus;
    label?: string;
}

const props = defineProps<Props>();

const statusConfig = computed(() => {
    const map = {
        available: { color: "bg-green-500", text: t("stationsLabel.available") },
        ticket: { color: "bg-yellow-400", text: t("stationsLabel.ticketOpen") },
        off: { color: "bg-red-500", text: t("stationsLabel.offline") },
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
