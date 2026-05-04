<script setup>
import { ref, watch } from "vue";
import { Loader, X, MapPin, Zap } from "lucide-vue-next";
import { useStationStore } from "~/stores/station"; // Assuming you have a station store
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
const props = defineProps({
    isOpen: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "created"]);

const stationStore = useStationStore();
const { t } = useI18n();

const isSubmitting = ref(false);
const errors = ref([]);

// Available socket types based on your model
const socketOptions = [
    "Type2",
    "CHAdeMO",
    "CCS/SAE",
    "Type3",
    "Tesla",
    "J-1772",
    "Wall_Euro",
    "Caravan_Mains_Socket",
    "Dual_J-1772",
    "Dual_CHAdeMO",
    "Mennekes",
    "Dual_Mennekes",
];

const form = ref({
    title: "",
    stationId: "",
    state: "available",
    location: {
        lat: null,
        lng: null,
    },
    connector: {
        socketTypes: [],
        maxPower: null,
    },
});

const resetForm = () => {
    form.value = {
        title: "",
        stationId: crypto.randomUUID(), // Generate a default ID
        state: "available",
        location: { lat: null, lng: null },
        connector: { socketTypes: [], maxPower: 150 },
    };
    errors.value = [];
};

watch(
    () => props.isOpen,
    (val) => {
        if (val) resetForm();
    },
);

const validate = () => {
    const errs = [];
    const f = form.value;
    if (!f.title.trim()) errs.push("Station title is required");
    if (!f.location.lat || !f.location.lng)
        errs.push("Coordinates are required");
    if (f.connector.socketTypes.length === 0)
        errs.push("Select at least one socket type");
    if (!f.connector.maxPower) errs.push("Max power must be defined");
    return errs;
};

const handleCreate = async () => {
    errors.value = [];
    const validationErrors = validate();
    if (validationErrors.length) {
        errors.value = validationErrors;
        return;
    }

    isSubmitting.value = true;
    try {
        const payload = {
            title: form.value.title,
            stationId: form.value.stationId,
            state: form.value.state,
            alive: true,
            location: {
                type: "Point",
                // Most GeoJSON systems use [longitude, latitude]
                coordinates: [form.value.location.lng, form.value.location.lat],
            },
            connector: {
                socketTypes: [...form.value.connector.socketTypes],
                maxPower: form.value.connector.maxPower,
            },
        };

        const newStation = await stationStore.createStation(payload);
        emit("created", newStation);
        emit("close");
    } catch (e) {
        errors.value = [e?.data?.message || "Failed to create station"];
    } finally {
        isSubmitting.value = false;
    }
};

const toggleSocket = (type) => {
    const index = form.value.connector.socketTypes.indexOf(type);
    if (index > -1) form.value.connector.socketTypes.splice(index, 1);
    else form.value.connector.socketTypes.push(type);
};

const handleClose = () => emit("close");
</script>

<template>
    <Dialog :open="isOpen" @update:open="(val) => !val && handleClose()">
        <DialogContent
            class="max-w-md p-0 gap-0 rounded-none dark:bg-[#171717] dark:border-[#232323] dark:text-white/80"
        >
            <!-- Header -->
            <DialogHeader
                class="flex flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-[#232323] space-y-0"
            >
                <DialogTitle
                    class="text-xs font-semibold text-neutral-800 dark:text-white/80 uppercase"
                >
                    Register New Station
                </DialogTitle>
            </DialogHeader>

            <form
                class="px-5 py-5 flex flex-col gap-4"
                @submit.prevent="handleCreate"
            >
                <!-- Station Title -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                        >Station Display Name</Label
                    >
                    <Input
                        v-model="form.title"
                        type="text"
                        placeholder="e.g. Faro Charging Station 480"
                        class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                    />
                </div>

                <!-- Coordinates Row -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                        <Label
                            class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                            >Latitude</Label
                        >
                        <div class="relative">
                            <MapPin
                                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400"
                            />
                            <Input
                                v-model.number="form.location.lat"
                                type="number"
                                step="any"
                                placeholder="36.856..."
                                class="h-8 pl-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                            />
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <Label
                            class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                            >Longitude</Label
                        >
                        <Input
                            v-model.number="form.location.lng"
                            type="number"
                            step="any"
                            placeholder="-8.233..."
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                        />
                    </div>
                </div>

                <!-- Power & State -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                        <Label
                            class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                            >Max Power (kW)</Label
                        >
                        <div class="relative">
                            <Zap
                                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400"
                            />
                            <Input
                                v-model.number="form.connector.maxPower"
                                type="number"
                                class="h-8 pl-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                            />
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <Label
                            class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                            >Initial State</Label
                        >
                        <Select v-model="form.state">
                            <SelectTrigger
                                class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                class="rounded-none dark:bg-[#171717] dark:border-[#232323]"
                            >
                                <SelectItem value="available" class="text-xs"
                                    >Available</SelectItem
                                >
                                <SelectItem value="unavailable" class="text-xs"
                                    >Unavailable</SelectItem
                                >
                                <SelectItem value="maintenance" class="text-xs"
                                    >Maintenance</SelectItem
                                >
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <!-- Socket Types (Grid Select) -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                        >Socket Types</Label
                    >
                    <div class="grid grid-cols-2 gap-2 mt-1">
                        <button
                            v-for="type in socketOptions"
                            :key="type"
                            type="button"
                            @click="toggleSocket(type)"
                            :class="[
                                'px-3 py-1.5 text-[10px] border text-left transition-colors',
                                form.connector.socketTypes.includes(type)
                                    ? 'bg-green-700/20 border-green-700 text-green-500'
                                    : 'border-neutral-200 dark:border-[#232323] text-neutral-500 dark:text-white/40',
                            ]"
                        >
                            {{ type.replace("_", " ") }}
                        </button>
                    </div>
                </div>

                <!-- Error Messages -->
                <div v-if="errors.length" class="flex flex-col gap-2">
                    <div
                        v-for="(error, i) in errors"
                        :key="i"
                        class="flex items-center justify-between border border-red-500/50 bg-red-500/10 px-3 py-2"
                    >
                        <span
                            class="text-[10px] text-red-500 uppercase font-medium"
                            >{{ error }}</span
                        >
                        <X
                            class="w-3 h-3 text-red-500 cursor-pointer"
                            @click="errors.splice(i, 1)"
                        />
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="flex items-center justify-end pt-3 mt-2 border-t border-neutral-100 dark:border-[#232323]"
                >
                    <div class="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="h-7 text-[11px] uppercase rounded-none dark:border-white/10 dark:text-white/40"
                            @click="handleClose"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            :disabled="isSubmitting"
                            class="min-w-[80px] h-7 text-[11px] uppercase rounded-none dark:bg-green-700 dark:hover:bg-green-600"
                        >
                            <Loader
                                v-if="isSubmitting"
                                class="w-3 h-3 animate-spin mr-2"
                            />
                            Deploy
                        </Button>
                    </div>
                </div>
            </form>
        </DialogContent>
    </Dialog>
</template>
