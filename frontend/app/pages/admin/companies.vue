<script setup>
import { AdminCompanyColumns } from "@/utils/constants";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";
import Pagination from "~/components/ui/Pagination.vue";

const { t } = useI18n();

useHead({
  title: t("admin.companies.title"),
});

const isAddCompanyModalOpen = ref(false);
const isEditDialogOpen = ref(false);
const isPending = ref(true);
const searchTerm = ref("");
const page = ref(1);
const selectedCompany = ref(null);

const companyStore = useCompanyStore();
const { companies, currentPage, totalPages } = storeToRefs(companyStore);

function onPageChange(p) {
  page.value = p;
  companyStore.fetchCompanies(p, 100, { view: "admin" });
}

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

companyStore.fetchCompanies(1, 100, { view: "admin" }).finally(() => {
  isPending.value = false;
});

const editCompany = (company) => {
  selectedCompany.value = company;
  isEditDialogOpen.value = true;
};
</script>

<template>
  <template v-if="isPending">
    <DashboardCard class="mt-4 mx-2">
      <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-4">
        <Skeleton class="h-8 w-[200px]" />
        <Skeleton class="h-4 w-[250px] mb-4" />
        <div
          class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]"
        >
          <SkeletonTable :columns="4" :rows="5" />
        </div>
      </div>
    </DashboardCard>
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
      <CompanyEditDialog
        :is-open="isEditDialogOpen"
        :company="selectedCompany"
        @close="isEditDialogOpen = false"
        @saved="companyStore.fetchCompanies(page, 100, { view: 'admin' })"
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
        <TableCell class="text-xs font-bold">{{ row.companyId }}</TableCell>
        <TableCell class="text-xs">{{ row.name }}</TableCell>
        <TableCell class="text-xs">{{ row.memberCount }}</TableCell>
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
