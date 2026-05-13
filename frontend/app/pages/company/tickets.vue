<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { useUserStore } from "~/stores/user";
import { useLogStore } from "~/stores/log";
import { useTicketStore } from "~/stores/ticket";
import StationHeader from "~/components/company/station/StationHeader.vue";
import StationControls from "~/components/company/station/StationControls.vue";
import StationConsole from "~/components/company/station/StationConsole.vue";
import StationCommandInput from "~/components/company/station/StationCommandInput.vue";
import StationReportDownload from "~/components/company/station/StationReportDownload.vue";
import RegisterInterventionModal from "~/components/modals/RegisterInterventionModal.vue";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next";
import { Swiper, SwiperSlide } from "swiper/vue";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import type { Swiper as SwiperType } from "swiper";

const companyStore = useCompanyStore();
await companyStore.fetchCurrentCompany();
const stationStore = useStationStore();
const userStore = useUserStore();
const username = userStore.currentUser.username;
const ticketStore = useTicketStore();
await ticketStore.fetchTickets();
const tickets = computed(() => ticketStore.tickets);
const isInterventionModalOpen = ref(false);

const swiperInstance = ref<SwiperType | null>(null);
const isBeginning = ref(true);
const isEnd = ref(false);

function onSwiper(swiper: SwiperType) {
    swiperInstance.value = swiper;
}

function onSlideChange(swiper: SwiperType) {
    isBeginning.value = swiper.isBeginning;
    isEnd.value = swiper.isEnd;
}

function slidePrev() {
    swiperInstance.value?.slidePrev();
}

function slideNext() {
    swiperInstance.value?.slideNext();
}
</script>

<template>
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <DashboardCard title="Open Tickets">
            <CardContent>
                <ClientOnly>
                    <div class="relative flex items-center">
                        <!-- Left button -->
                        <button
                            class="absolute left-0 -translate-x-1/2 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#3a3a3a] shadow-md transition-opacity duration-200 hover:bg-gray-50 dark:hover:bg-[#333]"
                            :class="
                                isBeginning
                                    ? 'opacity-0 pointer-events-none'
                                    : 'opacity-100'
                            "
                            @click="slidePrev"
                        >
                            <ChevronLeftIcon class="h-4 w-4" />
                        </button>

                        <Swiper
                            :modules="[FreeMode]"
                            :free-mode="true"
                            :slides-per-view="'auto'"
                            :space-between="16"
                            :grab-cursor="true"
                            class="w-full !pb-2"
                            @swiper="onSwiper"
                            @slide-change="onSlideChange"
                            @reach-beginning="isBeginning = true"
                            @reach-end="isEnd = true"
                            @from-edge="
                                (s) => {
                                    isBeginning = s.isBeginning;
                                    isEnd = s.isEnd;
                                }
                            "
                        >
                            <SwiperSlide
                                v-for="ticket in tickets"
                                :key="ticket.ticketId"
                                class="!w-[260px] !h-auto"
                            >
                                <InterventionCard
                                    :ticket="ticket"
                                    class="h-full"
                                />
                            </SwiperSlide>
                        </Swiper>

                        <!-- Right button -->
                        <button
                            class="absolute right-0 translate-x-1/2 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#3a3a3a] shadow-md transition-opacity duration-200 hover:bg-gray-50 dark:hover:bg-[#333]"
                            :class="
                                isEnd
                                    ? 'opacity-0 pointer-events-none'
                                    : 'opacity-100'
                            "
                            @click="slideNext"
                        >
                            <ChevronRightIcon class="h-4 w-4" />
                        </button>
                    </div>
                </ClientOnly>
            </CardContent>
        </DashboardCard>

        <DashboardCard title="Open Tickets">
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
