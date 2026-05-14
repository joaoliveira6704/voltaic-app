<!-- pages/map.vue -->
<template>
    <div class="relative w-full h-screen overflow-hidden">
        <div
            ref="mapContainer"
            class="w-full h-full"
            @click="sidebarOpen = false"
        />
        <div
            v-if="pageLoading || !isReady"
            class="absolute inset-0 z-[1]"
        >
            <Skeleton class="w-full h-full" />
        </div>

        <MapTopBar
            :filters="filters"
            :sidebar-open="sidebarOpen"
            :selected-connectors-count="selectedConnectors.length"
            @toggle-filter="toggleFilter"
            @toggle-sidebar="sidebarOpen = !sidebarOpen"
            @clear-connectors="resetSidebarFilters"
        />

        <MapFilterCard
            :open="sidebarOpen"
            :is-mobile="isMobile"
            :all-connectors="allConnectors"
            :selected-connectors="selectedConnectors"
            :distance-active="distanceActive"
            :slider-value="sliderValue"
            @close="sidebarOpen = false"
            @reset="resetSidebarFilters"
            @toggle-connector="toggleConnector"
            @slider-change="onSliderChange"
            @slider-commit="(val) => onSliderCommit(val, userLocation)"
        />

        <MapStationCard
            :station="selectedStation"
            :is-mobile="isMobile"
            @close="selectedStation = null"
            @stop="handleStopRequest"
            @start="handleStartRequest"
        />

        <MapLocateButton :locating="locating" @click="flyToUser" />
        <MapNorthButton @click="resetNorth" />
        <MapThemeButton />
        <Toaster position="top-right" rich-colors close-button theme="dark" />


    </div>
    <StopChargingModal
    class="!z-99"
        :is-open="isStopModalOpen"
        @close="isStopModalOpen = false"
        @confirm="handleStopConfirm"
    />
    <StartChargingModal
        class="!z-99"
        :is-open="isStartModalOpen"
        :vehicles="compatibleVehicles"
        @close="isStartModalOpen = false"
        @confirm="handleStartConfirm"
    />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Skeleton } from "~/components/ui/Skeleton";
import { useUserStore } from "@/stores/user";
import { useStationStore } from "@/stores/station";
import { useUsageStore } from "@/stores/usage";
import { useResponsive } from "@/composables/useResponsive";
import { useMapFilters } from "@/composables/useMapFilters";
import { useMapInstance } from "@/composables/useMapInstance";
import { useMapMarkers } from "@/composables/useMapMarkers";
import { useMapClustering } from "@/composables/useMapClustering";
import type { Station } from "@/types/station";
import StartChargingModal from "@/components/modals/StartChargingModal.vue";
import StopChargingModal from "@/components/modals/StopChargingModal.vue";

import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";

definePageMeta({
    ssr: false,
    layout: false,
});

const { t } = useI18n();

useHead({
    title: t("map.title"),
    meta: [
        {
            name: "description",
            content: t("map.description"),
        },
    ],
    link: [
        {
            rel: "preconnect",
            href: "https://tiles.openfreemap.org",
        },
    ],
});

// ── User ──────────────────────────────────────────────────────────────────────

const userStore = useUserStore();

// Writable computed that syncs with the store
const colorMode = useColorMode();
const isDark = computed(() => colorMode.preference === "dark");

// ── Stations ──────────────────────────────────────────────────────────────────

const stationStore = useStationStore();
const companyStore = useCompanyStore();
const usageStore = useUsageStore();

// ── Charging Modals ──────────────────────────────────────────────────────────

const isStopModalOpen = ref(false);
const isStartModalOpen = ref(false);
const pendingStopUsage = ref<{ usageId: string; stationId: string } | null>(null);

const compatibleVehicles = computed(() =>
    (userStore.currentUser?.vehicles ?? []).filter((v) =>
        selectedStation.value?.connector.socketTypes.some(
            (t) => v.connector.toLowerCase() === t.toLowerCase(),
        ),
    ),
);

function handleStopRequest(usageId: string, stationId: string) {
    pendingStopUsage.value = { usageId, stationId };
    isStopModalOpen.value = true;
}

function handleStartRequest() {
    isStartModalOpen.value = true;
}

async function handleStopConfirm() {
    if (!pendingStopUsage.value) return;
    try {
        await stationStore.stopCharge(
            pendingStopUsage.value.usageId,
            pendingStopUsage.value.stationId,
        );
        usageStore.usages = usageStore.usages.filter(
            (u) => u.usageId !== pendingStopUsage.value!.usageId,
        );
        if (selectedStation.value) selectedStation.value.state = "available";
    } catch (error) {
        console.error("Stop charge failed", error);
    } finally {
        isStopModalOpen.value = false;
        pendingStopUsage.value = null;
    }
}

async function handleStartConfirm(plate: string) {
    if (!selectedStation.value) return;
    try {
        const usage = await stationStore.startCharge(selectedStation.value, plate);
        usageStore.usages = [...usageStore.usages, usage];
        selectedStation.value.state = "unavailable";
    } catch (error) {
        console.error("Start charge failed", error);
    } finally {
        isStartModalOpen.value = false;
    }
}

const firstStation = computed(
    () => stationStore.stations[0] as Station | undefined,
);

const pageLoading = ref(true);

Promise.all([
    !userStore.currentUser ? userStore.fetchCurrentUser() : Promise.resolve(),
    stationStore.fetchStations(),
    companyStore.fetchCurrentCompany(),
    usageStore.fetchUserActiveUsages(),
]).finally(() => {
    pageLoading.value = false;
});

// ── Composables ───────────────────────────────────────────────────────────────

const { isMobile } = useResponsive();

const {
    filters,
    sidebarOpen,
    selectedConnectors,
    allConnectors,
    filteredStations,
    sliderValue,
    distanceActive,
    userLocation,
    toggleFilter,
    toggleConnector,
    resetSidebarFilters,
    onSliderChange,
    onSliderCommit,
} = useMapFilters();

const {
    mapContainer,
    mapInstance,
    MarkerClass,
    isReady,
    currentZoom,
    resetNorth,
    flyToUser,
    locating,
} = useMapInstance(isDark, firstStation);

// ── Station Card ───────────────────────────────────────────────────────────────

const selectedStation = ref<Station | null>(null);

useMapMarkers(
    mapInstance,
    isReady,
    filteredStations,
    MarkerClass,
    currentZoom,
    (station) => {
        selectedStation.value = station;
    },
);

useMapClustering(
    mapInstance,
    isReady,
    filteredStations,
    MarkerClass,
    currentZoom,
);
</script>
