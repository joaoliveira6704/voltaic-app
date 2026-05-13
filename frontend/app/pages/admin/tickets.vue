<script setup>
import { AdminTicketColumns } from "@/utils/constants";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";

const { t } = useI18n();

useHead({
    title: t("admin.tickets.title"),
});

const isAddTicketModalOpen = ref(false);
const isPending = ref(true);
const searchTerm = ref("");

const ticketStore = useTicketStore();
const { tickets } = storeToRefs(ticketStore);

const userStore = useUserStore();

const filtered = computed(() =>
    tickets.value.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
);

const deleteTicket = (ticket) => {
    try {
        ticketStore.deleteTicket(ticket.ticketId, ticket.title);
    } catch (error) {
        console.log(error);
    }
};

const getUserName = (userId) => {
    return userStore.getUserById(userId);
};

ticketStore
    .fetchTickets(100)
    .then(() => userStore.fetchUsers(100))
    .finally(() => {
        isPending.value = false;
    });
</script>

<template>
    <template v-if="isPending">
        <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-4">
            <Skeleton class="h-8 w-[200px]" />
            <Skeleton class="h-4 w-[250px] mb-4" />
            <div class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]">
                <SkeletonTable :columns="7" :rows="5" />
            </div>
        </div>
    </template>
    <AdminPage
        v-else
        v-model:search="searchTerm"
        :title="t('admin.tickets.title')"
        :button="false"
    >
        <AdminTable
            :rows="tickets"
            :columns="AdminTicketColumns"
            @edit="editTicket"
            @delete="deleteTicket"
            type="tickets"
        >
            <template #default="{ row }">
                <TableCell class="text-xs font-bold">{{
                    row.ticketId
                }}</TableCell>
                <TableCell class="text-xs"
                    >@{{ getUserName(row.createdBy) || "-" }}</TableCell
                >
                <TableCell>{{ row.title }}</TableCell>
                <TableCell>{{ row.description.slice(0, 20) }}...</TableCell>
                <TableCell class="text-xs text-muted-foreground">{{
                    row.remarks || "No remarks"
                }}</TableCell>
                <TableCell
                    ><StatusBadge type="tickets" :value="row.status"
                /></TableCell>
            </template>
        </AdminTable>
    </AdminPage>
</template>
