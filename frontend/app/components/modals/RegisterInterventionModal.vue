<script setup>
import { ref, watch } from "vue";
import { Loader, X, Wrench, User, FileText } from "lucide-vue-next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    stationId: { type: String, required: true },
});

const emit = defineEmits(["close", "created"]);

const ticketStore = useTicketStore();
const userStore = useUserStore();

const isSubmitting = ref(false);
const errors = ref([]);

const form = ref({
    title: "",
    description: "",
    remarks: "",
    status: "open",
});

const resetForm = () => {
    form.value = {
        title: "",
        description: "",
        remarks: "",
        status: "resolved",
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
    if (!form.value.title.trim()) errs.push("Title is required");
    if (!form.value.description.trim()) errs.push("Description is required");
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
            ticketId: crypto.randomUUID(),
            stationId: props.stationId,
            createdBy: userStore.currentUser?.id,
            title: form.value.title,
            description: form.value.description,
            remarks: form.value.remarks || undefined,
            status: form.value.status,
        };

        const newTicket = await ticketStore.createTicket(payload);
        emit("created", newTicket);
        emit("close");
    } catch (e) {
        errors.value = [e?.data?.message || "Failed to create ticket"];
    } finally {
        isSubmitting.value = false;
    }
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
                <div class="flex items-center gap-2">
                    <Wrench class="w-3.5 h-3.5 text-green-500" />
                    <DialogTitle
                        class="text-xs font-semibold text-neutral-800 dark:text-white/80 uppercase"
                    >
                        Register Intervention
                    </DialogTitle>
                </div>
                <span
                    class="font-mono text-[10px] text-neutral-400 dark:text-white/30"
                >
                    {{ stationId }}
                </span>
            </DialogHeader>

            <form
                class="px-5 py-5 flex flex-col gap-4"
                @submit.prevent="handleCreate"
            >
                <!-- Title -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        Title
                    </Label>
                    <Input
                        v-model="form.title"
                        type="text"
                        placeholder="e.g. Connector not responding"
                        class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                    />
                </div>

                <!-- Status -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        Initial Status
                    </Label>
                    <Select
                        :model-value="form.status"
                        @update:model-value="form.status = $event"
                    >
                        <SelectTrigger
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                            class="rounded-none dark:bg-[#171717] dark:border-[#232323]"
                        >
                            <SelectItem value="resolved" class="text-xs"
                                >Resolved</SelectItem
                            >
                            <SelectItem value="unresolved" class="text-xs"
                                >Unresolved</SelectItem
                            >
                        </SelectContent>
                    </Select>
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        Description
                    </Label>
                    <Textarea
                        v-model="form.description"
                        placeholder="Describe the issue in detail..."
                        rows="3"
                        class="rounded-none text-xs resize-none bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                    />
                </div>

                <!-- Remarks -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        Remarks
                        <span class="text-white/20 normal-case"
                            >(optional)</span
                        >
                    </Label>
                    <Textarea
                        v-model="form.remarks"
                        placeholder="Any additional notes..."
                        rows="2"
                        class="rounded-none text-xs resize-none bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                    />
                </div>

                <!-- Errors -->
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
                            class="min-w-[80px] h-7 text-[11px] uppercase rounded-none bg-green-600 hover:bg-green-500 text-white"
                        >
                            <Loader
                                v-if="isSubmitting"
                                class="w-3 h-3 animate-spin mr-2"
                            />
                            Submit
                        </Button>
                    </div>
                </div>
            </form>
        </DialogContent>
    </Dialog>
</template>
