<script setup lang="ts">
import { AdminTicketColumns } from "@/utils/constants";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";
import Pagination from "~/components/ui/Pagination.vue";
import TicketDetailModal from "~/components/modals/TicketDetailModal.vue";
import type { Ticket } from "@/types/ticket";

const { t } = useI18n();

useHead({
    title: t("admin.tickets.title"),
});

const isPending = ref(true);
const searchTerm = ref("");
const page = ref(1);
const selectedTicket = ref<Ticket | null>(null);
const isTicketDetailOpen = ref(false);

const ticketStore = useTicketStore();
const { tickets } = storeToRefs(ticketStore);

const filtered = computed(() =>
    tickets.value.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
);

const deleteTicket = (ticket: Ticket) => {
    try {
        ticketStore.deleteTicket(ticket.ticketId, ticket.title);
    } catch (error) {
        console.log(error);
    }
};

const handleStatusUpdate = ({
    ticketId,
    status,
}: {
    ticketId: string;
    status: string;
}) => {
  ticketStore.updateTicket(ticketId, { status });
  if (selectedTicket.value && selectedTicket.value.ticketId === ticketId) {
          selectedTicket.value.status = status;
      }
};

function onPageChange(p: number) {
    page.value = p;
    ticketStore.fetchTickets(p);
}

ticketStore.fetchTickets(1).finally(() => {
    isPending.value = false;
});
</script>

<template>
    <template v-if="isPending">
        <DashboardCard class="mt-4 mx-2">
            <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-4">
                <Skeleton class="h-8 w-[200px]" />
                <Skeleton class="h-4 w-[250px] mb-4" />
                <div
                    class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]"
                >
                    <SkeletonTable :columns="7" :rows="5" />
                </div>
            </div>
        </DashboardCard>
    </template>
    <AdminPage
        v-else
        v-model:search="searchTerm"
        :title="t('admin.tickets.title')"
        :button="false"
    >
        <template #modal>
            <TicketDetailModal
                :is-open="isTicketDetailOpen"
                :ticket="selectedTicket"
                @close="isTicketDetailOpen = false"
                @update:status="
                    (ticketId, status) =>
                        handleStatusUpdate({ ticketId, status })
                "
            />
        </template>
        <AdminTable
            :rows="filtered"
            :columns="AdminTicketColumns"
            type="tickets"
            @delete="deleteTicket"
            @click="
                (row) => {
                    selectedTicket = row;
                    isTicketDetailOpen = true;
                }
            "
        >
            <template #default="{ row }">
                <TableCell class="text-xs font-bold">{{
                    row.ticketId.slice(0, 20) + "..."
                }}</TableCell>
                <TableCell class="text-xs"
                    >@{{ row.createdByUser?.username ?? "-" }}</TableCell
                >
                <TableCell>{{ row.title.slice(0, 40) }}...</TableCell>
                <TableCell>{{ row.description.slice(0, 60) }}...</TableCell>
                <TableCell class="text-xs text-muted-foreground">{{
                    row.remarks || t("admin.tickets.noRemarks")
                }}</TableCell>
                <TableCell
                    ><StatusBadge
                        type="tickets"
                        :value="row.status"
                        :ticket-id="row.ticketId"
                        @update:value="handleStatusUpdate"
                /></TableCell>
            </template>
        </AdminTable>
        <Pagination
            :current-page="ticketStore.currentPage"
            :total-pages="ticketStore.totalPages"
            @update:page="onPageChange"
        />
    </AdminPage>
</template>
