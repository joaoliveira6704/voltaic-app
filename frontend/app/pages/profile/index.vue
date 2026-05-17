// pages/profile/index.vue
<script setup>
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";
import VehicleCard from "~/components/cards/VehicleCard.vue";
import TicketCard from "~/components/cards/TicketCard.vue";
import {
    Skeleton,
    SkeletonTable,
    SkeletonVehicleCard,
} from "~/components/ui/Skeleton";

useHead({
    title: "Voltaic - Profile",
    meta: [
        {
            name: "description",
            content: "View and manage your profile, vehicles, and tickets.",
        },
    ],
});

const { t } = useI18n();

const userStore = useUserStore(); // Pinia must be called before any awaits
const { currentUser } = storeToRefs(userStore);
const { confirmLogout, deleteVehicle, fetchUserProfile, fetchChargingHistory } =
    userStore;

const isPending = ref(true);

fetchUserProfile().finally(() => {
    isPending.value = false;
});

const isEditModalOpen = ref(false);
const isAddVehicleModal = ref(false);
</script>

<template>
    <div
        v-if="isPending"
        class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-6"
    >
        <div
            class="rounded-xl border border-gray-100 dark:border-[#232323] p-6 dark:bg-[#171717]"
        >
            <div class="flex gap-8">
                <Skeleton class="h-32 w-32 rounded-full shrink-0" />
                <div class="flex-1 space-y-3">
                    <Skeleton class="h-8 w-[250px]" />
                    <Skeleton class="h-5 w-[180px]" />
                    <div class="flex gap-4 mt-4">
                        <Skeleton class="h-5 w-[200px]" />
                        <Skeleton class="h-5 w-[120px]" />
                    </div>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 gap-4">
            <div
                class="rounded-xl border border-gray-100 dark:border-[#232323] p-6 dark:bg-[#171717]"
            >
                <Skeleton class="h-5 w-[100px] mb-4" />
                <div class="flex gap-4 overflow-hidden">
                    <SkeletonVehicleCard v-for="n in 2" :key="n" />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
                class="rounded-xl border border-gray-100 dark:border-[#232323] dark:bg-[#171717]"
            >
                <div
                    class="p-4 border-b border-neutral-100 dark:border-[#272727]"
                >
                    <Skeleton class="h-4 w-[60px]" />
                </div>
                <SkeletonTable :columns="4" :rows="3" />
            </div>
            <div
                class="rounded-xl border border-gray-100 dark:border-[#232323] p-6 dark:bg-[#171717]"
            >
                <Skeleton class="h-5 w-[100px] mb-4" />
                <div class="space-y-3">
                    <Skeleton class="h-8 w-full rounded-lg" />
                    <Skeleton class="h-8 w-full rounded-lg" />
                    <Skeleton class="h-8 w-3/4 rounded-lg" />
                </div>
            </div>
        </div>
    </div>
    <div v-else class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto">
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
        <Grid :split-cell-d="true">
            <template #cell-b>
                <DashboardCard
                    :title="t('userInfo')"
                    :has-btn="true"
                    :logout-button="true"
                    :button-text="t('editProfile')"
                    @logout="confirmLogout"
                    @btn-click="isEditModalOpen = true"
                >
                    <Info :user="currentUser" />
                </DashboardCard>
            </template>

            <template #cell-c>
                <DashboardCard
                    :title="t('yourFleet')"
                    :has-btn="true"
                    :button-text="t('addNewVehicle')"
                    @btn-click="isAddVehicleModal = true"
                >
                    <CardScroll v-if="currentUser.vehicles.length > 0">
                        <VehicleCard
                            v-for="vehicle in currentUser.vehicles"
                            :key="vehicle.plate || vehicle._id"
                            :data="vehicle"
                            @delete="deleteVehicle(vehicle.plate)"
                        />
                    </CardScroll>
                    <div
                        v-else
                        class="p-10 text-center text-xs text-neutral-400"
                    >
                        {{ t("noVehicles") }} @{{ currentUser.username }}.
                    </div>
                </DashboardCard>
            </template>

            <template #cell-d-left>
                <DashboardCard :title="t('history')">
                    <HistoryTable :sessions="currentUser.chargingHistory" />
                </DashboardCard>
            </template>

            <template #cell-d-right>
                <DashboardCard :title="t('preferences')" class="h-full">
                    <UserSettings />
                </DashboardCard>
            </template>

            <template v-if="userRole === 'company'" #cell-d>
                <DashboardCard :title="t('realTimeNetwork')">
                    <ScrollableGrid>
                        <StationsLabel
                            v-for="station in stationNetwork"
                            :key="station.id"
                            :status="station.status"
                            :label="station.name"
                        />
                    </ScrollableGrid>
                </DashboardCard>
            </template>
        </Grid>
    </div>
</template>
