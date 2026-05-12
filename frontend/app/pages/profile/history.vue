// pages/profile/index.vue
<script setup>
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";

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

// Let Nuxt handle the async lifecycle instead of bare awaits
await useAsyncData("currentUser", () => fetchCurrentUser());
await useAsyncData("chargingHistory", () => fetchChargingHistory());
</script>

<template>
    <div v-if="!userStore.isLoaded">
        <h1>loading...</h1>
    </div>
    <div v-else class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto">
        <HistoryTable :sessions="chargingHistory" />
    </div>
</template>
