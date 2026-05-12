<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";

const companyStore = useCompanyStore();

const currentCompany = computed(() => companyStore.currentCompany || "");

await companyStore.fetchCurrentCompany();
</script>

<template>
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <h1 class="text-2xl text-green-700 font-bold">
            {{ currentCompany.name }}
        </h1>
        <!-- Metric cards -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard title="Total Workers" :has-line="false">
                <CardContent>
                    <p class="text-3xl font-semibold">10 Workers</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        +12% this month
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard title="Stations" :has-line="false">
                <CardContent>
                    <p class="text-3xl font-semibold">10 Stations</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        8 active now
                    </p>
                </CardContent>
            </DashboardCard>

            <DashboardCard title="Open tickets" :has-line="false">
                <CardContent>
                    <p class="text-3xl font-semibold">8 Tickets</p>
                    <p class="text-xs text-muted-foreground mt-1">
                        +8 since yesterday
                    </p>
                </CardContent>
            </DashboardCard>
        </div>
    </div>
</template>
