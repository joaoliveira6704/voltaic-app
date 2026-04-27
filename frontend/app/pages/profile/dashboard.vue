<template>
  <div>
    <DropDown :role="userRole" />
    <Grid>
      <template #cell-a
        ><DashboardCard><NavGroup :role="userRole" /></DashboardCard
      ></template>
      <template #cell-b
        ><DashboardCard title="User Info"></DashboardCard
      ></template>
      <template #cell-c
        ><DashboardCard
          title="Your Fleet"
          :button="true"
          button-text="Add new Vehicle"
          ><CardScroll
            ><VehicleCard
              v-for="vehicle in testVehicles"
              :key="vehicle.id"
              :data="vehicle" /></CardScroll></DashboardCard
      ></template>
      <template #cell-d><DashboardCard>D</DashboardCard></template>
    </Grid>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "dashboard",
});

const testVehicles = [
  {
    id: 1,
    brand: "BMW",
    model: "iX3",
    plate: "09 - EL - 53",
    logoUrl: "https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png",
  },
  {
    id: 5,
    brand: "BMW",
    model: "iX3",
    plate: "09 - EL - 53",
    logoUrl: "https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png",
  },
  {
    id: 6,
    brand: "BMW",
    model: "iX3",
    plate: "09 - EL - 53",
    logoUrl: "https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png",
  },
  {
    id: 7,
    brand: "BMW",
    model: "iX3",
    plate: "09 - EL - 53",
    logoUrl: "https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png",
  },
  {
    id: 2,
    brand: "Tesla",
    model: "Model Y",
    plate: "AA - 22 - BB",
    logoUrl:
      "https://logos-world.net/wp-content/uploads/2020/10/Tesla-Logo.png",
  },
  {
    id: 3,
    brand: "Audi",
    model: "Q4 e-tron",
    plate: "99 - ZZ - 11",
    logoUrl: "https://logos-world.net/wp-content/uploads/2021/03/Audi-Logo.png",
  },
  {
    id: 4,
    brand: "Mercedes",
    model: "EQE",
    plate: "55 - RX - 99",
    logoUrl:
      "https://logos-world.net/wp-content/uploads/2020/04/Mercedes-Benz-Logo.png",
  },
];

const userRole = ref("User");
</script>

<style lang="scss" scoped></style>
