<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import {
  CompanyPersonnelColumns,
  UserRoles,
  colorMap,
} from "@/utils/constants";
import PersonnelTable from "~/components/company/personnel/PersonnelTable.vue";
import { UserRoundMinus } from "lucide-vue-next";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";
import Swal from "sweetalert2";
import { toast } from "vue-sonner";

const { t } = useI18n();
const companyStore = useCompanyStore();

const isPending = ref(true);
const companyUsers = ref<any[]>([]);

async function init() {
  await companyStore.fetchCurrentCompany();
  const companyId = companyStore.currentCompany?.companyId;
  if (companyId) {
    await fetchCompanyUsers(companyId);
  }
  isPending.value = false;
}
init();

const currentCompany = computed(() => companyStore.currentCompany || "");

async function fetchCompanyUsers(companyId: string) {
  const token = useCookie("token").value;
  const apiBase = useRuntimeConfig().public.apiBaseUrl;
  try {
    const data = await $fetch<any>(
      `${apiBase}/api/users?companyId=${companyId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    companyUsers.value = data.data ?? data;
  } catch (e) {
    console.error("Failed to fetch company users:", e);
  }
}

async function removeFromCompany(userId: string, username: string) {
  const confirmed = await Swal.fire({
    title: "Remove User",
    text: `Remove ${username} from the company?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    confirmButtonText: "Yes, Remove",
    reverseButtons: true,
    customClass: {
      popup:
        "text-sm dark:bg-[#0a0a0a] dark:border dark:border-[#171717] rounded-xl dark:text-white/80",
      cancelButton:
        "bg-white text-black hover:bg-gray-300 dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#2a2a2a]",
    },
  });

  if (!confirmed.isConfirmed) return;

  const token = useCookie("token").value;
  const apiBase = useRuntimeConfig().public.apiBaseUrl;
  try {
    await $fetch(`${apiBase}/api/users/${userId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: { companyId: "" },
    });
    companyUsers.value = companyUsers.value.filter((u) => u.userId !== userId);
    toast.success("User removed from company");
  } catch (e) {
    console.error("Failed to remove user:", e);
    toast.error("Failed to remove user");
  }
}

function getRoleColor(role: string) {
  const entry = UserRoles.find((r) => r.key === role);
  return entry ? colorMap[entry.color] : "bg-muted text-muted-foreground";
}
</script>

<template>
  <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
    <template v-if="isPending">
      <DashboardCard>
        <Skeleton class="h-8 w-[250px]" />
        <div
          class="mt-6 rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]"
        >
          <SkeletonTable :columns="5" :rows="5" />
        </div>
      </DashboardCard>
    </template>
    <template v-else>
      <DashboardCard
        :title="`${currentCompany?.name || ''} ${t('nav.personnel')}`"
        :has-line="false"
      >
        <CardContent class="px-0">
          <PersonnelTable
            :rows="companyUsers"
            :columns="CompanyPersonnelColumns"
            row-key="userId"
          >
            <template #default="{ row }">
              <TableCell class="text-sm font-bold">{{
                row.username
              }}</TableCell>
              <TableCell class="text-sm"
                >{{ row.firstName }} {{ row.lastName }}</TableCell
              >
              <TableCell class="text-sm text-muted-foreground">{{
                row.email
              }}</TableCell>
              <TableCell class="text-sm">
                <span
                  class="text-xs uppercase px-2 py-0.5 rounded"
                  :class="getRoleColor(row.role)"
                >
                  {{ row.role }}
                </span>
              </TableCell>
              <TableCell>
                <button
                  class="text-red-600 hover:text-red-800"
                  @click="removeFromCompany(row.userId, row.username)"
                >
                  <UserRoundMinus class="h-5 w-5" />
                </button>
              </TableCell>
            </template>
          </PersonnelTable>
        </CardContent>
      </DashboardCard>
    </template>
  </div>
</template>
