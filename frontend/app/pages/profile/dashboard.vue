<template>
  <div>
    <DropDown :role="userRole" />
    <Grid>
      <template #cell-a
        ><DashboardCard><NavGroup :role="userRole" /></DashboardCard
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
          ><CardScroll
            ><VehicleCard
              v-for="vehicle in currentUser.vehicles"
              :key="vehicle.id"
              :data="vehicle" /></CardScroll></DashboardCard
      ></template>
      <template #cell-d><DashboardCard>D</DashboardCard></template>
    </Grid>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "profile",
});

/* import { useUserStore } from "@/stores/user"; */
const users = [
  {
    username: "jdoe_ev",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "user",
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
  },
  {
    username: "admin_central",
    email: "system.admin@voltaic.com",
    firstName: "Super",
    lastName: "Admin",
    role: "admin",
    vehicles: [],
  },
  {
    username: "porto_fleet_mgr",
    email: "manager@porto-logistics.pt",
    firstName: "Ricardo",
    lastName: "Santos",
    role: "company",
    companyId: "65b2f1a8e4b0a12345678901",
    vehicles: [],
  },
  {
    username: "tech_artur",
    email: "artur.silva@voltaic.com",
    firstName: "Artur",
    lastName: "Silva",
    role: "worker",
    companyId: "65b2f1a8e4b0a12345678901",
    vehicles: [
      {
        plate: "99-ZZ-11",
        model: "Renault Zoe Service",
        color: "Glacier White",
        connector: "Type2",
      },
    ],
  },
];

const activeUserIndex = ref(0); // Change this to 0, 1, 2, or 3 to test roles
const currentUser = computed(() => users[activeUserIndex.value]);
const userRole = computed(() => currentUser.value.role);
</script>

<style lang="scss" scoped></style>
