<script setup>
import { AdminUserColumns } from "@/utils/constants";

const isAddUserModalOpen = ref(false);
const isEditUserModalOpen = ref(false);

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

const deleteUser = async (user) => {
    try {
        await userStore.deleteUser(user.userId, user.username);
    } catch (error) {
        console.log(error);
        return;
    }
};

const editingUser = ref(null);

const openEditUserModal = (user) => {
    editingUser.value = user;
    isEditUserModalOpen.value = true;
};

const onUserUpdated = () => {
    isEditUserModalOpen.value = false;
    editingUser.value = null;
};

const handleRoleChange = async (userId, role) => {
    userStore.editUserRole(userId, role);
};

onMounted(() => {
    userStore.fetchUsers();
    companyStore.fetchCompanies();
});
</script>

<template>
    <AdminEditUserModal
        :is-open="isEditUserModalOpen"
        :user="editingUser"
        @close="
            isEditUserModalOpen = false;
            editingUser = null;
        "
        @updated="onUserUpdated"
    />
    <AdminPage
        v-model:search="searchTerm"
        title="Users"
        button-text="Create new user"
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
            @edit="openEditUserModal"
            @delete="deleteUser"
            type="users"
        >
            <template #default="{ row }">
                <TableCell class="text-xs font-bold">{{
                    row.username
                }}</TableCell>
                <TableCell class="text-xs"
                    >{{ row.firstName }} {{ row.lastName }}</TableCell
                >
                <TableCell class="text-xs text-muted-foreground label">{{
                    row.email
                }}</TableCell>
                <TableCell
                    ><StatusBadge
                        :value="row.role"
                        :user-id="row.userId"
                        type="users"
                        @update:value="
                            ({ userId, role }) => handleRoleChange(userId, role)
                        "
                /></TableCell>
                <TableCell class="text-xs"
                    >{{ getCompanyName(row.companyId) }}
                </TableCell>
                <TableCell class="text-xs">{{
                    row.vehicles?.length ?? 0
                }}</TableCell>
            </template>
        </AdminTable>
    </AdminPage>
</template>
