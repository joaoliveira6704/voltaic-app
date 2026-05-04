<script setup>
import { AdminStationColumns } from "@/utils/constants";
import { Circle } from "lucide-vue-next";

const isAddStationModalOpen = ref(false);
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

onMounted(() => {
    stationStore.fetchStations();
    companyStore.fetchCompanies();
});
</script>

<template>
    <AdminPage
        v-model:search="searchTerm"
        title="Stations"
        button-text="Create new station"
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
