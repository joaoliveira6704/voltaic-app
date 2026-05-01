<script setup>
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EyeIcon } from "lucide-vue-next";
import { PencilIcon } from "lucide-vue-next";
import { Trash2Icon } from "lucide-vue-next";

useHead({
    title: "Voltaic - Admin",
    meta: [{ name: "description", content: "View and manage users." }],
});

const { t } = useI18n();
const userStore = useUserStore();
const { users, currentUser, userRole } = storeToRefs(userStore);
const { fetchCurrentUser, fetchUsers } = userStore;

const config = useRuntimeConfig();
const token = useCookie("token");

// Fetch users + companies in parallel
const { data: companies } = await useAsyncData("companies", () =>
    $fetch(`${config.public.apiBaseUrl}/api/companies`, {
        headers: { Authorization: `Bearer ${token.value}` },
    }),
);

await useAsyncData("currentUser", () => fetchCurrentUser());
await useAsyncData("users", () => fetchUsers());

// Build a lookup map: companyId -> name
const companyMap = computed(() => {
    if (!companies.value) return {};
    return Object.fromEntries(
        companies.value.map((c) => [c.companyId, c.name]),
    );
});

const getCompanyName = (companyId) => {
    if (!companyId) return "—";
    return companyMap.value[companyId] ?? "Unknown";
};
</script>

<template>
    <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto">
        <EditProfileModal
            :is-open="isEditModalOpen"
            :user="currentUser"
            @close="isEditModalOpen = false"
            @updated="fetchCurrentUser"
        />
        <AddVehicleModal
            :is-open="isAddVehicleModal"
            @close="isAddVehicleModal = false"
            @added="userStore.fetchCurrentUser()"
        />
        <DropDown :role="userRole" />
        <Grid :split-cell-d="userRole === 'admin'">
            <template #cell-a>
                <DashboardCard title="Admin">
                    <NavGroup :role="currentUser.role" />
                </DashboardCard>
            </template>
            <template #cell-b>
                <DashboardCard
                    :title="t('nav.users')"
                    :has-btn="true"
                    :button-text="t('admin.users.addNewUser')"
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    class="font-mono text-xs uppercase tracking-tight"
                                    >Username</TableHead
                                >
                                <TableHead
                                    class="font-mono text-xs uppercase tracking-tight"
                                    >Name</TableHead
                                >
                                <TableHead
                                    class="font-mono text-xs uppercase tracking-tight"
                                    >Email</TableHead
                                >
                                <TableHead
                                    class="font-mono text-xs uppercase tracking-tight"
                                    >Role</TableHead
                                >
                                <TableHead
                                    class="font-mono text-xs uppercase tracking-tight"
                                    >Company</TableHead
                                >
                                <TableHead
                                    class="font-mono text-xs uppercase tracking-tight"
                                    >Vehicles</TableHead
                                >
                                <TableHead
                                    class="font-mono text-xs uppercase tracking-tight text-left"
                                    >Actions</TableHead
                                >
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow
                                v-for="user in users"
                                :key="user.userId"
                                class="cursor-pointer hover:bg-muted/50"
                            >
                                <TableCell
                                    class="font-mono text-xs font-bold"
                                    >{{ user.username }}</TableCell
                                >
                                <TableCell class="font-mono text-xs"
                                    >{{ user.firstName }}
                                    {{ user.lastName }}</TableCell
                                >
                                <TableCell
                                    class="font-mono text-xs text-muted-foreground"
                                    >{{ user.email }}</TableCell
                                >
                                <TableCell>
                                    <span
                                        class="font-mono text-xs uppercase tracking-tight px-2 py-0.5 rounded bg-muted"
                                    >
                                        {{ user.role }}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span
                                        class="font-mono text-xs uppercase tracking-tight px-2 py-0.5 rounded bg-muted"
                                    >
                                        {{ getCompanyName(user.companyId) }}
                                    </span>
                                </TableCell>
                                <TableCell
                                    class="font-mono text-xs text-muted-foreground"
                                >
                                    {{ user.vehicles?.length ?? 0 }}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <Button
                                            variant="ghost"
                                            class="hover:text-blue-500"
                                            size="sm"
                                        >
                                            <PencilIcon />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            class="hover:text-red-500"
                                            size="sm"
                                        >
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </DashboardCard>
            </template>
        </Grid>
    </div>
</template>
