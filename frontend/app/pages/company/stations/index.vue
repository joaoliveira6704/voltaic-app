<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { useStationStore } from "~/stores/station";
import { AdminStationColumns } from "@/utils/constants";
import { Circle } from "lucide-vue-next";
import StationsTable from "~/components/company/station/StationsTable.vue";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";
import { CONNECTOR_LABELS } from "@/constants/connectors";

const { t } = useI18n();
const companyStore = useCompanyStore();
const stationStore = useStationStore();
const router = useRouter();

const isPending = ref(true);

async function init() {
    await Promise.all([
        companyStore.fetchCurrentCompany(),
        stationStore.fetchCompanyStations(),
    ]);
    isPending.value = false;
}
init();

const currentCompany = computed(() => companyStore.currentCompany || "");
const stations = computed(() => stationStore.companyStations);

const getStateClass = (state) => {
    switch (state) {
        case "available":
            return "text-green-600 fill-green-300";
        case "unavailable":
            return "text-red-600 fill-red-300";
        default:
            return "text-yellow-600 fill-yellow-300";
    }
};

const navigateToStation = (id: string) => {
    router.push(`/company/stations/${id}`);
};
</script>

<template>
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <template v-if="isPending">
            <DashboardCard>
                <Skeleton class="h-8 w-[250px]" />
                <div
                    class="mt-6 rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]"
                >
                    <SkeletonTable :columns="6" :rows="5" />
                </div>
            </DashboardCard>
        </template>
        <template v-else>
            <DashboardCard
                :title="`${currentCompany.name} ${t('nav.stations')}`"
                :has-line="false"
            >
                <CardContent class="px-0">
                    <StationsTable
                        :rows="stations"
                        :columns="AdminStationColumns"
                        type="stations"
                        row-key="stationId"
                    >
                        <template #default="{ row }">
                            <TableCell class="text-sm font-bold">{{
                                row.stationId.slice(-12) + "..."
                            }}</TableCell>
                            <TableCell class="text-sm">{{
                                row.title
                            }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{
                                row.location.coordinates.join(", ")
                            }}</TableCell>
                            <TableCell class="text-sm">{{
                                row.connector.socketTypes
                                    .map((t) => CONNECTOR_LABELS[t] ?? t)
                                    .join(", ")
                            }}</TableCell>
                            <TableCell class="text-sm"
                                >{{ row.connector.maxPower }} kW/h</TableCell
                            >
                            <TableCell class="text-sm"
                                ><Circle
                                    class="h-4 w-4"
                                    :class="getStateClass(row.state)"
                            /></TableCell>
                        </template>
                    </StationsTable>
                </CardContent>
            </DashboardCard>
        </template>
    </div>
</template>
