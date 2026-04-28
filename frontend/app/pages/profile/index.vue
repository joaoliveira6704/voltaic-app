<script setup>
import { computed } from "vue";
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

definePageMeta({
  layout: "profile",
  middleware: ["auth"],
});

const userCookie = useCookie("user");

const currentUser = computed(() => {
  return userCookie.value || null;
});

const userRole = computed(() => currentUser.value.role);

const displayItems = computed(() => {
  const user = currentUser.value;
  if (!user) return [];

  if (userRole.value === "client") return user.vehicles || [];
  if (userRole.value === "worker") return user.assignedTickets || [];
  if (userRole.value === "company" || userRole.value === "admin")
    return user.tickets || [];
  return [];
});

const cardComponent = computed(() => {
  const map = {
    client: VehicleCard,
    worker: TicketCard,
    company: TicketCard,
    admin: TicketCard,
  };
  return map[userRole.value] || VehicleCard;
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

<template>
  <div>
    <DropDown :role="userRole" />
    <Grid :split-cell-d="userRole === 'client'">
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
          </div>
          {{ userRole }}</DashboardCard
        ></template
      >
      <template v-if="userRole === 'client'" #cell-d-left>
        <DashboardCard title="History"
          ><HistoryTable :sessions="currentUser.chargingHistory"></HistoryTable>
        </DashboardCard>
      </template>
      <template v-if="userRole === 'client'" #cell-d-right>
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

<style lang="scss" scoped></style>
