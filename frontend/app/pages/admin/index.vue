<!-- pages/admin/index.vue -->
<script setup>
import { useUserStore } from "~/stores/user";
import { useTicketStore } from "~/stores/ticket";
import { useStationStore } from "~/stores/station";
import { useCompanyStore } from "~/stores/company";
import { storeToRefs } from "pinia";

useHead({
    title: "Voltaic - Admin Dashboard",
    meta: [
        {
            name: "description",
            content:
                "Admin overview of users, stations, tickets, and companies.",
        },
    ],
});

const { t } = useI18n();
const userStore = useUserStore();
const ticketStore = useTicketStore();
const stationStore = useStationStore();
const companyStore = useCompanyStore();

const { users, currentUser, userRole } = storeToRefs(userStore);
const { tickets } = storeToRefs(ticketStore);
const { stations } = storeToRefs(stationStore);
const { companies } = storeToRefs(companyStore);

await Promise.all([
    useAsyncData("currentUser", () => userStore.fetchCurrentUser()),
    useAsyncData("users", () => userStore.fetchUsers()),
    useAsyncData("tickets", () => ticketStore.fetchTickets()),
    useAsyncData("stations", () => stationStore.fetchStations()),
    useAsyncData("companies", () => companyStore.fetchCompanies()),
]);

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
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <!-- Metric cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Total users" :has-line="false">
                <CardContent>
                    <p class="text-3xl font-semibold">{{ users.length }}</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        +12% this month
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard title="Stations" :has-line="false">
                <CardContent>
                    <p class="text-3xl font-semibold">{{ stations.length }}</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{ onlineStations }} active now
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard title="Open tickets" :has-line="false">
                <CardContent>
                    <p class="text-3xl font-semibold">{{ openTickets }}</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        +8 since yesterday
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard title="Companies" :has-line="false">
                <CardContent>
                    <p class="text-3xl font-semibold">{{ companies.length }}</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        4 added this month
                    </p>
                </CardContent>
            </DashboardCard>
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardCard title="Ticket status" :has-line="false">
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
                title="New users — last 7 days"
                :has-line="false"
            >
                <CardContent>
                    <AdminUserChart />
                </CardContent>
            </DashboardCard>
        </div>

        <!-- Stations map -->
        <DashboardCard title="Station locations" :has-line="false">
            <CardContent>
                <AdminStationsMap :stations="stations" />
            </CardContent>
        </DashboardCard>

        <!-- Bottom row: tickets + companies -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardCard title="Recent tickets" :has-line="false">
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead class="w-[80px]">ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Station</TableHead>
                                <TableHead class="text-right">Status</TableHead>
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
                                <TableCell>{{ ticket.title ?? "—" }}</TableCell>
                                <TableCell
                                    class="text-muted-foreground text-xs"
                                    >{{
                                        ticket.station?.name ?? "—"
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

            <DashboardCard title="Companies" :has-line="false">
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead class="text-right">Users</TableHead>
                                <TableHead class="text-right"
                                    >Stations</TableHead
                                >
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
