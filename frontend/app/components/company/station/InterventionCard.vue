<script setup lang="ts">
import type { Ticket } from "@/types/ticket";

const { t } = useI18n();
defineProps<{
    ticket: Ticket;
}>();

const emit = defineEmits<{
    (e: "update:status", ticketId: string, status: string): void;
    (e: "select"): void;
}>();

function onStatusChange({ ticketId, status }: { ticketId: string; status: string }) {
    emit("update:status", ticketId, status);
}
</script>

<template>
    <div
        class="border px-4 py-5 rounded-xl w-full bg-white/80 dark:bg-[#232323] dark:border-[#2a2a2a] flex flex-col gap-0 dark:hover:bg-black/30 h-full cursor-pointer transition-colors"
        @click="emit('select')"
    >
        <!-- Title + badge: always at top -->
        <div class="flex justify-around gap-4 items-center mb-3">
            <h3 class="text-lg font-bold leading-tight line-clamp-2">{{ ticket.title }}</h3>
            <StatusBadge
                :value="ticket.status"
                :ticket-id="ticket.ticketId"
                type="tickets"
                @update:value="onStatusChange"
            />
        </div>

        <!-- Description: grows to fill space, pushing remarks down -->
        <div class="text-sm dark:text-white/80 text-black flex-1 line-clamp-4">
            {{ ticket.description }}
        </div>

        <!-- Remarks: always at bottom -->
        <div
            class="flex justify-end text-xs italic text-neutral-600 mt-3 pt-3 border-t border-[#2a2a2a] line-clamp-1"
        >
            {{ t("interventionCard.remarks") }} {{ ticket.remarks || "—" }}
        </div>
    </div>
</template>
