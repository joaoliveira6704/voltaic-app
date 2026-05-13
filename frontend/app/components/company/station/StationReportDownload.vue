<script setup lang="ts">
import { DownloadIcon } from "lucide-vue-next";
const emit = defineEmits<{
    (e: "download"): void;
}>();
</script>

<template>
    <Button @click="emit('download')">
        <DownloadIcon />
        Download Station Report
    </Button>
</template>
