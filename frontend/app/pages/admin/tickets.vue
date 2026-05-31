<script setup lang="ts">
import { AdminTicketColumns, TicketStates } from "@/utils/constants";
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
const sortColumn = ref("");
const sortDirection = ref("");
const statusFilter = ref("");

const ticketStore = useTicketStore();
const { tickets, currentPage, totalPages } = storeToRefs(ticketStore);

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
    fetchData();
}

function onSort({ column, direction }: { column: string; direction: string }) {
    sortColumn.value = column;
    sortDirection.value = direction;
    page.value = 1;
    fetchData();
}

function onStatusFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    statusFilter.value = target.value;
    page.value = 1;
    fetchData();
}

function buildParams() {
    const params: Record<string, string> = {};
    if (searchTerm.value) params.search = searchTerm.value;
    if (sortColumn.value && sortDirection.value) {
        params.sort = `${sortColumn.value}:${sortDirection.value}`;
    }
    if (statusFilter.value) params.status = statusFilter.value;
    return params;
}

async function fetchData() {
    await ticketStore.fetchTickets(page.value, 20, buildParams());
}

let debounceTimer: ReturnType<typeof setTimeout>;
watch(searchTerm, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        page.value = 1;
        fetchData();
    }, 300);
});

ticketStore.fetchTickets(1, 20).finally(() => {
    isPending.value = false;
});
</script>

<template>
    <template v-if="isPending" class="pr-6">
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
        <div class="flex items-center gap-2 mb-2">
            <select
                :value="statusFilter"
                class="text-xs border border-black rounded-md px-2 py-1.5 bg-transparent"
                @change="onStatusFilterChange"
            >
                <option value="">All statuses</option>
                <option v-for="s in TicketStates" :key="s.key" :value="s.key">
                    {{ s.label }}
                </option>
            </select>
        </div>
        <AdminTable
            :rows="tickets"
            :columns="AdminTicketColumns"
            type="tickets"
            :sort-column="sortColumn"
            :sort-direction="sortDirection"
            @sort="onSort"
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
            :current-page="currentPage"
            :total-pages="totalPages"
            @update:page="onPageChange"
        />
    </AdminPage>
</template>
