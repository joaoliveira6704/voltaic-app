<script setup>
import { AdminUserColumns } from "@/utils/constants";

const isAddUserModalOpen = ref(false);
const searchTerm = ref("");

const userStore = useUserStore();
const { users } = storeToRefs(userStore);

const companyStore = useCompanyStore();

const filtered = computed(() =>
    users.value.filter((u) =>
        u.username.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
);

const getCompanyName = (companyId) => {
    return companyStore.getCompanyName(companyId);
};

onMounted(() => {
    userStore.fetchUsers();
    companyStore.fetchCompanies();
});
</script>

<template>
    <AdminPage
        v-model:search="searchTerm"
        title="Users"
        button-text="Add new user"
        @add="isAddUserModalOpen = true"
    >
        <template #modal>
            <AddUserModal
                :is-open="isAddUserModalOpen"
                @close="isAddUserModalOpen = false"
            />
        </template>

        <AdminTable
            :rows="users"
            :columns="AdminUserColumns"
            @edit="editUser"
            @delete="deleteUser"
            type="users"
        >
            <template #default="{ row }">
                <TableCell class="font-mono text-xs font-bold">{{
                    row.username
                }}</TableCell>
                <TableCell class="font-mono text-xs"
                    >{{ row.firstName }} {{ row.lastName }}</TableCell
                >
                <TableCell class="font-mono text-xs text-muted-foreground">{{
                    row.email
                }}</TableCell>
                <TableCell
                    ><StatusBadge type="users" :value="row.role"
                /></TableCell>
                <TableCell
                    ><StatusBadge :value="getCompanyName(row.companyId)"
                /></TableCell>
                <TableCell class="font-mono text-xs">{{
                    row.vehicles?.length ?? 0
                }}</TableCell>
            </template>
        </AdminTable>
    </AdminPage>
</template>
