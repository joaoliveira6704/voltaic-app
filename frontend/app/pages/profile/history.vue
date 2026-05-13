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
        class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto space-y-6"
    >
        <Skeleton class="h-8 w-[250px]" />
        <div class="rounded-xl border border-gray-100 dark:border-[#232323] overflow-hidden dark:bg-[#171717]">
            <div class="p-4 border-b border-neutral-100 dark:border-[#272727]">
                <div class="flex gap-4">
                    <Skeleton class="h-4 flex-1" />
                    <Skeleton class="h-4 flex-1" />
                    <Skeleton class="h-4 flex-1" />
                    <Skeleton class="h-4 flex-1" />
                </div>
            </div>
            <SkeletonTable :columns="4" :rows="5" />
        </div>
    </div>
    <div v-else class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto">
        <HistoryTable :sessions="chargingHistory" />
    </div>
</template>
