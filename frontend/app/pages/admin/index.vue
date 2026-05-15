<!-- pages/admin/index.vue -->
<script setup>
import { useUserStore } from "~/stores/user";
import { useTicketStore } from "~/stores/ticket";
import { useStationStore } from "~/stores/station";
import { useCompanyStore } from "~/stores/company";
import { storeToRefs } from "pinia";
import { Skeleton, SkeletonMetricCard } from "~/components/ui/Skeleton";

const { t } = useI18n();

useHead({
    title: t("admin.index.title"),
    meta: [
        {
            name: "description",
            content: t("admin.index.description"),
        },
    ],
});
const userStore = useUserStore();
const ticketStore = useTicketStore();
const stationStore = useStationStore();
const companyStore = useCompanyStore();

const { users, currentUser, userRole } = storeToRefs(userStore);
const { tickets } = storeToRefs(ticketStore);
const { stations } = storeToRefs(stationStore);
const { companies } = storeToRefs(companyStore);

const { pending: currentUserPending } = useAsyncData("currentUser", () =>
    userStore.fetchCurrentUser(),
);
const { pending: usersPending } = useAsyncData("users", () =>
    userStore.fetchUsers(),
);
const { pending: ticketsPending } = useAsyncData("tickets", () =>
    ticketStore.fetchTickets(),
);
const { pending: stationsPending } = useAsyncData("stations", () =>
    stationStore.fetchStations(),
);
const { pending: companiesPending } = useAsyncData("companies", () =>
    companyStore.fetchCompanies(),
);

const isPending = computed(
    () =>
        currentUserPending.value ||
        usersPending.value ||
        ticketsPending.value ||
        stationsPending.value ||
        companiesPending.value,
);

const openTickets = computed(
    () => tickets.value.filter((t) => t.status === "open").length,
);
const pendingTickets = computed(
    () => tickets.value.filter((t) => t.status === "pending").length,
);
const closedTickets = computed(
    () => tickets.value.filter((t) => t.status === "closed").length,
);
const onlineStations = computed(
    () => stations.value.filter((s) => s.status === "online").length,
);
const recentTickets = computed(() =>
    [...tickets.value]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
);
</script>

<template>
    <div
        v-if="isPending"
        class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6"
    >
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonMetricCard v-for="n in 4" :key="n" />
        </div>
    </div>
    <div v-else class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <!-- Metric cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
                :title="t('admin.index.totalUsers')"
                :has-line="false"
            >
                <CardContent>
                    <p class="text-3xl font-semibold">{{ users.length }}</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{ t("admin.index.totalUsersSubtext") }}
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard :title="t('admin.index.stations')" :has-line="false">
                <CardContent>
                    <p class="text-3xl font-semibold">{{ stations.length }}</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{
                            t("admin.index.stationsActiveNow", {
                                count: onlineStations,
                            })
                        }}
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard
                :title="t('admin.index.openTickets')"
                :has-line="false"
            >
                <CardContent>
                    <p class="text-3xl font-semibold">{{ openTickets }}</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{ t("admin.index.openTicketsSubtext") }}
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard
                :title="t('admin.index.companies')"
                :has-line="false"
            >
                <CardContent>
                    <p class="text-3xl font-semibold">{{ companies.length }}</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{ t("admin.index.companiesSubtext") }}
                    </p>
                </CardContent>
            </DashboardCard>
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardCard
                :title="t('admin.index.ticketStatus')"
                :has-line="false"
            >
                <CardContent>
                    <AdminTicketDonut
                        :open="openTickets"
                        :pending="pendingTickets"
                        :closed="closedTickets"
                    />
                </CardContent>
            </DashboardCard>

            <DashboardCard
                class="h-full"
                :title="t('admin.index.newUsers')"
                :has-line="false"
            >
                <CardContent>
                    <AdminUserChart />
                </CardContent>
            </DashboardCard>
        </div>

        <!-- Stations map -->
        <DashboardCard
            :title="t('admin.index.stationLocations')"
            :has-line="false"
        >
            <CardContent>
                <AdminStationsMap :stations="stations" />
            </CardContent>
        </DashboardCard>

        <!-- Bottom row: tickets + companies -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardCard
                :title="t('admin.index.recentTickets')"
                :has-line="false"
            >
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead class="w-[80px]">{{
                                    t("admin.index.recentTicketsColId")
                                }}</TableHead>
                                <TableHead>{{
                                    t("admin.index.recentTicketsColUser")
                                }}</TableHead>
                                <TableHead>{{
                                    t("admin.index.recentTicketsColStation")
                                }}</TableHead>
                                <TableHead class="text-right">{{
                                    t("admin.index.recentTicketsColStatus")
                                }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow
                                v-for="ticket in recentTickets"
                                :key="ticket.id"
                            >
                                <TableCell class="text-xs"
                                    >#{{
                                        ticket.ticketId.slice(-4)
                                    }}...</TableCell
                                >
                                <TableCell>{{ ticket.createdByUser ? `${ticket.createdByUser.firstName} ${ticket.createdByUser.lastName}` : "—" }}</TableCell>
                                <TableCell
                                    class="text-muted-foreground text-xs"
                                    >{{
                                        ticket.station?.title ?? "—"
                                    }}</TableCell
                                >
                                <TableCell class="text-right">
                                    <StatusBadge
                                        type="tickets"
                                        :value="ticket.status"
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </DashboardCard>

            <DashboardCard
                :title="t('admin.index.companiesTableTitle')"
                :has-line="false"
            >
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{
                                    t("admin.index.companiesColCompany")
                                }}</TableHead>
                                <TableHead class="text-right">{{
                                    t("admin.index.companiesColUsers")
                                }}</TableHead>
                                <TableHead class="text-right">{{
                                    t("admin.index.companiesColStations")
                                }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow
                                v-for="company in companies.slice(-6)"
                                :key="company.id"
                            >
                                <TableCell class="font-medium">{{
                                    company.name
                                }}</TableCell>
                                <TableCell
                                    class="text-right text-muted-foreground"
                                    >{{ company.userCount ?? 0 }}</TableCell
                                >
                                <TableCell
                                    class="text-right text-muted-foreground"
                                    >{{ company.stationCount ?? 0 }}</TableCell
                                >
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </DashboardCard>
        </div>
    </div>
</template>
