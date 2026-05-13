<script setup>
import { AdminStationColumns } from "@/utils/constants";
import { Circle } from "lucide-vue-next";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";

const { t } = useI18n();

useHead({
    title: t("admin.stations.title"),
});

const isAddStationModalOpen = ref(false);
const isPending = ref(true);
const searchTerm = ref("");

const stationStore = useStationStore();
const { stations } = storeToRefs(stationStore);

const companyStore = useCompanyStore();

const filtered = computed(() =>
    stations.value.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
);

const getCompanyName = (companyId) => {
    return companyStore.getCompanyName(companyId);
};

const deleteStation = async (station) => {
    try {
        await stationStore.deleteStation(station.stationId, station.title);
    } catch (error) {
        console.log(error);
        return;
    }
};

const getStateClass = (state) => {
    switch (state) {
        case "available":
            return "text-green-600 fill-green-300";
        case "inactive":
            return "text-red-600 fill-red-300";
        default:
            return "text-yellow-600 fill-yellow-300";
    }
};

stationStore
    .fetchStations(100)
    .then(() => companyStore.fetchCompanies(100))
    .finally(() => {
        isPending.value = false;
    });
</script>

<template>
    <template v-if="isPending">
        <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-4">
            <Skeleton class="h-8 w-[200px]" />
            <Skeleton class="h-4 w-[250px] mb-4" />
            <div class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]">
                <SkeletonTable :columns="7" :rows="5" />
            </div>
        </div>
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
                    row.connector.socketTypes.join(", ")
                }}</TableCell>
                <TableCell class="text-xs"
                    >{{ row.connector.maxPower }} kW/h</TableCell
                >
                <TableCell class="text-xs"
                    ><Circle class="h-4 w-4" :class="getStateClass(row.state)"
                /></TableCell>
            </template>
        </AdminTable>
    </AdminPage>
</template>
