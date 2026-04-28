<template>
  <div>
    <DropDown :role="userRole" />
    <Grid :split-cell-d="userRole === 'user'">
      <template #cell-a
        ><DashboardCard><NavGroup :role="currentUser.role" /></DashboardCard
      ></template>
      <template #cell-b
        ><DashboardCard
          title="User Info"
          :button="true"
          button-text="Edit profile"
        >
          <Info :user="currentUser"></Info></DashboardCard
      ></template>
      <template #cell-c
        ><DashboardCard
          title="Your Fleet"
          :button="true"
          button-text="Add new Vehicle"
          ><CardScroll v-if="displayItems.length > 0"
            ><component
              :is="cardComponent"
              v-for="(item, index) in displayItems"
              :key="index"
              :data="item"
            />
          </CardScroll>
          <div
            v-else
            class="p-10 text-center font-mono text-xs text-neutral-400"
          >
            No items to display for {{ userRole }}.
          </div></DashboardCard
        ></template
      >
      <template v-if="userRole === 'user'" #cell-d-left>
        <DashboardCard title="History"
          ><HistoryTable :sessions="currentUser.chargingHistory"></HistoryTable>
        </DashboardCard>
      </template>
      <template v-if="userRole === 'user'" #cell-d-right>
        <DashboardCard title="Preferences"> </DashboardCard>
      </template>

      <template v-else #cell-d>
        <DashboardCard title="System Logs">
          <p>Full width view for {{ userRole }}</p>
        </DashboardCard>
      </template>
    </Grid>
  </div>
</template>

<script setup>
/* import { useUserStore } from "@/stores/user"; */
import VehicleCard from "~/components/cards/VehicleCard.vue";
import TicketCard from "~/components/cards/TicketCard.vue";

definePageMeta({
  layout: "profile",
});

const users = [
  {
    username: "jdoe_ev",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe User",
    role: "user",
    avatarUrl: "/default-avatar.jpg",
    vehicles: [
      {
        plate: "09-EL-53",
        model: "BMW iX3",
        color: "Mineral White",
        connector: "CCS/SAE",
      },
      {
        plate: "AA-22-BB",
        model: "Tesla Model 3",
        color: "Solid Black",
        connector: "Tesla",
      },
    ],
    chargingHistory: [
      {
        date: "12/04",
        vehicleName: "Renault Zoe",
        stationId: "ST-001",
        duration: "00:45",
      },
      {
        date: "15/04",
        vehicleName: "BMW iX3",
        stationId: "ST-042",
        duration: "01:20",
      },
      {
        date: "18/04",
        vehicleName: "BMW iX3",
        stationId: "ST-042",
        duration: "00:55",
      },
      {
        date: "20/04",
        vehicleName: "Tesla Model 3",
        stationId: "ST-101",
        duration: "00:30",
      },
      {
        date: "22/04",
        vehicleName: "BMW iX3",
        stationId: "ST-005",
        duration: "02:10",
      },
      {
        date: "25/04",
        vehicleName: "Tesla Model 3",
        stationId: "ST-088",
        duration: "00:40",
      },
      {
        date: "28/04",
        vehicleName: "BMW iX3",
        stationId: "ST-042",
        duration: "01:45",
      },
    ],
  },
  {
    username: "admin_central",
    email: "system.admin@voltaic.com",
    firstName: "Super",
    lastName: "Admin",
    role: "admin",
    avatarUrl: "/titus.webp",
    tickets: [
      {
        id: "bug ticket",
        desc: "log error",
        state: "open",
      },
      {
        id: "bug ticket",
        desc: "no fav list",
        state: "open",
      },
    ],
  },
  {
    username: "porto_fleet_mgr",
    email: "company@porto-logistics.pt",
    firstName: "Ricardo",
    lastName: "Santos Company",
    role: "company",
    companyId: "65b2f1a8e4b0a12345678901",
    avatarUrl: "/beyblade.jpg",
    tickets: [
      {
        id: "9a5d8",
        station: "Av. Aliados",
        state: "open",
      },
    ],
  },
  {
    username: "tech_artur",
    email: "artur.silva@voltaic.com",
    firstName: "Artur",
    lastName: "Silva Worker",
    role: "worker",
    companyId: "65b2f1a8e4b0a12345678901",
    avatarUrl: "/ash-ketchum.png",
    assignedTickets: [
      {
        id: "9a5d8",
        station: "Av. Aliados",
        state: "open",
      },
    ],
  },
];

const activeUserIndex = ref(0); // Change this to 0, 1, 2, or 3 to test roles
const currentUser = computed(() => users[activeUserIndex.value]);
const userRole = computed(() => currentUser.value.role);

const cardComponent = computed(() => {
  const map = {
    user: VehicleCard,
    worker: TicketCard,
    company: TicketCard,
    admin: TicketCard,
  };
  return map[userRole.value];
});

const displayItems = computed(() => {
  if (userRole.value === "user") return currentUser.value.vehicles;
  if (userRole.value === "worker")
    return currentUser.value.assignedTickets || [];
  if (userRole.value === "company") return currentUser.value.tickets || [];
  if (userRole.value === "admin") return currentUser.value.tickets || [];
  return [];
});
</script>

<style lang="scss" scoped></style>
