<script setup>
import { AdminTicketColumns } from "@/utils/constants";

const isAddTicketModalOpen = ref(false);
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

onMounted(() => {
    ticketStore.fetchTickets();
    userStore.fetchUsers();
});
</script>

<template>
    <AdminPage v-model:search="searchTerm" title="Tickets" :button="false">
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
