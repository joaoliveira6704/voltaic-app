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

definePageMeta({ layout: "profile" });

const userStore = useUserStore(); // Pinia must be called before any awaits
const { currentUser, chargingHistory, userRole, displayItems } =
  storeToRefs(userStore);
const { confirmLogout, deleteVehicle, fetchCurrentUser, fetchChargingHistory } =
  userStore;

// Let Nuxt handle the async lifecycle instead of bare awaits
await useAsyncData("currentUser", () => fetchCurrentUser());
await useAsyncData("chargingHistory", () => fetchChargingHistory());

const isEditModalOpen = ref(false);
const isAddVehicleModal = ref(false);

const cardComponent = computed(() => {
  const map = {
    client: VehicleCard,
    worker: TicketCard,
    company: TicketCard,
    admin: TicketCard,
  };
  return map[userRole.value] || VehicleCard;
});
</script>

<template>
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
  <div>
    <DropDown :role="userRole" />
    <Grid :split-cell-d="userRole === 'client'">
      <template #cell-a>
        <DashboardCard title="Profile">
          <NavGroup :role="currentUser.role" @logout="confirmLogout" />
        </DashboardCard>
      </template>

      <template #cell-b>
        <DashboardCard
          title="User Info"
          :has-btn="true"
          :logout-button="true"
          button-text="Edit profile"
          @logout="confirmLogout"
          @btn-click="isEditModalOpen = true"
        >
          <Info :user="currentUser" />
        </DashboardCard>
      </template>

      <template #cell-c>
        <DashboardCard
          title="Your Fleet"
          :has-btn="true"
          button-text="Add new Vehicle"
          @btn-click="isAddVehicleModal = true"
        >
          <CardScroll v-if="displayItems.length > 0">
            <component
              :is="cardComponent"
              v-for="item in displayItems"
              :key="item.plate || item._id"
              :data="item"
              @delete="deleteVehicle(item.plate)"
            />
          </CardScroll>
          <div
            v-else
            class="p-10 text-center font-mono text-xs text-neutral-400"
          >
            No items to display for @{{ currentUser.username }}.
          </div>
        </DashboardCard>
      </template>

      <template v-if="userRole === 'client'" #cell-d-left>
        <DashboardCard title="History">
          <HistoryTable :sessions="chargingHistory" />
        </DashboardCard>
      </template>

      <template v-if="userRole === 'client'" #cell-d-right>
        <DashboardCard title="Preferences">
          <UserSettings />
        </DashboardCard>
      </template>

      <template v-if="userRole === 'company'" #cell-d>
        <DashboardCard title="Real-time Network">
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
