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

const deleteCompany = (company) => {
    try {
        companyStore.deleteCompany(company.companyId, company.name);
    } catch (error) {
        console.log(error);
    }
};

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
        button-text="Create new company"
        @add="isAddCompanyModalOpen = true"
    >
        <template #modal>
            <AddCompanyModal
                :is-open="isAddCompanyModalOpen"
                @close="isAddCompanyModalOpen = false"
            />
        </template>

        <AdminTable
            :rows="companies"
            :columns="AdminCompanyColumns"
            @edit="editCompany"
            @delete="deleteCompany"
            type="company"
        >
            <template #default="{ row }">
                <TableCell class="text-xs font-bold">{{
                    row.companyId
                }}</TableCell>
                <TableCell class="text-xs">{{ row.name }}</TableCell>
                <TableCell class="text-xs text-muted-foreground">{{
                    row.workingArea.coordinates.join(", ")
                }}</TableCell>
            </template>
        </AdminTable>
    </AdminPage>
</template>
