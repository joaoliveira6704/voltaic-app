<script setup lang="ts">
import { AdminStationColumns } from "@/utils/constants";
import { Circle } from "lucide-vue-next";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";
import { CONNECTOR_LABELS } from "@/constants/connectors";
import Pagination from "~/components/ui/Pagination.vue";

const { t } = useI18n();

useHead({
    title: t("admin.stations.title"),
});

const isAddStationModalOpen = ref(false);
const isPending = ref(true);
const searchTerm = ref("");
const page = ref(1);
const sortColumn = ref("");
const sortDirection = ref("");

const stationStore = useStationStore();
const { stations, currentPage, totalPages } = storeToRefs(stationStore);

function buildParams() {
    const params = {} as Record<string, string>;
    if (searchTerm.value) params.search = searchTerm.value;
    if (sortColumn.value && sortDirection.value) {
        params.sort = `${sortColumn.value}:${sortDirection.value}`;
    }
    return params;
}

async function fetchData() {
    await stationStore.fetchStations(page.value, 20, buildParams());
}

function onPageChange(p: number) {
    page.value = p;
    fetchData();
}

function onSort({ column, direction }: { column: string; direction: string }) {
    sortColumn.value = column;
    sortDirection.value = direction;
    page.value = 1;
    fetchData();
}

async function deleteStation(station: any) {
    try {
        await stationStore.deleteStation(station.stationId, station.title);
    } catch (error) {
        console.log(error);
    }
}

function getStateClass(state: string) {
    switch (state) {
        case "available":
            return "text-green-600 fill-green-300";
        case "inactive":
            return "text-red-600 fill-red-300";
        default:
            return "text-yellow-600 fill-yellow-300";
    }
}

let debounceTimer: ReturnType<typeof setTimeout>;
watch(searchTerm, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        page.value = 1;
        fetchData();
    }, 300);
});

stationStore.fetchStations(1, 20).finally(() => {
    isPending.value = false;
});
</script>

<template>
    <template v-if="isPending">
        <DashboardCard class="mt-4 mx-2">
            <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-4">
                <Skeleton class="h-8 w-[200px]" />
                <Skeleton class="h-4 w-[250px] mb-4" />
                <div
                    class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]"
                >
                    <SkeletonTable :columns="7" :rows="5" />
                </div>
            </div>
        </DashboardCard>
    </template>
    <AdminPage
        v-else
        v-model:search="searchTerm"
        :title="t('admin.stations.title')"
        :button-text="t('admin.stations.createNew')"
        @add="isAddStationModalOpen = true"
    >
        <template #modal>
            <AddStationModal
                :is-open="isAddStationModalOpen"
                @close="isAddStationModalOpen = false"
            />
        </template>

        <AdminTable
            :rows="stations"
            :columns="AdminStationColumns"
            :sort-column="sortColumn"
            :sort-direction="sortDirection"
            @sort="onSort"
            @edit="editStation"
            @delete="deleteStation"
            type="stations"
        >
            <template #default="{ row }">
                <TableCell class="text-xs font-bold">{{
                    row.stationId
                }}</TableCell>
                <TableCell class="text-xs">{{ row.title }}</TableCell>
                <TableCell class="text-xs text-muted-foreground">{{
                    row.location.coordinates.join(", ")
                }}</TableCell>
                <TableCell class="text-xs">{{
                    row.connector.socketTypes
                        .map((t: string) => CONNECTOR_LABELS[t] ?? t)
                        .join(", ")
                }}</TableCell>
                <TableCell class="text-xs"
                    >{{ row.connector.maxPower }} kW/h</TableCell
                >
                <TableCell class="text-xs"
                    ><Circle class="h-4 w-4" :class="getStateClass(row.state)"
                /></TableCell>
            </template>
        </AdminTable>
        <Pagination
            class="pt-4"
            :current-page="currentPage"
            :total-pages="totalPages"
            @update:page="onPageChange"
        />
    </AdminPage>
</template>
