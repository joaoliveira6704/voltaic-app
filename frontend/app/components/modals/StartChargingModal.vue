<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Zap, Loader } from "lucide-vue-next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const { t } = useI18n();

const props = defineProps<{
    isOpen: boolean;
    vehicles: { plate: string; model: string }[];
}>();

const emit = defineEmits<{
    close: [];
    confirm: [plate: string];
}>();

const selectedPlate = ref("");
const isStarting = ref(false);

function handleConfirm() {
    if (!selectedPlate.value) return;
    isStarting.value = true;
    emit("confirm", selectedPlate.value);
}

function handleOpenChange(open: boolean) {
    if (!open) {
        reset();
        emit("close");
    }
}

function reset() {
    selectedPlate.value = "";
    isStarting.value = false;
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
                    {{ t("map.swal.chargeStationTitle") }}
                </DialogTitle>
            </DialogHeader>

            <div class="px-5 py-4 space-y-4">
                <p class="text-xs text-neutral-500 dark:text-white/50">
                    {{ t("map.swal.chargeStationText") }}
                </p>

                <div v-if="vehicles.length === 0" class="text-xs text-neutral-400 dark:text-white/40 text-center py-6">
                    {{ t("map.noCompatibleVehicles") }}
                </div>

                <div v-else class="space-y-2">
                    <span
                        class="text-[10px] font-semibold text-neutral-400 dark:text-white/40 uppercase tracking-wide"
                    >
                        {{ t("map.swal.selectVehicle") }}
                    </span>
                    <Select v-model="selectedPlate">
                        <SelectTrigger
                            class="w-full h-9 text-xs dark:bg-[#171717] dark:border-[#232323]"
                        >
                            <SelectValue
                                :placeholder="t('map.swal.selectVehiclePlaceholder')"
                            />
                        </SelectTrigger>
                        <SelectContent
                            class="dark:bg-[#171717] dark:border-[#232323]"
                        >
                            <SelectItem
                                v-for="v in vehicles"
                                :key="v.plate"
                                :value="v.plate"
                                class="text-xs"
                            >
                                {{ v.plate }} ({{ v.model }})
                            </SelectItem>
                        </SelectContent>
                    </Select>
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
                    :disabled="!selectedPlate || isStarting"
                    class="h-8 px-4 text-xs dark:bg-blue-600 dark:hover:bg-blue-500"
                    @click="handleConfirm"
                >
                    <Loader
                        v-if="isStarting"
                        class="w-3 h-3 animate-spin mr-1.5"
                    />
                    <Zap v-else class="w-3.5 h-3.5 mr-1.5" />
                    {{ t("map.swal.startCharge") }}
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
