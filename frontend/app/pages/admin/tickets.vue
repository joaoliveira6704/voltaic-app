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

const getUserName = (userId) => {
    return userStore.getUserById(userId);
};

onMounted(() => {
    ticketStore.fetchTickets();
    userStore.fetchUsers();
});
</script>

<template>
    <AdminPage
        v-model:search="searchTerm"
        title="Tickets"
        button-text="Add new ticket"
        @add="isAddUserModalOpen = true"
    >
        <template #modal>
            <AddTicketModal
                :is-open="isAddTicketModalOpen"
                @close="isAddTicketModalOpen = false"
            />
        </template>

        <AdminTable
            :rows="tickets"
            :columns="AdminTicketColumns"
            @edit="editTicket"
            @delete="deleteUser"
            type="users"
        >
            <template #default="{ row }">
                <TableCell class="font-mono text-xs font-bold">{{
                    row.ticketId
                }}</TableCell>
                <TableCell class="font-mono text-xs"
                    >@{{ getUserName(row.createdBy) || "-" }}</TableCell
                >
                <TableCell class="font-mono text-xs text-muted-foreground">{{
                    row.title
                }}</TableCell>
                <TableCell>{{ row.description.slice(0, 20) }}...</TableCell>
                <TableCell>{{ row.remarks || "No remarks" }}</TableCell>
                <TableCell
                    ><StatusBadge type="tickets" :value="row.status"
                /></TableCell>
            </template>
        </AdminTable>
    </AdminPage>
</template>
