<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useVehicleStore } from "~/stores/vehicle";
import { useUserStore } from "~/stores/user";
import { Check, Loader, X } from "lucide-vue-next";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const props = defineProps({
    isOpen: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "added"]);

const vehicleStore = useVehicleStore();
const userStore = useUserStore();
const { t } = useI18n();
const isSubmitting = ref(false);
const errors = ref<string[]>([]);
const searchQuery = ref("");
const isDropdownOpen = ref(false);
const selectedCatalogVehicle = ref<any>(null);

const form = ref({
    plate: "",
    model: "",
    slug: "",
    color: "",
    connector: "",
});

watch(
    () => props.isOpen,
    async (val) => {
        if (val) {
            resetForm();
            if (!vehicleStore.vehicles.length) {
                await vehicleStore.fetchVehicles();
            }
        }
    },
);

const filteredVehicles = computed(() => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return vehicleStore.vehicles.slice(0, 20);
    return vehicleStore.vehicles
        .filter((v: any) => {
            const label =
                `${v.make?.name} ${v.model?.name} ${v.year}`.toLowerCase();
            return label.includes(q);
        })
        .slice(0, 20);
});

const vehicleLabel = (v: any) =>
    `${v.make?.name} ${v.model?.name} ${v.year}${v.variant?.name ? " · " + v.variant.name : ""}`;

function selectVehicle(v: any) {
    selectedCatalogVehicle.value = v;
    const connector = v.charge_ports?.[0]?.connector ?? "";
    form.value.model = `${v.make?.name} ${v.model?.name} ${v.year}`;
    form.value.slug = v.make?.name.toLowerCase();
    form.value.connector = connector;
    searchQuery.value = vehicleLabel(v);
    isDropdownOpen.value = false;
}

function resetForm() {
    form.value = { plate: "", model: "", slug: "", color: "", connector: "" };
    searchQuery.value = "";
    selectedCatalogVehicle.value = null;
    isDropdownOpen.value = false;
    errors.value = [];
}

const validate = () => {
    const errs: string[] = [];
    if (!form.value.plate.trim())
        errs.push(t("modal.addVehicle.errors.plateRequired"));
    if (!selectedCatalogVehicle.value)
        errs.push(t("modal.addVehicle.errors.vehicleRequired"));
    if (!form.value.color.trim())
        errs.push(t("modal.addVehicle.errors.colorRequired"));
    return errs;
};

const handleSave = async () => {
    errors.value = [];
    const validationErrors = validate();
    if (validationErrors.length) {
        errors.value = validationErrors;
        return;
    }
    isSubmitting.value = true;
    try {
        await userStore.addVehicle({
            plate: form.value.plate.trim().toUpperCase(),
            model: form.value.model,
            slug: form.value.slug,
            color: form.value.color.trim(),
            connector: form.value.connector,
        });
        emit("added");
        emit("close");
        resetForm();
    } catch (e: any) {
        const message =
            e?.data?.message ||
            e?.data?.error ||
            "Something went wrong. Please try again.";
        errors.value = Array.isArray(message) ? message : [message];
    } finally {
        isSubmitting.value = false;
    }
};

const dismissError = (index: number) => errors.value.splice(index, 1);
const handleClose = () => {
    resetForm();
    emit("close");
};
const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
};

function handleSearchInput() {
    isDropdownOpen.value = true;
    selectedCatalogVehicle.value = null;
    form.value.model = "";
    form.value.slug = "";
    form.value.connector = "";
}
</script>

<template>
    <Dialog :open="isOpen" @update:open="handleOpenChange">
        <DialogContent class="max-w-md p-0 gap-0 rounded-none">
            <!-- Header -->
            <DialogHeader
                class="flex flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-[#232323] space-y-0"
            >
                <DialogTitle
                    class="text-xs font-semibold text-neutral-800 dark:text-white/80 uppercase"
                >
                    {{ t("modal.addVehicle.title") }}
                </DialogTitle>
            </DialogHeader>

            <!-- Form -->
            <form
                class="px-5 py-5 flex flex-col gap-4"
                @submit.prevent="handleSave"
            >
                <!-- Vehicle search / selector -->
                <div class="flex flex-col gap-1.5">
                    <Label class="text-[10px] text-neutral-400 uppercase">
                        {{ t("modal.addVehicle.vehicleLabel") }}
                    </Label>
                    <div class="relative">
                        <Input
                            v-model="searchQuery"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] pr-8"
                            :placeholder="
                                t('modal.addVehicle.searchPlaceholder')
                            "
                            autocomplete="off"
                            @input="handleSearchInput"
                            @focus="isDropdownOpen = true"
                            @focusout="isDropdownOpen = false"
                        />

                        <!-- Loading indicator -->
                        <Loader
                            v-if="vehicleStore.isLoading"
                            class="absolute right-3 top-2 w-3.5 h-3.5 animate-spin text-neutral-400"
                        />
                        <!-- Check / clear icons -->
                        <template v-else-if="searchQuery">
                            <Check
                                v-if="selectedCatalogVehicle"
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-500 dark:text-green-400"
                            />
                            <button
                                v-else
                                type="button"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                                @click="resetForm"
                                :aria-label="t('modal.addVehicle.clear')"
                            >
                                <X class="w-3.5 h-3.5" />
                            </button>
                        </template>

                        <!-- Dropdown -->
                        <Transition
                            enter-active-class="transition-all duration-100 ease-out"
                            leave-active-class="transition-all duration-75 ease-in"
                            enter-from-class="opacity-0 -translate-y-1"
                            leave-to-class="opacity-0"
                        >
                            <ul
                                v-if="
                                    isDropdownOpen &&
                                    !selectedCatalogVehicle &&
                                    filteredVehicles.length
                                "
                                class="absolute z-10 left-0 right-0 top-full mt-1 bg-white dark:bg-[#171717] border border-neutral-200 dark:border-white/10 shadow-md max-h-52 overflow-y-auto"
                            >
                                <li
                                    v-for="v in filteredVehicles"
                                    :key="v._id"
                                    class="px-3 py-2 text-xs text-neutral-700 dark:text-white/80 hover:bg-neutral-50 dark:hover:bg-[#232323] cursor-pointer flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-white/5 last:border-b-0"
                                    @mousedown.prevent="selectVehicle(v)"
                                >
                                    <span>{{ vehicleLabel(v) }}</span>
                                    <span
                                        class="text-[10px] text-neutral-300 uppercase shrink-0"
                                    >
                                        {{
                                            v.charge_ports?.[0]?.connector ??
                                            "—"
                                        }}
                                    </span>
                                </li>
                            </ul>
                            <div
                                v-else-if="
                                    isDropdownOpen &&
                                    !selectedCatalogVehicle &&
                                    searchQuery &&
                                    !vehicleStore.isLoading
                                "
                                class="absolute z-10 left-0 right-0 top-full mt-1 bg-white dark:bg-[#171717] border border-neutral-200 dark:border-white/10 shadow-md"
                            >
                                <p
                                    class="px-3 py-2.5 text-[10px] text-neutral-400 tracking-wide"
                                >
                                    {{ t("modal.addVehicle.noVehiclesFound") }}
                                </p>
                            </div>
                        </Transition>
                    </div>
                </div>

                <!-- Auto-populated fields -->
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-3">
                        <Separator class="flex-1" />
                        <span
                            class="text-[10px] text-neutral-300 uppercase whitespace-nowrap"
                        >
                            {{ t("modal.addVehicle.autoPopulated") }}
                        </span>
                        <Separator class="flex-1" />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <!-- Model (read-only) -->
                        <div class="flex flex-col gap-1.5">
                            <Label
                                class="text-[10px] text-neutral-400 uppercase"
                            >
                                {{ t("modal.addVehicle.model") }}
                            </Label>
                            <Input
                                :value="form.model"
                                type="text"
                                readonly
                                class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] text-neutral-500 dark:text-white/50 select-none cursor-default"
                                :placeholder="t('modal.addVehicle.notApplicable')"
                            />
                        </div>

                        <!-- Connector (read-only) -->
                        <div class="flex flex-col gap-1.5">
                            <Label
                                class="text-[10px] text-neutral-400 uppercase"
                            >
                                {{ t("modal.addVehicle.connector") }}
                            </Label>
                            <Input
                                :value="form.connector"
                                type="text"
                                readonly
                                class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] text-neutral-500 dark:text-white/50 select-none cursor-default"
                                :placeholder="t('modal.addVehicle.notApplicable')"
                            />
                        </div>
                    </div>

                    <!-- Slug (read-only) -->
                    <div class="flex flex-col gap-1.5">
                        <Label class="text-[10px] text-neutral-400 uppercase">
                            {{ t("modal.addVehicle.slug") }}
                        </Label>
                            <Input
                                :value="form.slug"
                                type="text"
                                readonly
                                class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] text-neutral-500 dark:text-white/50 select-none cursor-default"
                                :placeholder="t('modal.addVehicle.notApplicable')"
                            />
                    </div>
                </div>

                <!-- Your details section -->
                <div class="flex items-center gap-3">
                    <Separator class="flex-1" />
                    <span
                        class="text-[10px] text-neutral-300 uppercase whitespace-nowrap"
                    >
                        {{ t("modal.addVehicle.yourDetails") }}
                    </span>
                    <Separator class="flex-1" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <!-- Plate -->
                    <div class="flex flex-col gap-1.5">
                        <Label class="text-[10px] text-neutral-400 uppercase">
                            {{ t("modal.addVehicle.plate") }}
                        </Label>
                        <Input
                            v-model="form.plate"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717]"
                            :placeholder="
                                t('modal.addVehicle.platePlaceholder')
                            "
                            autocomplete="off"
                        />
                    </div>

                    <!-- Color -->
                    <div class="flex flex-col gap-1.5">
                        <Label class="text-[10px] text-neutral-400 uppercase">
                            {{ t("modal.addVehicle.color") }}
                        </Label>
                        <Input
                            v-model="form.color"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717]"
                            :placeholder="
                                t('modal.addVehicle.colorPlaceholder')
                            "
                            autocomplete="off"
                        />
                    </div>
                </div>

                <!-- Errors -->
                <TransitionGroup
                    tag="ul"
                    enter-active-class="transition-all duration-200 ease-out"
                    leave-active-class="transition-all duration-150 ease-in"
                    enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0"
                    class="flex flex-col gap-1.5 list-none m-0 p-0"
                >
                    <li
                        v-for="(error, i) in errors"
                        :key="error"
                        class="flex items-start justify-between gap-2 border border-red-300 bg-red-200 px-3 py-2"
                    >
                        <div class="flex items-start gap-2">
                            <svg
                                class="mt-px shrink-0 text-red-400"
                                width="11"
                                height="11"
                                viewBox="0 0 12 12"
                                fill="none"
                            >
                                <circle
                                    cx="6"
                                    cy="6"
                                    r="5.5"
                                    stroke="currentColor"
                                />
                                <path
                                    d="M6 3.5v3M6 8v.5"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                    stroke-linecap="round"
                                />
                            </svg>
                            <span
                                class="text-[10px] leading-relaxed tracking-wide text-red-600"
                            >
                                {{ error }}
                            </span>
                        </div>
                        <button
                            type="button"
                            class="shrink-0 text-red-300 hover:text-red-500 transition-colors mt-px"
                            @click="dismissError(i)"
                            :aria-label="t('modal.addVehicle.dismiss')"
                        >
                            <X class="w-3 h-3" />
                        </button>
                    </li>
                </TransitionGroup>

                <!-- Footer -->
                <div
                    class="flex items-center justify-between pt-3 mt-1 border-t border-neutral-100 dark:border-[#232323]"
                >
                    <span
                        class="text-[10px] tracking-wide text-neutral-300 truncate max-w-[180px]"
                    >
                        {{
                            selectedCatalogVehicle
                                ? vehicleLabel(selectedCatalogVehicle)
                                : t("modal.addVehicle.noVehicleSelected")
                        }}
                    </span>
                    <div class="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="px-4 h-7 text-[11px] uppercase rounded-none dark:border-red-500 dark:text-red-500 dark:hover:border-red-400 dark:hover:bg-red-800 dark:hover:text-white"
                            @click="handleClose"
                        >
                            {{ t("modal.addVehicle.cancel") }}
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            :disabled="isSubmitting"
                            class="min-w-[64px] h-7 px-4 text-[11px] uppercase rounded-none dark:bg-green-700 dark:hover:bg-green-600"
                        >
                            <Loader
                                v-if="isSubmitting"
                                class="w-3 h-3 animate-spin"
                            />
                            <span v-else>{{ t("modal.addVehicle.add") }}</span>
                        </Button>
                    </div>
                </div>
            </form>
        </DialogContent>
    </Dialog>
</template>
