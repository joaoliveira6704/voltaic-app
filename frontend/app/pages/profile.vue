<template>
  <Grid>
    <template #cell-a
      ><DashboardCard><NavGroup :role="userRole" /></DashboardCard
    ></template>
    <template #cell-b
      ><DashboardCard title="User Info"></DashboardCard
    ></template>
    <template #cell-c
      ><DashboardCard title="Your Fleet">C</DashboardCard></template
    >
    <template #cell-d><DashboardCard>D</DashboardCard></template>
  </Grid>
</template>

<script setup>
import DashboardCard from "~/components/Dashboard/DashboardCard.vue";
import NavGroup from "~/components/Dashboard/Shared/NavGroup.vue";

definePageMeta({
  layout: "dashboard",
});

const userRole = ref("User");
</script>

<style lang="scss" scoped></style>
