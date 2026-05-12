// pages/profile/index.vue
<script setup>
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";
import VehicleCard from "~/components/cards/VehicleCard.vue";
import TicketCard from "~/components/cards/TicketCard.vue";

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
const { currentUser, chargingHistory, userRole } = storeToRefs(userStore);
const { confirmLogout, deleteVehicle, fetchCurrentUser, fetchChargingHistory } =
    userStore;

// Let Nuxt handle the async lifecycle instead of bare awaits
await useAsyncData("currentUser", () => fetchCurrentUser());
await useAsyncData("chargingHistory", () => fetchChargingHistory());

const isEditModalOpen = ref(false);
const isAddVehicleModal = ref(false);
</script>

<template>
    <div v-if="!userStore.isLoaded">
        <h1>loading...</h1>
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
                    <HistoryTable :sessions="chargingHistory" />
                </DashboardCard>
            </template>

            <template #cell-d-right>
                <DashboardCard :title="t('preferences')">
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
