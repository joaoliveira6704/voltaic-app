<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { useTicketStore } from "~/stores/ticket";
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

Promise.all([
    companyStore.fetchCurrentCompany(),
    ticketStore.fetchCompanyTickets(1),
]).finally(() => {
    isPending.value = false;
});

const tickets = computed(() => ticketStore.tickets);
const filtered = computed(() =>
    tickets.value.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
);
const isInterventionModalOpen = ref(false);
const selectedTicket = ref<any>(null);
const isTicketDetailOpen = ref(false);

function onPageChange(p: number) {
    page.value = p;
    ticketStore.fetchCompanyTickets(p);
}

function handleStatusUpdate(ticketId: string, status: string) {
    ticketStore.updateTicket(ticketId, { status });
}
</script>

<template>
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <template v-if="isPending">
            <div class="relative">
                <Skeleton class="h-8 w-[180px] mb-4" />
                <div class="flex gap-4 overflow-hidden">
                    <SkeletonInterventionCard class="!w-[260px] !shrink-0" />
                    <SkeletonInterventionCard class="!w-[260px] !shrink-0" />
                    <SkeletonInterventionCard class="!w-[260px] !shrink-0" />
                </div>
            </div>
            <div class="mt-6">
                <Skeleton class="h-8 w-[180px] mb-4" />
                <div class="flex flex-col gap-4">
                    <SkeletonInterventionCard v-for="n in 4" :key="n" />
                </div>
            </div>
        </template>
        <template v-else>
            <DashboardCard :title="t('company.tickets.openTickets')">
                <div
                    class="flex items-center justify-between gap-4 w-full mb-5"
                >
                    <Input
                        v-model="searchTerm"
                        :placeholder="t('adminPage.search')"
                        class="max-w-xs"
                    />
                    <Pagination
                        :current-page="ticketStore.currentPage"
                        :total-pages="ticketStore.totalPages"
                        @update:page="onPageChange"
                    />
                </div>
                <ClientOnly>
                    <div class="flex flex-col gap-5 w-full pb-4">
                        <InterventionCard
                            v-for="ticket in filtered"
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
