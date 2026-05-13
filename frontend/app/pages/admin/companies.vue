<script setup>
import { AdminCompanyColumns } from "@/utils/constants";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";

const { t } = useI18n();

useHead({
    title: t("admin.companies.title"),
});

const isAddCompanyModalOpen = ref(false);
const isPending = ref(true);
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

companyStore.fetchCompanies(100).finally(() => {
    isPending.value = false;
});
</script>

<template>
    <template v-if="isPending">
        <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-4">
            <Skeleton class="h-8 w-[200px]" />
            <Skeleton class="h-4 w-[250px] mb-4" />
            <div class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]">
                <SkeletonTable :columns="4" :rows="5" />
            </div>
        </div>
    </template>
    <AdminPage
        v-else
        v-model:search="searchTerm"
        :title="t('admin.companies.title')"
        :button-text="t('admin.companies.createNew')"
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
