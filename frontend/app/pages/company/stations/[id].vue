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

// Company
const companyStore = useCompanyStore();
await companyStore.fetchCurrentCompany();

// Station
const { id } = useRoute().params;
const stationStore = useStationStore();
await stationStore.fetchStationById(id);
const currentStation = computed(() => stationStore.currentStation || "");

// User
const userStore = useUserStore();
const username = userStore.currentUser.username;

// Logs
const logStore = useLogStore();
await logStore.fetchStationLogs(id);
const stationLogs = computed(() => logStore.logs);

// Tickets/Interventions
const ticketStore = useTicketStore();
await ticketStore.fetchTickets();
const tickets = computed(() => ticketStore.tickets);

console.log(currentStation.value);

console.log(stationLogs.value);
const mappedStoreLogs = computed(() =>
    (stationLogs.value ?? []).map((l) => ({
        time: new Date(l.createdAt).toLocaleString(),
        type: l.type as LogType,
        message: l.details ?? l.action ?? "",
    })),
);

const isInterventionModalOpen = ref(false);

const {
    logs,
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
} = useStation(id, stationStore, logStore);
</script>

<template>
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <DashboardCard title="Manage Station" :has-line="true">
            <CardContent>
                <div class="space-y-4">
                    <!-- Title + Status -->
                    <StationHeader
                        :title="currentStation.title"
                        :station-id="String(id)"
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

                    <!-- Terminal Console -->
                    <div class="rounded-lg bg-gray-950 overflow-hidden">
                        <!-- Console label -->
                        <div class="px-3 py-1.5 m-2 inline-block">
                            <span
                                class="font-mono text-xs text-gray-200 tracking-wide"
                                >Station Log Console</span
                            >
                        </div>

                        <!-- Log lines -->
                        <div class="mx-2">
                            <StationConsole :logs="mappedStoreLogs" />
                        </div>

                        <!-- Command input -->
                        <div class="mx-2 my-2">
                            <StationCommandInput
                                :station-id="String(id)"
                                :username="username"
                                @execute="executeCommand"
                            />
                        </div>
                    </div>

                    <!-- Download Report -->
                    <StationReportDownload @download="downloadReport" />
                </div>
            </CardContent>
        </DashboardCard>
        <DashboardCard title="Interventions">
            <CardContent>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
                >
                    <InterventionCard
                        v-for="ticket in tickets"
                        :key="ticket.ticketId"
                        :ticket="ticket"
                    />
                </div>
            </CardContent>
        </DashboardCard>
        <RegisterInterventionModal
            :is-open="isInterventionModalOpen"
            @close="isInterventionModalOpen = false"
        />
    </div>
</template>
