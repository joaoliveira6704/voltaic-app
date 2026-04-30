// pages/profile/index.vue
<script setup>
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";

useHead({
    title: "Voltaic - Profile",
    meta: [
        {
            name: "description",
            content: "View and manage your profile, vehicles, and tickets.",
        },
    ],
});

definePageMeta({ layout: "profile" });

const { t } = useI18n();

const userStore = useUserStore();
const { currentUser, userRole } = storeToRefs(userStore);
const { fetchCurrentUser } = userStore;

await useAsyncData("currentUser", () => fetchCurrentUser());
</script>

<template>
    <div>
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
        <DropDown :role="userRole" />
        <Grid :split-cell-d="userRole === 'admin'">
            <template #cell-a>
                <DashboardCard :title="t('profile')">
                    <NavGroup :role="currentUser.role" />
                </DashboardCard>
            </template>

            <template #cell-b>
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
