<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { useTicketStore } from "~/stores/ticket";
import { TicketStates } from "@/utils/constants";
import RegisterInterventionModal from "~/components/modals/RegisterInterventionModal.vue";
import TicketDetailModal from "~/components/modals/TicketDetailModal.vue";
import { Skeleton, SkeletonInterventionCard } from "~/components/ui/Skeleton";
import Pagination from "~/components/ui/Pagination.vue";

const { t } = useI18n();
const companyStore = useCompanyStore();
const ticketStore = useTicketStore();

const isPending = ref(true);
const page = ref(1);
const searchTerm = ref("");
const statusFilter = ref("");

Promise.all([
    companyStore.fetchCurrentCompany(),
    ticketStore.fetchCompanyTickets(1),
]).finally(() => {
    isPending.value = false;
});

const tickets = computed(() => ticketStore.tickets);
const isInterventionModalOpen = ref(false);
const selectedTicket = ref<any>(null);
const isTicketDetailOpen = ref(false);

function buildParams() {
    const params: Record<string, string> = {};
    if (searchTerm.value) params.search = searchTerm.value;
    if (statusFilter.value) params.status = statusFilter.value;
    return params;
}

async function fetchData() {
    await ticketStore.fetchCompanyTickets(page.value, 5, buildParams());
}

function onPageChange(p: number) {
    page.value = p;
    fetchData();
}

function onStatusFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    statusFilter.value = target.value;
    page.value = 1;
    fetchData();
}

function handleStatusUpdate(ticketId: string, status: string) {
    ticketStore.updateTicket(ticketId, { status });
}

let debounceTimer: ReturnType<typeof setTimeout>;
watch(searchTerm, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        page.value = 1;
        fetchData();
    }, 300);
});
</script>

<template>
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <template v-if="isPending">
            <DashboardCard>
                <Skeleton class="h-8 w-[180px] mb-4" />
                <div class="flex flex-col gap-4">
                    <SkeletonInterventionCard v-for="n in 4" :key="n" />
                </div>
            </DashboardCard>
        </template>
        <template v-else>
            <DashboardCard :title="t('company.tickets.openTickets')">
                <div
                    class="flex items-center justify-between gap-4 w-full mb-5"
                >
                    <div class="flex items-center gap-2">
                        <Input
                            v-model="searchTerm"
                            :placeholder="t('adminPage.search')"
                            class="max-w-xs"
                        />
                        <select
                            :value="statusFilter"
                            class="text-xs border border-black rounded-md px-2 py-1.5 bg-transparent"
                            @change="onStatusFilterChange"
                        >
                            <option value="">All statuses</option>
                            <option
                                v-for="s in TicketStates"
                                :key="s.key"
                                :value="s.key"
                            >
                                {{ s.label }}
                            </option>
                        </select>
                    </div>
                    <Pagination
                        :current-page="ticketStore.currentPage"
                        :total-pages="ticketStore.totalPages"
                        @update:page="onPageChange"
                    />
                </div>
                <ClientOnly>
                    <div class="flex flex-col gap-5 w-full pb-4">
                        <InterventionCard
                            v-for="ticket in tickets"
                            :key="ticket.ticketId"
                            class="w-full !h-auto"
                            :ticket="ticket"
                            @update:status="handleStatusUpdate"
                            @select="
                                selectedTicket = ticket;
                                isTicketDetailOpen = true;
                            "
                        />
                    </div>
                </ClientOnly>
            </DashboardCard>

            <TicketDetailModal
                :is-open="isTicketDetailOpen"
                :ticket="selectedTicket"
                @close="isTicketDetailOpen = false"
                @update:status="handleStatusUpdate"
            />
            <RegisterInterventionModal
                :is-open="isInterventionModalOpen"
                @close="isInterventionModalOpen = false"
            />
        </template>
    </div>
</template>
