<script setup>
import { computed } from "vue";
import VehicleCard from "~/components/cards/VehicleCard.vue";
import TicketCard from "~/components/cards/TicketCard.vue";
import Swal from "sweetalert2";

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
});

const config = useRuntimeConfig();
const router = useRouter();
const isEditModalOpen = ref(false);

// 1. Fetch current user first
const { data: currentUser, refresh: refreshUser } = await useAsyncData(
  "currentUser",
  async () => {
    try {
      return await $fetch(`${config.public.apiBaseUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${useCookie("token").value}` },
      });
    } catch (e) {
      console.error("Fetch error:", e);
      return null;
    }
  },
);

// 2. Derived state
const userRole = computed(() => currentUser.value?.role);

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

// 3. Fetch charging history, watching currentUser
const { data: chargingHistory } = await useAsyncData(
  "chargingHistory",
  async () => {
    const userId = currentUser.value?.id || currentUser.value?.userId;
    if (!userId) return null;
    try {
      return await $fetch(
        `${config.public.apiBaseUrl}/api/usage/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${useCookie("token").value}` },
        },
      );
    } catch (e) {
      console.error("Fetch error:", e);
      return [];
    }
  },
  { watch: [currentUser] },
);

const handleLogoutAttempt = () => {
  Swal.fire({
    title: "Confirm Logout",
    text: "Are you sure you want to log out? You will need to sign in again.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626", // Matching your red-600
    confirmButtonText: "Yes, Logout",
    reverseButtons: true, // Puts cancel on the left, confirm on the right
    background: "#ffffff",
    customClass: {
      popup: "font-mono text-sm", // Keeping your app's font style
      cancelButton: "bg-white text-black hover:bg-gray-300",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      performLogoutLogic();
    }
  });
};

const performLogoutLogic = () => {
  const userCookie = useCookie("user");
  userCookie.value = null;
  router.push("/login");
};

const openEditModal = () => {
  isEditModalOpen.value = true;
};

const refreshCurrentUser = async () => {
  await refreshUser();
};

console.log("Current User:", currentUser.value);
console.log("User Role:", userRole.value);
</script>

<template>
  <EditProfileModal
    :is-open="isEditModalOpen"
    :user="currentUser"
    @close="isEditModalOpen = false"
    @updated="refreshCurrentUser"
  />
  <div>
    <DropDown :role="userRole" />
    <Grid :split-cell-d="userRole === 'client'">
      <template #cell-a
        ><DashboardCard title="Profile"
          ><NavGroup
            :role="currentUser.role"
            @logout="handleLogoutAttempt" /></DashboardCard
      ></template>
      <template #cell-b
        ><DashboardCard
          title="User Info"
          :has-btn="true"
          :logout-button="true"
          button-text="Edit profile"
          @logout="handleLogoutAttempt"
          @btn-click="openEditModal"
        >
          <Info :user="currentUser" /></DashboardCard
      ></template>
      <template #cell-c
        ><DashboardCard
          title="Your Fleet"
          :has-btn="true"
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
          ><HistoryTable :sessions="chargingHistory" />
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
