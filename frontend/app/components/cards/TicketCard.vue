<script setup lang="ts">
import { type NavItem } from "@/utils/navigation";

const { t } = useI18n();

interface TicketData {
    id: number;
    station: string; // e.g., 'label'
    state: string; // e.g., 'open'
    desc: string; // e.g., 'log error'
}

interface Props {
    data: TicketData;
}

const props = defineProps<Props>();
</script>

<template>
    <div
        class="relative w-60 h-fit bg-neutral-200 rounded-xl p-5 gap-2 flex flex-col justify-between group"
    >
        <div class="flex items-start gap-3">
            <span class="text-md font-black uppercase text-neutral-800">
                {{ data.id }}
            </span>
        </div>

        <div class="flex flex-col items-start gap-2">
            <div v-if="data.station" class="flex flex-row gap-1 items-center">
                <span class="text-xs font-bold text-neutral-600 uppercase">
                    {{ t("ticketCard.station") }}
                </span>
                <span class="text-sm font-bold text-neutral-800">
                    {{ data.station }}
                </span>
            </div>
            <div v-if="data.desc" class="flex flex-row gap-1 items-center">
                <span class="text-xs font-bold text-neutral-600 uppercase">
                    {{ t("ticketCard.desc") }}
                </span>
                <span class="text-sm font-bold text-neutral-800">
                    {{ data.desc }}
                </span>
            </div>
            <div class="flex flex-row gap-1 items-center">
                <span class="text-xs font-bold text-neutral-600 uppercase">
                    {{ t("ticketCard.state") }}
                </span>
                <span class="text-sm font-bold text-neutral-800">
                    {{ data.state }}
                </span>
            </div>
        </div>
    </div>
</template>
