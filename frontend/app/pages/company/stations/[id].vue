<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { useUserStore } from "~/stores/user";
import { useStation } from "~/composables/useStation";
import { useLogStore } from "~/stores/log";
import { useTicketStore } from "~/stores/ticket";
import StationHeader from "~/components/company/station/StationHeader.vue";
import StationControls from "~/components/company/station/StationControls.vue";
import StationConsole from "~/components/company/station/StationConsole.vue";
import StationCommandInput from "~/components/company/station/StationCommandInput.vue";
import StationReportDownload from "~/components/company/station/StationReportDownload.vue";
import RegisterInterventionModal from "~/components/modals/RegisterInterventionModal.vue";
import TicketDetailModal from "~/components/modals/TicketDetailModal.vue";
import { Skeleton, SkeletonInterventionCard } from "~/components/ui/Skeleton";
import Pagination from "~/components/ui/Pagination.vue";

const { t } = useI18n();
const { id } = useRoute().params;
const companyStore = useCompanyStore();
const stationStore = useStationStore();
const logStore = useLogStore();
const ticketStore = useTicketStore();

const isPending = ref(true);
const page = ref(1);
const stationId = id as string;

Promise.all([
    companyStore.fetchCurrentCompany(),
    stationStore.fetchStationById(stationId),
    logStore.fetchStationLogs(stationId),
    ticketStore.fetchStationTickets(stationId, 1),
]).finally(() => {
    isPending.value = false;
});

const currentStation = computed(() => stationStore.currentStation || "");

const userStore = useUserStore();
const username = userStore.currentUser?.username;

const stationLogs = computed(() => logStore.logs);
const tickets = computed(() => ticketStore.tickets);

const mappedStoreLogs = computed(() =>
    (stationLogs.value ?? []).map((l: Record<string, unknown>) => ({
        time: new Date(l.createdAt as string).toLocaleString(),
        type: l.type as LogType,
        message: (l.details ?? l.action ?? "") as string,
    })),
);

const isInterventionModalOpen = ref(false);
const selectedTicket = ref<any>(null);
const isTicketDetailOpen = ref(false);

const {
    state,
    alive,
    statusLabel,
    isRestarting,
    isBusy,
    shutdown,
    start,
    restart,
    executeCommand,
    downloadReport,
} = useStation(stationId, stationStore, logStore);

function onPageChange(p: number) {
    page.value = p;
    ticketStore.fetchStationTickets(stationId, p);
}

function handleStatusUpdate(ticketId: string, status: string) {
    ticketStore.updateTicket(ticketId, { status });
}
</script>

<template>
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <template v-if="isPending">
            <Skeleton class="h-8 w-[250px]" />
            <div
                class="rounded-xl border border-gray-100 dark:border-[#232323] p-6 space-y-4 dark:bg-[#171717]"
            >
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <Skeleton class="h-5 w-[200px]" />
                        <Skeleton class="h-4 w-[140px]" />
                    </div>
                    <Skeleton class="h-6 w-24 rounded-full" />
                </div>
                <div class="flex gap-2">
                    <Skeleton class="h-10 w-24 rounded-lg" />
                    <Skeleton class="h-10 w-24 rounded-lg" />
                    <Skeleton class="h-10 w-24 rounded-lg" />
                </div>
                <div class="rounded-lg bg-gray-950 p-4 space-y-2">
                    <Skeleton class="h-4 w-32" />
                    <Skeleton class="h-4 w-full" />
                    <Skeleton class="h-4 w-3/4" />
                    <Skeleton class="h-4 w-5/6" />
                    <Skeleton class="h-4 w-1/2" />
                </div>
                <Skeleton class="h-10 w-48 rounded-lg" />
            </div>
            <div>
                <Skeleton class="h-6 w-[140px] mb-4" />
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <SkeletonInterventionCard v-for="n in 4" :key="n" />
                </div>
            </div>
        </template>
        <template v-else>
            <DashboardCard
                :title="t('company.stations.manageStation')"
                :has-line="true"
            >
                <CardContent>
                    <div class="space-y-4">
                        <StationHeader
                            :title="currentStation.title"
                            :station-id="stationId"
                            :state="state"
                            :alive="alive"
                            :status-label="statusLabel"
                        />

                        <StationControls
                            :is-busy="isBusy"
                            :is-restarting="isRestarting"
                            :alive="alive"
                            :state="state"
                            @shutdown="shutdown"
                            @restart="restart"
                            @start="start"
                            @register="isInterventionModalOpen = true"
                        />

                        <div class="rounded-lg bg-gray-950 overflow-hidden">
                            <div class="px-3 py-1.5 m-2 inline-block">
                                <span
                                    class="font-mono text-xs text-gray-200 tracking-wide"
                                    >{{
                                        t("company.stations.logConsole")
                                    }}</span
                                >
                            </div>

                            <div class="mx-2">
                                <StationConsole :logs="mappedStoreLogs" />
                            </div>

                            <div class="mx-2 my-2">
                                <StationCommandInput
                                    :station-id="stationId"
                                    :username="username"
                                    @execute="executeCommand"
                                />
                            </div>
                        </div>

                        <StationReportDownload @download="downloadReport" />
                    </div>
                </CardContent>
            </DashboardCard>
            <DashboardCard :title="t('company.stations.interventions')">
                <CardContent>
                    <div class="flex gap-4 w-full">
                        <InterventionCard
                            class="h-60"
                            v-for="ticket in tickets"
                            :key="ticket.ticketId"
                            :ticket="ticket"
                            @update:status="handleStatusUpdate"
                            @select="
                                selectedTicket = ticket;
                                isTicketDetailOpen = true;
                            "
                        />
                    </div>
                    <Pagination
                        class="pt-4"
                        :current-page="ticketStore.currentPage"
                        :total-pages="ticketStore.totalPages"
                        @update:page="onPageChange"
                    />
                </CardContent>
            </DashboardCard>
            <TicketDetailModal
                :is-open="isTicketDetailOpen"
                :ticket="selectedTicket"
                @close="isTicketDetailOpen = false"
                @update:status="handleStatusUpdate"
            />
            <RegisterInterventionModal
                :is-open="isInterventionModalOpen"
                :station-id="stationId"
                @close="isInterventionModalOpen = false"
                @created="ticketStore.fetchStationTickets(stationId, page)"
            />
        </template>
    </div>
</template>
