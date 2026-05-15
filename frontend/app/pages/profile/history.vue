// pages/profile/index.vue
<script setup>
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";
import { Skeleton, SkeletonTable } from "~/components/ui/Skeleton";

useHead({
    title: "Voltaic - Charging History",
    meta: [
        {
            name: "description",
            content: "View charging history for your vehicles.",
        },
    ],
});

const { t } = useI18n();

const userStore = useUserStore(); // Pinia must be called before any awaits
const { chargingHistory } = storeToRefs(userStore);
const { fetchCurrentUser, fetchChargingHistory } = userStore;

const isPending = ref(true);

fetchCurrentUser()
    .then(() => fetchChargingHistory())
    .finally(() => {
        isPending.value = false;
    });
</script>

<template>
    <div
        v-if="isPending"
        class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-6 mt-2"
    >
        <DashboardCard
            ><Skeleton class="h-8 w-[250px]" />
            <div
                class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717] mt-6"
            >
                <div
                    class="p-4 border-b border-neutral-100 dark:border-[#272727]"
                >
                    <div class="flex gap-4">
                        <Skeleton class="h-4 flex-1" />
                        <Skeleton class="h-4 flex-1" />
                        <Skeleton class="h-4 flex-1" />
                        <Skeleton class="h-4 flex-1" />
                    </div>
                </div>
                <SkeletonTable :columns="4" :rows="5" /></div
        ></DashboardCard>
    </div>
    <div v-else class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto mt-2">
        <DashboardCard>
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-xl font-bold text-gray-900 dark:text-white/80">
                    {{ t("nav.history") }}
                </h1>
                <span class="text-xs text-gray-500 dark:text-white/40">
                    {{ chargingHistory.length }}
                    {{ chargingHistory.length === 1 ? "session" : "sessions" }}
                </span>
            </div>

            <div v-if="chargingHistory.length === 0" class="text-center py-20">
                <p class="text-sm text-gray-400 dark:text-white/30">
                    No charging history yet.
                </p>
                <p class="text-xs text-gray-300 dark:text-white/20 mt-1">
                    Browse the map and save your favorites.
                </p>
            </div>
            <HistoryTable v-else :sessions="chargingHistory" />
        </DashboardCard>
    </div>
</template>
