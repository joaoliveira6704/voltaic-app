<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Zap, AlertTriangle } from "lucide-vue-next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const { t } = useI18n();

defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    close: [];
    confirm: [];
}>();

function handleConfirm() {
    emit("confirm");
}

function handleOpenChange(open: boolean) {
    if (!open) emit("close");
}
</script>

<template>
    <Dialog :open="isOpen" @update:open="handleOpenChange">
        <DialogContent
            class="max-w-sm p-0 gap-0 dark:bg-[#171717] dark:border-[#232323]"
        >
            <DialogHeader
                class="flex flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-[#232323] space-y-0"
            >
                <DialogTitle
                    class="text-sm font-semibold text-neutral-900 dark:text-white/90"
                >
                    {{ t("map.swal.stopChargingTitle") }}
                </DialogTitle>
            </DialogHeader>

            <div class="px-5 py-6 flex flex-col items-center text-center gap-3">
                <div
                    class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center"
                >
                    <AlertTriangle
                        class="w-5 h-5 text-red-500 dark:text-red-400"
                    />
                </div>
                <div class="space-y-1">
                    <p class="text-sm font-medium text-neutral-800 dark:text-white/80">
                        {{ t("map.swal.stopChargingTitle") }}
                    </p>
                    <p class="text-xs text-neutral-500 dark:text-white/50">
                        {{ t("map.swal.stopChargingText") }}
                    </p>
                </div>
            </div>

            <div
                class="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-100 dark:border-[#232323]"
            >
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="h-8 px-4 text-xs dark:border-white/10 dark:text-white/50 dark:hover:text-white/80"
                    @click="handleOpenChange(false)"
                >
                    {{ t("cancel") }}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    class="h-8 px-4 text-xs bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-500"
                    @click="handleConfirm"
                >
                    <Zap class="w-3.5 h-3.5 mr-1.5" />
                    {{ t("map.swal.stop") }}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
</template>

<style scoped>
:deep([data-slot="dialog-overlay"]) {
    z-index: 1200 !important;
}
:deep([data-slot="dialog-content"]) {
    z-index: 1201 !important;
}
</style>
