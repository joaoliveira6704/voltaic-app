<script setup lang="ts">
/* import { Skeleton, SkeletonMetricCard } from "~/components/ui/Skeleton";
import StationsPieChart from "~/components/company/dashboard/StationsPieChart.vue";
import TicketsPieChart from "~/components/company/dashboard/TicketsPieChart.vue";
import InactiveStationsCard from "~/components/company/dashboard/InactiveStationsCard.vue";
import UsageDeltaCard from "~/components/company/dashboard/UsageDeltaCard.vue";
import WeeklyUsageChart from "~/components/company/dashboard/WeeklyUsageChart.vue";
import LatestTicketsTable from "~/components/company/dashboard/LatestTicketsTable.vue"; */

const { t } = useI18n();
const companyStore = useCompanyStore();
const currentCompany = computed(() => companyStore.currentCompany || "");

const isPending = ref(true);
const dashboard = ref(null);
const selectedWeek = ref<string | null>(null);
const drilldown = ref(null);
const isDrilldownLoading = ref(false);

async function loadDrilldown(weekStart: string) {
  isDrilldownLoading.value = true;
  selectedWeek.value = weekStart;
  try {
    drilldown.value = await companyStore.fetchWeekDrilldown(weekStart);
  } finally {
    isDrilldownLoading.value = false;
  }
}

function clearDrilldown() {
  selectedWeek.value = null;
  drilldown.value = null;
}

Promise.all([
  companyStore.fetchCurrentCompany(),
  companyStore.fetchDashboard().then((data) => {
    dashboard.value = data;
  }),
]).finally(() => {
  isPending.value = false;
});
</script>

<template>
  <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-4">
    <template v-if="isPending">
      <Skeleton class="h-8 w-[250px]" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>
      <div class="grid grid-cols-3 gap-4">
        <Skeleton class="col-span-2 h-[340px]" />
        <Skeleton class="col-span-1 h-[340px]" />
      </div>
      <Skeleton class="h-[200px] w-full" />
    </template>

    <template v-else>
      <h1 class="text-2xl text-green-700 font-bold">
        {{ currentCompany.name }}
      </h1>

      <!-- Row 1 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StationsPieChart :data="dashboard.stations" />
        <TicketsPieChart :data="dashboard.tickets" />
        <InactiveStationsCard :inactive="dashboard.stations.inactive" />
      </div>

      <!-- Row 2 -->
      <div class="grid grid-cols-3 gap-4">
        <div class="col-span-2">
          <WeeklyUsageChart
            :weekly-totals="dashboard.weeklyTotals"
            :drilldown="drilldown"
            :selected-week="selectedWeek"
            :is-loading="isDrilldownLoading"
            @select-week="loadDrilldown"
            @clear="clearDrilldown"
          />
        </div>
        <div class="col-span-1">
          <UsageDeltaCard :usage="dashboard.usage" />
        </div>
      </div>

      <!-- Row 3 -->
      <LatestTicketsTable :tickets="dashboard.latestTickets" />
    </template>
  </div>
</template>
