<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { Skeleton, SkeletonMetricCard } from "~/components/ui/Skeleton";
const { t } = useI18n();
const companyStore = useCompanyStore();

const currentCompany = computed(() => companyStore.currentCompany || "");
const isPending = ref(true);

companyStore.fetchCurrentCompany().finally(() => {
  isPending.value = false;
});
</script>

<template>
  <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
    <template v-if="isPending">
      <Skeleton class="h-8 w-[250px]" />
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-3 gap-4"
      >
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>
    </template>
    <template v-else>
      <h1 class="text-2xl text-green-700 font-bold">
        {{ currentCompany.name }}
      </h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          :title="t('company.index.totalWorkers')"
          :has-line="false"
        >
          <CardContent>
            <p class="text-3xl font-semibold">
              {{
                t("company.index.totalWorkersCount", {
                  count: 10,
                })
              }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ t("company.index.totalWorkersSubtext") }}
            </p>
          </CardContent>
        </DashboardCard>

        <DashboardCard :title="t('company.index.stations')" :has-line="false">
          <CardContent>
            <p class="text-3xl font-semibold">
              {{ t("company.index.stationsCount", { count: 10 }) }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              {{
                t("company.index.stationsActiveNow", {
                  count: 8,
                })
              }}
            </p>
          </CardContent>
        </DashboardCard>

        <DashboardCard
          :title="t('company.index.openTickets')"
          :has-line="false"
        >
          <CardContent>
            <p class="text-3xl font-semibold">
              {{
                t("company.index.openTicketsCount", {
                  count: 8,
                })
              }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              {{ t("company.index.openTicketsSubtext") }}
            </p>
          </CardContent>
        </DashboardCard>
      </div>
    </template>
  </div>
</template>
