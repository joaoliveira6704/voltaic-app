<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { CompanyPersonnelColumns } from "@/utils/constants";
import PersonnelTable from "~/components/company/personnel/PersonnelTable.vue";
import { UserMinus, UserPlus } from "lucide-vue-next";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";
import Swal from "sweetalert2";
import { toast } from "vue-sonner";

const { t } = useI18n();
const companyStore = useCompanyStore();

const token = useCookie("token");
const apiBase = useRuntimeConfig().public.apiBaseUrl;

const isPending = ref(true);
const companyUsers = ref<any[]>([]);
const searchQuery = ref("");
const isAddingWorker = ref(false);

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
  try {
    const data = await $fetch<any>(
      `${apiBase}/api/users?companyId=${companyId}`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    );
    companyUsers.value = data.data.data;
    console.log(companyUsers.value);
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

  try {
    await $fetch(`${apiBase}/api/users/${userId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token.value}` },
      body: { companyId: "" },
    });
    companyUsers.value = companyUsers.value.filter((u) => u.userId !== userId);
    toast.success("User removed from company");
  } catch (e) {
    console.error("Failed to remove user:", e);
    toast.error("Failed to remove user");
  }
}

async function addWorker() {
  if (!searchQuery.value.trim()) return;
  isAddingWorker.value = true;

  try {
    const data = await $fetch<any>(
      `${apiBase}/api/users?search=${encodeURIComponent(searchQuery.value)}`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    );

    const users = data.data ?? data;
    if (!users || users.length === 0) {
      toast.error("User not found");
      return;
    }

    const user = users[0];
    if (user.role !== "worker") {
      toast.error("User is not a worker");
      return;
    }
    if (user.companyId && user.companyId !== "") {
      toast.error("User already belongs to a company");
      return;
    }

    await $fetch(`${apiBase}/api/users/${user.userId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token.value}` },
      body: { companyId: companyStore.currentCompany?.companyId },
    });

    companyUsers.value.push(user);
    searchQuery.value = "";
    toast.success("Worker added to company");
  } catch (e) {
    console.error("Failed to add worker:", e);
    toast.error("Failed to add worker");
  } finally {
    isAddingWorker.value = false;
  }
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
      <DashboardCard :has-line="false">
        <div class="w-full space-y-4">
          <div class="flex items-center justify-between px-6 pt-4">
            <h2 class="text-xs font-bold uppercase text-gray-400 dark:text-white">
              {{ currentCompany?.name || '' }} {{ t('nav.personnel') }}
            </h2>
            <div class="flex items-center gap-2">
              <Input
                v-model="searchQuery"
                placeholder="Username or email"
                class="h-8 text-xs w-56"
                @keyup.enter="addWorker"
              />
              <button
                class="flex items-center gap-1 text-xs"
                :disabled="isAddingWorker"
                @click="addWorker"
              >
                <UserPlus class="h-4 w-4" />
                Add Worker
              </button>
            </div>
          </div>

          <hr class="w-full dark:border-[#333333]" >

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
                <StatusBadge
                  :value="row.role"
                  :user-id="row.userId"
                  type="users"
                  :allowed-keys="['worker', 'company-manager']"
                  @update:value="handleRoleChange"
                />
              </TableCell>
              <TableCell>
                <button
                  class="text-red-600 hover:text-red-800"
                  @click="removeFromCompany(row.userId, row.username)"
                >
                  <UserMinus class="h-6 w-6" />
                </button>
              </TableCell>
            </template>
          </PersonnelTable>
        </CardContent>
        </div>
      </DashboardCard>
    </template>
  </div>
</template>
