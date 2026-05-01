// pages/profile/index.vue
<script setup>
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";
useHead({
    title: "Voltaic - Admin",
    meta: [
        {
            name: "description",
            content: "View and manage your profile, vehicles, and tickets.",
        },
    ],
});

const { t } = useI18n();

const userStore = useUserStore();
const { users, currentUser, userRole } = storeToRefs(userStore);
const { fetchCurrentUser, fetchUsers } = userStore;

await useAsyncData("currentUser", () => fetchCurrentUser());
await useAsyncData("users", () => fetchUsers());
</script>

<template>
    <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto">
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
                <DashboardCard title="Admin">
                    <NavGroup :role="currentUser.role" />
                </DashboardCard>
            </template>

            <template #cell-b>
                <DashboardCard :title="t('nav.admin')">
                    <ScrollableGrid>
                        <div v-for="user in users" :key="user.userId">
                            <div>{{ user.username }}</div>
                        </div>
                    </ScrollableGrid>
                </DashboardCard>
            </template>
        </Grid>
    </div>
</template>
