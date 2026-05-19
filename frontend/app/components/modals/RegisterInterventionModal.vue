<script setup lang="ts">
import { Loader, X, Wrench } from "lucide-vue-next";
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

const props = defineProps<{
    isOpen: boolean;
    stationId?: string;
}>();

const emit = defineEmits<{
    (e: "close" | "created"): void;
}>();

const ticketStore = useTicketStore();

const { t } = useI18n();

const isSubmitting = ref(false);
const errors = ref<string[]>([]);

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
        status: "open",
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
    const errs: string[] = [];
    if (!form.value.title.trim()) errs.push(t("modal.registerIntervention.errors.titleRequired"));
    if (!form.value.description.trim()) errs.push(t("modal.registerIntervention.errors.descriptionRequired"));
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
        const payload: Record<string, string> = {
            title: form.value.title,
            description: form.value.description,
            status: form.value.status,
        };
        if (form.value.remarks) payload.remarks = form.value.remarks;
        if (props.stationId) payload.stationId = props.stationId;

        await ticketStore.createTicket(payload);
        emit("created");
        emit("close");
    } catch (e) {
        errors.value = [e?.data?.message || t("modal.registerIntervention.errors.createFailed")];
    } finally {
        isSubmitting.value = false;
    }
};

const handleClose = () => emit("close");
</script>

<template>
    <Dialog :open="isOpen" @update:open="(val: boolean) => !val && handleClose()">
        <DialogContent
            class="max-w-md p-0 gap-0 rounded-none dark:bg-[#171717] dark:border-[#232323] dark:text-white/80"
        >
            <DialogHeader
                class="flex flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-[#232323] space-y-0"
            >
                <div class="flex items-center gap-2">
                    <Wrench class="w-3.5 h-3.5 text-green-500" />
                    <DialogTitle
                        class="text-xs font-semibold text-neutral-800 dark:text-white/80 uppercase"
                    >
                        {{ t("modal.registerIntervention.title") }}
                    </DialogTitle>
                </div>
                <span
                    v-if="stationId"
                    class="font-mono text-[10px] text-neutral-400 dark:text-white/30"
                >
                    {{ stationId }}
                </span>
            </DialogHeader>

            <form
                class="px-5 py-5 flex flex-col gap-4"
                @submit.prevent="handleCreate"
            >
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.registerIntervention.titleField") }}
                    </Label>
                    <Input
                        v-model="form.title"
                        type="text"
                        :placeholder="t('modal.registerIntervention.titlePlaceholder')"
                        class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                    />
                </div>

                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.registerIntervention.initialStatus") }}
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
                            <SelectItem value="open" class="text-xs">Open</SelectItem>
                            <SelectItem value="resolved" class="text-xs"
                                >{{ t("modal.registerIntervention.resolved") }}</SelectItem
                            >
                            <SelectItem value="unresolved" class="text-xs"
                                >{{ t("modal.registerIntervention.unresolved") }}</SelectItem
                            >
                        </SelectContent>
                    </Select>
                </div>

                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.registerIntervention.description") }}
                    </Label>
                    <Textarea
                        v-model="form.description"
                        :placeholder="t('modal.registerIntervention.descriptionPlaceholder')"
                        rows="3"
                        class="rounded-none text-xs resize-none bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                    />
                </div>

                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.registerIntervention.remarksOptional") }}
                    </Label>
                    <Textarea
                        v-model="form.remarks"
                        :placeholder="t('modal.registerIntervention.remarksPlaceholder')"
                        rows="2"
                        class="rounded-none text-xs resize-none bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                    />
                </div>

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
                            {{ t("modal.registerIntervention.cancel") }}
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
                            {{ t("modal.registerIntervention.submit") }}
                        </Button>
                    </div>
                </div>
            </form>
        </DialogContent>
    </Dialog>
</template>
