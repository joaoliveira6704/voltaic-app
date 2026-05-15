<script setup lang="ts">
import type { Ticket } from "@/types/ticket";
import { ClockIcon } from "lucide-vue-next";

const { t } = useI18n();

const props = defineProps<{
    ticket: Ticket;
}>();

const emit = defineEmits<{
    (e: "update:status", ticketId: string, status: string): void;
    (e: "select"): void;
}>();

function onStatusChange({
    ticketId,
    status,
}: {
    ticketId: string;
    status: string;
}) {
    emit("update:status", ticketId, status);
}

function formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

console.log(props.ticket);

function getOpenTime(
    createdAt: string | Date,
    closedAt?: string | Date | null,
): string {
    const start = new Date(createdAt).getTime();
    const end = closedAt ? new Date(closedAt).getTime() : Date.now();
    const diffMs = end - start;

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
</script>

<template>
    <div
        class="border rounded-xl w-full bg-white/80 dark:bg-[#232323] dark:border-[#2a2a2a] flex flex-row items-stretch dark:hover:bg-black/30 cursor-pointer transition-colors overflow-hidden"
        @click="emit('select')"
    >
        <!-- Left sidebar -->
        <div
            class="flex flex-col items-center justify-center gap-2 px-4 py-4 border-r dark:border-[#2a2a2a] min-w-[110px] text-center"
        >
            <span class="text-xs text-neutral-500 font-mono"
                >#{{ ticket.ticketId }}</span
            >

            <StatusBadge
                :value="ticket.status"
                :ticket-id="ticket.ticketId"
                type="tickets"
                @update:value="onStatusChange"
            />

            <div class="mt-1">
                <div class="text-xl font-bold leading-none">
                    {{ formatTime(ticket.createdAt) }}
                </div>
                <div class="text-xs text-neutral-500 mt-0.5">
                    {{ formatDate(ticket.createdAt) }}
                </div>
            </div>

            <div
                class="flex items-center gap-1 text-xs text-neutral-500 border rounded px-2 py-0.5 mt-1 dark:border-[#3a3a3a]"
            >
                <ClockIcon class="w-3 h-3" />
                <span
                    >Open For
                    {{ getOpenTime(ticket.createdAt, ticket.closedAt) }}</span
                >
            </div>
        </div>

        <!-- Main content -->
        <div class="flex flex-col justify-between flex-1 px-5 py-4 gap-3">
            <div class="flex items-center gap-2">
                <h3 class="text-base font-bold leading-tight">
                    {{ ticket.title }}
                </h3>
            </div>

            <div class="flex flex-wrap gap-6">
                <div class="flex flex-col gap-0.5">
                    <span
                        class="text-xs font-semibold text-neutral-800 dark:text-white/90"
                    >
                        {{ t("interventionCard.lastName") }}
                    </span>
                    <span class="text-sm text-neutral-500">{{
                        ticket.createdByUser?.lastName ?? "—"
                    }}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                    <span
                        class="text-xs font-semibold text-neutral-800 dark:text-white/90"
                    >
                        {{ t("interventionCard.firstName") }}
                    </span>
                    <span class="text-sm text-neutral-500">{{
                        ticket.createdByUser?.firstName ?? "—"
                    }}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                    <span
                        class="text-xs font-semibold text-neutral-800 dark:text-white/90"
                    >
                        Email
                    </span>
                    <span class="text-sm text-neutral-500">{{
                        ticket.createdByUser?.email ?? "—"
                    }}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                    <span
                        class="text-xs font-semibold text-neutral-800 dark:text-white/90"
                    >
                        {{ t("interventionCard.idNumber") }}
                    </span>
                    <span class="text-sm text-neutral-500">{{
                        ticket.ticketId ?? "—"
                    }}</span>
                </div>
            </div>

            <div class="text-xs italic text-neutral-400 line-clamp-1">
                {{ t("interventionCard.remarks") }} {{ ticket.remarks ?? "—" }}
            </div>
        </div>
    </div>
</template>
