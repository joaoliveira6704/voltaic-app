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
        <DashboardCard title="Preferences"> <UserSettings /></DashboardCard>
      </template>

      <template v-if="userRole === `company`" #cell-d>
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

const activeUserIndex = ref(2); // Change this to 0, 1, 2, or 3 to test roles
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

const stationNetwork = [
  { id: "PRT-01", name: "Boavista Hub", status: "available" },
  { id: "PRT-02", name: "Aliados Central", status: "ticket" },
  { id: "PRT-03", name: "Matosinhos Port", status: "available" },
  { id: "PRT-04", name: "Campanhã St.", status: "off" },
  { id: "PRT-05", name: "Gaia Riverside", status: "available" },
  { id: "PRT-06", name: "Foz charging", status: "available" },
  { id: "PRT-07", name: "Antas Hub", status: "ticket" },
  { id: "PRT-08", name: "Trindade Metro", status: "available" },
  { id: "PRT-09", name: "S. Bento St.", status: "available" },
  { id: "PRT-10", name: "Marquês Sq.", status: "off" },
  { id: "PRT-11", name: "Boavista Hub B", status: "available" },
  { id: "PRT-12", name: "Dragão Stadium", status: "ticket" },
  { id: "PRT-13", name: "Arrábida Mall", status: "available" },
  { id: "PRT-14", name: "NorteShopping", status: "available" },
  { id: "PRT-15", name: "Pólo Univ.", status: "off" },
];
</script>

<style lang="scss" scoped></style>
