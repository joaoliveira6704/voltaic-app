<script setup lang="ts">
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";
import { Skeleton } from "~/components/ui/Skeleton";
import FavoriteStationCard from "~/components/cards/FavoriteStationCard.vue";

useHead({
  title: "Voltaic - Favorite Stations",
});

const { t } = useI18n();

const userStore = useUserStore();
const { favoriteStations } = storeToRefs(userStore);

const isPending = ref(true);

async function init() {
  await userStore.fetchFavoriteStations();
  isPending.value = false;
}
init();

async function removeFavorite(stationId: string) {
  await userStore.removeFavorite(stationId);
  favoriteStations.value = favoriteStations.value.filter(
    (s: any) => s.stationId !== stationId,
  );
}
</script>

<template>
  <div v-if="isPending" class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-6 mt-2">
    <DashboardCard><Skeleton class="h-8 w-[250px]" />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <div v-for="n in 6" :key="n" class="rounded-xl border border-gray-100 dark:border-[#232323] p-5 dark:bg-[#171717]">
        <Skeleton class="h-4 w-3/4 mb-3" />
        <Skeleton class="h-3 w-full mb-2" />
        <div class="flex gap-2 mb-3">
          <Skeleton class="h-5 w-16 rounded-full" />
          <Skeleton class="h-5 w-16 rounded-full" />
        </div>
        <Skeleton class="h-3 w-12 mb-3" />
        <Skeleton class="h-8 w-full rounded-lg" />
      </div>
    </div></DashboardCard>
  </div>
  <div v-else class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto mt-2">
    <DashboardCard>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white/80">
          {{ t("nav.favoriteStations") }}
        </h1>
        <span class="text-xs text-gray-500 dark:text-white/40">
          {{ favoriteStations.length }} {{ favoriteStations.length === 1 ? "station" : "stations" }}
        </span>
      </div>

    <div v-if="favoriteStations.length === 0" class="text-center py-20">
      <p class="text-sm text-gray-400 dark:text-white/30">No favorite stations yet.</p>
      <p class="text-xs text-gray-300 dark:text-white/20 mt-1">Browse the map and save your favorites.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <FavoriteStationCard
        v-for="station in favoriteStations"
        :key="station.stationId"
        :station="station"
        @remove="removeFavorite(station.stationId)"
      />
    </div></DashboardCard>
  </div>
</template>
