<script setup lang="ts">
import type { Ticket } from "@/types/ticket";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-vue-next";

const { t } = useI18n();
const props = defineProps<{
    ticket: Ticket;
}>();

const getBgClass = computed(() => {
    switch (props.ticket.status) {
        case "closed":
            return "bg-red-300 border-red-500 text-red-500";
        case "open":
            return "bg-blue-300 border-blue-500 text-blue-500";
        case "resolved":
            return "bg-green-300 border-green-500 text-green-500";
        default:
            return "bg-yellow-300 border-yellow-500 text-yellow-500";
    }
});

const ticketTriggerOpen = ref(false);

//ADICIONAR QUEM CRIOU
</script>

<template>
    <div
        class="border px-4 py-5 rounded-xl bg-white/80 dark:bg-[#232323] dark:border-[#2a2a2a] flex flex-col gap-0 dark:hover:bg-black/30 h-full"
    >
        <!-- Title + badge: always at top -->
        <div class="flex justify-between gap-2 items-start mb-3">
            <h3 class="text-xl font-bold leading-tight">{{ ticket.title }}</h3>
            <StatusBadge :value="ticket.status" type="tickets" />
        </div>

        <!-- Description: grows to fill space, pushing remarks down -->
        <div class="text-sm dark:text-white/80 text-black flex-1">
            {{ ticket.description }}
        </div>

        <!-- Remarks: always at bottom -->
        <div
            class="flex justify-end text-xs italic text-neutral-600 mt-3 pt-3 border-t border-[#2a2a2a]"
        >
            {{ t("interventionCard.remarks") }} {{ ticket.description.slice(-3) }}
        </div>
    </div>
</template>
