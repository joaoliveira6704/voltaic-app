<script setup lang="ts">
import { DownloadIcon } from "lucide-vue-next";
const { t } = useI18n();
const emit = defineEmits<{
    (e: "download"): void;
}>();
</script>

<template>
    <Button @click="emit('download')">
        <DownloadIcon />
        {{ t("company.stationReport.download") }}
    </Button>
</template>
