<script setup>
/* import { useUserStore } from "@/stores/user"; */
import VehicleCard from "~/components/cards/VehicleCard.vue";
import TicketCard from "~/components/cards/TicketCard.vue";

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
          <Info :user="currentUser" /></DashboardCard
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
      <template v-if="userRole === 'client'" #cell-d-left>
        <DashboardCard title="History"
          ><HistoryTable :sessions="currentUser.chargingHistory" />
        </DashboardCard>
      </template>
      <template v-if="userRole === 'client'" #cell-d-right>
        <DashboardCard title="Preferences" />
      </template>

      <template v-else #cell-d>
        <DashboardCard title="System Logs">
          <p>Full width view for {{ userRole }}</p>
        </DashboardCard>
      </template>
    </Grid>
  </div>
</template>

<style lang="scss" scoped></style>
