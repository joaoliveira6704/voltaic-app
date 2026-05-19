<script setup lang="ts">
const props = defineProps<{
    stationId: string;
    username: string;
}>();

const emit = defineEmits<{
    (e: "execute", command: string): void;
}>();

const { t } = useI18n();
const commandInput = ref("");

function handleEnter() {
    if (!commandInput.value.trim()) return;
    emit("execute", commandInput.value);
    commandInput.value = "";
}
</script>

<template>
    <input
        v-model="commandInput"
        type="text"
        :placeholder="`${username}@${stationId}: ${t('company.stations.commandPlaceholder')}`"
        class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 font-mono text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
        @keydown.enter="handleEnter"
    />
</template>
