<script setup>
import { ref, watch } from "vue";
import { Loader, X, Building2, Fingerprint } from "lucide-vue-next";
import { useCompanyStore } from "~/stores/company";

const { t } = useI18n();
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const props = defineProps({
    isOpen: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "created"]);

const companyStore = useCompanyStore();
const isSubmitting = ref(false);
const errors = ref([]);

const form = ref({
    name: "",
    companyId: "",
});

// Logic to generate the ID
const generateId = () => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CMP-${randomStr}`;
};

const resetForm = () => {
    form.value = {
        name: "",
        companyId: generateId(), // ID is set here on reset
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
    if (!form.value.name.trim()) errs.push(t("modal.addCompany.errors.requiredName"));
    // Ensure the generated ID didn't somehow get cleared
    if (!form.value.companyId.trim())
        errs.push(t("modal.addCompany.errors.missingId"));
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
        const newCompany = await companyStore.createCompany({ ...form.value });
        emit("created", newCompany);
        emit("close");
    } catch (e) {
        errors.value = [e?.data?.message || t("modal.addCompany.errors.failedCreate")];
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
            <DialogHeader
                class="flex flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-[#232323] space-y-0"
            >
                <DialogTitle
                    class="text-xs font-semibold text-neutral-800 dark:text-white/80 uppercase"
                >
                    {{ t("modal.addCompany.title") }}
                </DialogTitle>
            </DialogHeader>

            <form
                class="px-5 py-6 flex flex-col gap-5"
                @submit.prevent="handleCreate"
            >
                <!-- Generated ID (Read Only or Disabled to show it's auto-gen) -->
                <div class="flex flex-col gap-1.5 opacity-80">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.addCompany.systemGeneratedId") }}
                    </Label>
                    <div class="relative">
                        <Fingerprint
                            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500"
                        />
                        <Input
                            v-model="form.companyId"
                            type="text"
                            readonly
                            class="h-8 pl-8 rounded-none text-xs bg-neutral-100 dark:bg-[#121212] dark:border-[#232323] cursor-not-allowed font-mono text-neutral-500"
                        />
                    </div>
                </div>

                <!-- Company Name -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.addCompany.companyName") }}
                    </Label>
                    <div class="relative">
                        <Building2
                            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400"
                        />
                        <Input
                            v-model="form.name"
                            type="text"
                            :placeholder="t('modal.addCompany.companyNamePlaceholder')"
                            class="h-8 pl-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323]"
                        />
                    </div>
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
                    class="flex items-center justify-end pt-4 border-t border-neutral-100 dark:border-[#232323]"
                >
                    <div class="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="h-7 text-[11px] uppercase rounded-none dark:border-white/10 dark:text-white/40"
                            @click="handleClose"
                        >
                            {{ t("modal.addCompany.cancel") }}
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            :disabled="isSubmitting"
                            class="min-w-[80px] h-7 text-[11px] uppercase rounded-none dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                            <Loader
                                v-if="isSubmitting"
                                class="w-3 h-3 animate-spin mr-2"
                            />
                            {{ t("modal.addCompany.create") }}
                        </Button>
                    </div>
                </div>
            </form>
        </DialogContent>
    </Dialog>
</template>
