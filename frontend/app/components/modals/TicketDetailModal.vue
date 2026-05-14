<script setup lang="ts">
import type { Ticket } from "@/types/ticket";
import { X, Calendar, Clock, User, Hash, MapPin, FileText } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import StatusBadge from "~/components/admin/StatusBadge.vue";

const { t } = useI18n();

defineProps<{
  isOpen: boolean;
  ticket: Ticket | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update:status", ticketId: string, status: string): void;
}>();

function onStatusChange({ ticketId, status }: { ticketId: string; status: string }) {
  emit("update:status", ticketId, status);
}

function formatDate(date: Date | string | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="(v) => !v && emit('close')">
    <DialogContent class="sm:max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-lg font-bold leading-tight pr-8">
          {{ ticket?.title }}
        </DialogTitle>
        <DialogClose class="absolute top-4 right-4 p-0.5 transition-colors rounded-md hover:bg-secondary">
          <X class="w-4 h-4" />
        </DialogClose>
      </DialogHeader>

      <template v-if="ticket">
        <div class="flex items-center gap-3">
          <StatusBadge
            :value="ticket.status"
            :ticket-id="ticket.ticketId"
            type="tickets"
            @update:value="(s) => onStatusChange({ ticketId: ticket.ticketId, status: s })"
          />
          <span class="text-xs text-gray-500 dark:text-white/40">
            <Hash class="w-3 h-3 inline mr-1" />{{ ticket.ticketId.slice(0, 8) }}...
          </span>
        </div>

        <div class="space-y-3 text-sm">
          <div class="flex items-start gap-2">
            <FileText class="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
            <div>
              <span class="font-semibold text-xs text-gray-500 uppercase tracking-wide block mb-1">{{ t("ticketDetail.description") }}</span>
              <p class="text-gray-800 dark:text-white/80 whitespace-pre-wrap">{{ ticket.description }}</p>
            </div>
          </div>

          <div v-if="ticket.remarks" class="flex items-start gap-2">
            <FileText class="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
            <div>
              <span class="font-semibold text-xs text-gray-500 uppercase tracking-wide block mb-1">{{ t("ticketDetail.remarks") }}</span>
              <p class="text-gray-800 dark:text-white/80 whitespace-pre-wrap">{{ ticket.remarks }}</p>
            </div>
          </div>

          <div class="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <User class="w-4 h-4 shrink-0 text-gray-400" />
              <div>
                <span class="text-xs text-gray-500 block">{{ t("ticketDetail.createdBy") }}</span>
                <span class="text-sm font-medium">{{ ticket.createdBy?.slice(0, 12) ?? "—" }}</span>
              </div>
            </div>

            <div v-if="ticket.stationId" class="flex items-center gap-2">
              <MapPin class="w-4 h-4 shrink-0 text-gray-400" />
              <div>
                <span class="text-xs text-gray-500 block">{{ t("ticketDetail.station") }}</span>
                <span class="text-sm font-medium">{{ ticket.stationId.slice(0, 12) }}...</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 shrink-0 text-gray-400" />
              <div>
                <span class="text-xs text-gray-500 block">{{ t("ticketDetail.created") }}</span>
                <span class="text-sm font-medium">{{ formatDate(ticket.createdAt) }}</span>
              </div>
            </div>

            <div v-if="ticket.closedAt" class="flex items-center gap-2">
              <Clock class="w-4 h-4 shrink-0 text-gray-400" />
              <div>
                <span class="text-xs text-gray-500 block">{{ t("ticketDetail.closed") }}</span>
                <span class="text-sm font-medium">{{ formatDate(ticket.closedAt) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 shrink-0 text-gray-400" />
              <div>
                <span class="text-xs text-gray-500 block">{{ t("ticketDetail.updated") }}</span>
                <span class="text-sm font-medium">{{ formatDate(ticket.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>
