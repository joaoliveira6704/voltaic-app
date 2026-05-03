<script setup>
import { AdminStationColumns } from "@/utils/constants";
import { Circle } from "lucide-vue-next";

const isAddUserModalOpen = ref(false);
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
        button-text="Add new station"
        @add="isAddUserModalOpen = true"
    >
        <template #modal>
            <AddUserModal
                :is-open="isAddUserModalOpen"
                @close="isAddUserModalOpen = false"
            />
        </template>

        <AdminTable
            :rows="stations"
            :columns="AdminStationColumns"
            @edit="editStation"
            @delete="deleteUser"
            type="stations"
        >
            <template #default="{ row }">
                <TableCell class="font-mono text-xs font-bold">{{
                    row.stationId
                }}</TableCell>
                <TableCell class="font-mono text-xs">{{ row.title }}</TableCell>
                <TableCell class="font-mono text-xs text-muted-foreground">{{
                    row.location.coordinates.join(", ")
                }}</TableCell>
                <TableCell class="font-mono text-xs">{{
                    row.connector.socketTypes.join(", ")
                }}</TableCell>
                <TableCell class="font-mono text-xs"
                    >{{ row.connector.maxPower }} kW/h</TableCell
                >
                <TableCell class="font-mono text-xs"
                    ><Circle class="h-4 w-4" :class="getStateClass(row.state)"
                /></TableCell>
            </template>
        </AdminTable>
    </AdminPage>
</template>
