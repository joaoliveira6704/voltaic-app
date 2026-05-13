<script setup>
import { AdminUserColumns } from "@/utils/constants";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";

const { t } = useI18n();

useHead({
    title: t("admin.users.title"),
});

const isAddUserModalOpen = ref(false);
const isEditUserModalOpen = ref(false);
const isPending = ref(true);

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

userStore
    .fetchUsers(100)
    .then(() => companyStore.fetchCompanies(100))
    .finally(() => {
        isPending.value = false;
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
        :title="t('admin.users.title')"
        :button-text="t('admin.users.addNewUser')"
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
