<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { useTicketStore } from "~/stores/ticket";
import RegisterInterventionModal from "~/components/modals/RegisterInterventionModal.vue";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next";
import { Swiper, SwiperSlide } from "swiper/vue";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import type { Swiper as SwiperType } from "swiper";
import { Skeleton, SkeletonInterventionCard } from "~/components/ui/Skeleton";

const { t } = useI18n();
const companyStore = useCompanyStore();
const ticketStore = useTicketStore();

const isPending = ref(true);

companyStore
    .fetchCurrentCompany()
    .then(() => ticketStore.fetchTickets())
    .finally(() => {
        isPending.value = false;
    });

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
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SkeletonInterventionCard v-for="n in 4" :key="n" />
                </div>
            </div>
        </template>
        <template v-else>
            <DashboardCard :title="t('company.tickets.openTickets')">
                <CardContent>
                    <ClientOnly>
                        <div class="relative flex items-center">
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

            <DashboardCard :title="t('company.tickets.openTickets')">
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
        </template>
    </div>
</template>
