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

const showLogoutDialog = ref(false);
const router = useRouter();

const confirmLogout = () => {
  const userCookie = useCookie("user");
  const tokenCookie = useCookie("token"); // or whatever your auth cookie is named

  userCookie.value = null;
  tokenCookie.value = null;

  showLogoutDialog.value = false;
  router.push("/login");
};
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
          :edit-button="true"
          :logout-button="true"
          button-text="Edit profile"
          @logout="showLogoutDialog = true"
        >
          <Info :user="currentUser"></Info></DashboardCard
      ></template>
      <template #cell-c
        ><DashboardCard
          title="Your Fleet"
          :edit-button="true"
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
            No items to display for @{{ currentUser.username }}.
          </div>
        </DashboardCard></template
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
