<script setup>
import { useUserStore } from "~/stores/user";
import { useTicketStore } from "~/stores/ticket";
import { useStationStore } from "~/stores/station";
import { useCompanyStore } from "~/stores/company";
import { Skeleton, SkeletonMetricCard } from "~/components/ui/Skeleton";
import { Building2, EvCharger, TicketSlash, Users } from "lucide-vue-next";

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

const { pending: currentUserPending } = useAsyncData("currentUser", () =>
    userStore.fetchCurrentUser(),
);
const { pending: dashboardPending } = useAsyncData("dashboard", async () => {
    await Promise.all([
        userStore.fetchDashboardStats(),
        stationStore.fetchDashboardStats(),
        ticketStore.fetchDashboardStats(),
        companyStore.fetchDashboardStats(),
    ]);
});
const { pending: stationsPending } = useAsyncData("stations", () =>
    stationStore.fetchStations(),
);

const isPending = computed(
    () =>
        currentUserPending.value ||
        dashboardPending.value ||
        stationsPending.value,
);

const stationDash = computed(() => stationStore.dashboardStats);
const ticketDash = computed(() => ticketStore.dashboardStats);
const companyDash = computed(() => companyStore.dashboardStats);
const userDash = computed(() => userStore.dashboardStats);
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
                <CardContent class="max-[700px]:px-0">
                    <div class="flex items-center gap-2">
                        <Users />
                        <p class="text-3xl font-semibold">
                            {{ userDash?.total ?? 0 }}
                        </p>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{ t("admin.index.totalUsersSubtext") }}
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard :title="t('admin.index.stations')" :has-line="false">
                <CardContent class="max-[700px]:px-0">
                    <div class="flex items-center gap-2">
                        <EvCharger />
                        <p class="text-3xl font-semibold">
                            {{ stationDash?.total ?? 0 }}
                        </p>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{
                            t("admin.index.stationsActiveNow", {
                                count: stationDash?.available ?? 0,
                            })
                        }}
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard
                :title="t('admin.index.openTickets')"
                :has-line="false"
            >
                <CardContent class="max-[700px]:px-0">
                    <div class="flex items-center gap-2">
                        <TicketSlash />
                        <p class="text-3xl font-semibold">
                            {{ ticketDash?.total ?? 0 }}
                        </p>
                    </div>
                    <p class="text-xs text-muted-foreground mt-1">
                        {{ t("admin.index.openTicketsSubtext") }}
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard
                :title="t('admin.index.companies')"
                :has-line="false"
            >
                <CardContent class="max-[700px]:px-0">
                    <div class="flex items-center gap-2">
                        <Building2 />
                        <p class="text-3xl font-semibold">
                            {{ companyDash?.total ?? 0 }}
                        </p>
                    </div>
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
                <CardContent class="max-[700px]:px-0">
                    <AdminTicketDonut
                        :open="ticketDash?.open ?? 0"
                        :pending="0"
                        :closed="ticketDash?.closed ?? 0"
                    />
                </CardContent>
            </DashboardCard>

            <DashboardCard
                class="h-full"
                :title="t('admin.index.newUsers')"
                :has-line="false"
            >
                <CardContent class="max-[700px]:px-0">
                    <AdminUserChart />
                </CardContent>
            </DashboardCard>
        </div>

        <!-- Stations map -->
        <DashboardCard
            :title="t('admin.index.stationLocations')"
            :has-line="false"
            class="hidden lg:block"
        >
            <CardContent>
                <AdminStationsMap :stations="stationStore.stations" />
            </CardContent>
        </DashboardCard>
    </div>
</template>
