<script setup lang="ts">
import { AdminUserColumns, UserRoles } from "@/utils/constants";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";
import Pagination from "~/components/ui/Pagination.vue";

const { t } = useI18n();

useHead({
    title: t("admin.users.title"),
});

const isAddUserModalOpen = ref(false);
const isEditUserModalOpen = ref(false);
const isPending = ref(true);

const searchTerm = ref("");
const page = ref(1);
const sortColumn = ref("");
const sortDirection = ref("");
const roleFilter = ref("");

const userStore = useUserStore();
const { users, currentPage, totalPages } = storeToRefs(userStore);

function buildParams() {
    const params = { view: "admin" } as Record<string, string>;
    if (searchTerm.value) params.search = searchTerm.value;
    if (sortColumn.value && sortDirection.value) {
        params.sort = `${sortColumn.value}:${sortDirection.value}`;
    }
    if (roleFilter.value) params.role = roleFilter.value;
    return params;
}

async function fetchData() {
    await userStore.fetchUsers(page.value, 25, buildParams());
}

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

function onRoleFilterChange(event: Event) {
    roleFilter.value = (event.target as HTMLSelectElement).value;
    page.value = 1;
    fetchData();
}

async function deleteUser(user: any) {
    try {
        await userStore.deleteUser(user.userId, user.username);
    } catch (error) {
        console.log(error);
    }
}

const editingUser = ref<any>(null);

function openEditUserModal(user: any) {
    editingUser.value = user;
    isEditUserModalOpen.value = true;
}

function onUserUpdated() {
    isEditUserModalOpen.value = false;
    editingUser.value = null;
    fetchData();
}

function handleRoleChange(userId: string, role: string) {
    userStore.editUserRole(userId, role);
}

let debounceTimer: ReturnType<typeof setTimeout>;
watch(searchTerm, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        page.value = 1;
        fetchData();
    }, 300);
});

userStore.fetchUsers(1, 25, { view: "admin" }).finally(() => {
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
    <template v-if="isPending" class="pr-6">
        <DashboardCard class="mt-4 mx-2"
            ><div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-4">
                <Skeleton class="h-8 w-[200px]" />
                <Skeleton class="h-4 w-[250px] mb-4" />
                <div
                    class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]"
                >
                    <SkeletonTable :columns="7" :rows="5" />
                </div></div
        ></DashboardCard>
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

        <div class="flex items-center gap-2 mb-2">
            <select
                :value="roleFilter"
                class="text-xs border border-black rounded-md px-2 py-1.5 bg-transparent"
                @change="onRoleFilterChange"
            >
                <option value="">All roles</option>
                <option
                    v-for="r in UserRoles"
                    :key="r.key"
                    :value="r.key"
                >
                    {{ r.key }}
                </option>
            </select>
        </div>

        <AdminTable
            :rows="users"
            :columns="AdminUserColumns"
            :sort-column="sortColumn"
            :sort-direction="sortDirection"
            type="users"
            @sort="onSort"
            @edit="openEditUserModal"
            @delete="deleteUser"
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
                <TableCell class="text-xs">{{
                    row.isWorkerOrManager ? row.companyName : "-"
                }}</TableCell>
                <TableCell class="text-xs">{{
                    row.vehicleQuantity ?? 0
                }}</TableCell>
            </template>
        </AdminTable>
        <Pagination
            class="pt-4"
            :current-page="currentPage"
            :total-pages="totalPages"
            @update:page="onPageChange"
        />
    </AdminPage>
</template>
