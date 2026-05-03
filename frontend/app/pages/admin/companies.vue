<script setup>
import { AdminCompanyColumns } from "@/utils/constants";

const isAddCompanyModalOpen = ref(false);
const searchTerm = ref("");

const companyStore = useCompanyStore();
const { companies } = storeToRefs(companyStore);

const filtered = computed(() =>
    companies.value.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
);

const getCompanyName = (companyId) => {
    return companyStore.getCompanyName(companyId);
};

onMounted(() => {
    companyStore.fetchCompanies();
});
</script>

<template>
    <AdminPage
        v-model:search="searchTerm"
        title="Companies"
        button-text="Add new company"
        @add="isAddUserModalOpen = true"
    >
        <template #modal>
            <AddUserModal
                :is-open="isAddUserModalOpen"
                @close="isAddUserModalOpen = false"
            />
        </template>

        <AdminTable
            :rows="companies"
            :columns="AdminCompanyColumns"
            @edit="editCompany"
            @delete="deleteUser"
            type="company"
        >
            <template #default="{ row }">
                <TableCell class="font-mono text-xs font-bold">{{
                    row.companyId
                }}</TableCell>
                <TableCell class="font-mono text-xs">{{ row.name }}</TableCell>
                <TableCell class="font-mono text-xs text-muted-foreground">{{
                    row.workingArea.coordinates.join(", ")
                }}</TableCell>
            </template>
        </AdminTable>
    </AdminPage>
</template>
