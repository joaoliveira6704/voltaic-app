<script setup>
import { ref, watch } from "vue";
import { Eye, EyeOff, Loader, X } from "lucide-vue-next";
import { useUserStore } from "~/stores/user";

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
import { Checkbox } from "@/components/ui/checkbox";
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

const userStore = useUserStore();
const { t } = useI18n();

const isSubmitting = ref(false);
const showPassword = ref(false);
const errors = ref([]);

const form = ref({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "",
    password: "",
    sendWelcomeEmail: true,
});

const resetForm = () => {
    form.value = {
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        role: "",
        password: "",
        sendWelcomeEmail: true,
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
    if (!f.firstName.trim())
        errs.push(t("modal.addUser.errors.firstNameRequired"));
    if (!f.lastName.trim())
        errs.push(t("modal.addUser.errors.lastNameRequired"));
    if (!f.username.trim())
        errs.push(t("modal.addUser.errors.usernameRequired"));
    if (!f.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errs.push(t("modal.addUser.errors.invalidEmail"));
    if (!f.role) errs.push(t("modal.addUser.errors.roleRequired"));
    if (!f.password || f.password.length < 8)
        errs.push(t("modal.addUser.errors.passwordTooShort"));
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
        const newUser = await userStore.createUser(form.value);
        emit("created", newUser);
        emit("close");
    } catch (e) {
        console.log(e);
        const message = e.details;
        if (Array.isArray(message)) {
            errors.value = message;
        } else if (message && typeof message === "object") {
            errors.value = Object.values(message);
        } else if (typeof message === "string") {
            errors.value = [message];
        } else {
            errors.value = [t("modal.addUser.errors.unknown")];
        }
    } finally {
        isSubmitting.value = false;
    }
};

const dismissError = (index) => errors.value.splice(index, 1);
const handleClose = () => emit("close");
const handleOpenChange = (open) => {
    if (!open) handleClose();
};
</script>

<template>
    <Dialog :open="isOpen" @update:open="handleOpenChange">
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
                    {{ t("modal.addUser.title") }}
                </DialogTitle>
            </DialogHeader>

            <!-- Form -->
            <form
                class="px-5 py-5 flex flex-col gap-4"
                @submit.prevent="handleCreate"
            >
                <!-- Name row -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                        <Label
                            class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                        >
                            {{ t("modal.addUser.firstName") }}
                        </Label>
                        <Input
                            v-model="form.firstName"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323] dark:text-white/80 dark:placeholder-white/30"
                            :placeholder="t('modal.addUser.firstNamePlaceholder')"
                            autocomplete="given-name"
                        />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <Label
                            class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                        >
                            {{ t("modal.addUser.lastName") }}
                        </Label>
                        <Input
                            v-model="form.lastName"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323] dark:text-white/80 dark:placeholder-white/30"
                            :placeholder="t('modal.addUser.lastNamePlaceholder')"
                            autocomplete="family-name"
                        />
                    </div>
                </div>

                <!-- Username -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.addUser.username") }}
                    </Label>
                    <div class="relative">
                        <span
                            class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 dark:text-white/30 pointer-events-none select-none"
                            >@</span
                        >
                        <Input
                            v-model="form.username"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323] dark:text-white/80 dark:placeholder-white/30 pl-6"
                            :placeholder="t('modal.addUser.usernamePlaceholder')"
                            autocomplete="username"
                        />
                    </div>
                </div>

                <!-- Email -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.addUser.email") }}
                    </Label>
                    <Input
                        v-model="form.email"
                        type="email"
                        class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323] dark:text-white/80 dark:placeholder-white/30"
                        :placeholder="t('modal.addUser.emailPlaceholder')"
                        autocomplete="email"
                    />
                </div>

                <!-- Role -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.addUser.role") }}
                    </Label>
                    <Select v-model="form.role">
                        <SelectTrigger
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323] dark:text-white/80"
                        >
                            <SelectValue
                                :placeholder="
                                    t('modal.addUser.rolePlaceholder')
                                "
                                class="dark:text-white/30"
                            />
                        </SelectTrigger>
                        <SelectContent
                            class="rounded-none dark:bg-[#171717] dark:border-[#232323]"
                        >
                            <SelectItem
                                value="admin"
                                class="text-xs dark:text-white/80 dark:focus:bg-[#232323]"
                            >
                                {{ t("modal.addUser.roles.admin") }}
                            </SelectItem>
                            <SelectItem
                                value="client"
                                class="text-xs dark:text-white/80 dark:focus:bg-[#232323]"
                            >
                                {{ t("modal.addUser.roles.client") }}
                            </SelectItem>
                            <SelectItem
                                value="worker"
                                class="text-xs dark:text-white/80 dark:focus:bg-[#232323]"
                            >
                                {{ t("modal.addUser.roles.worker") }}
                            </SelectItem>
                            <SelectItem
                                value="company-manager"
                                class="text-xs dark:text-white/80 dark:focus:bg-[#232323]"
                            >
                                {{ t("modal.addUser.roles.company-manager") }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Password section divider -->
                <div class="flex items-center gap-3">
                    <Separator class="flex-1 dark:bg-white/10" />
                    <span
                        class="text-[10px] text-neutral-300 dark:text-white/20 uppercase whitespace-nowrap"
                    >
                        {{ t("modal.addUser.passwordSection") }}
                    </span>
                    <Separator class="flex-1 dark:bg-white/10" />
                </div>

                <!-- Password -->
                <div class="flex flex-col gap-1.5">
                    <Label
                        class="text-[10px] text-neutral-400 dark:text-white/40 uppercase"
                    >
                        {{ t("modal.addUser.password") }}
                    </Label>
                    <div class="relative">
                        <Input
                            v-model="form.password"
                            :type="showPassword ? 'text' : 'password'"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] dark:border-[#232323] dark:text-white/80 dark:placeholder-white/30 pr-9"
                            placeholder="••••••••"
                            autocomplete="new-password"
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white/80 transition-colors"
                            @click="showPassword = !showPassword"
                            :aria-label="showPassword ? t('modal.addUser.hidePassword') : t('modal.addUser.showPassword')"
                        >
                            <Eye v-if="!showPassword" class="w-3.5 h-3.5" />
                            <EyeOff v-else class="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <!-- Send welcome email -->
                <label
                    class="flex items-center gap-2.5 cursor-pointer select-none"
                >
                    <Checkbox
                        :checked="form.sendWelcomeEmail"
                        class="rounded-none dark:border-[#232323] dark:data-[state=checked]:bg-green-700 dark:data-[state=checked]:border-green-700"
                        @update:checked="form.sendWelcomeEmail = $event"
                    />
                    <span
                        class="text-[11px] tracking-wide text-neutral-500 dark:text-white/50"
                    >
                        {{ t("modal.addUser.sendWelcomeEmail") }}
                    </span>
                </label>

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
                        class="flex items-start justify-between gap-2 border border-red-200 bg-red-50 px-3 py-2"
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
                            :aria-label="t('modal.addUser.dismiss')"
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
                        class="text-[10px] tracking-wide text-neutral-300 dark:text-white/20"
                    >
                        {{ t("modal.addUser.allFieldsRequired") }}
                    </span>
                    <div class="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="px-4 h-7 text-[11px] uppercase rounded-none dark:border-red-500 dark:text-red-500 dark:hover:border-red-400 dark:hover:bg-red-800 dark:hover:text-white"
                            @click="handleClose"
                        >
                            {{ t("modal.addUser.cancel") }}
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
                            <span v-else>{{ t("modal.addUser.create") }}</span>
                        </Button>
                    </div>
                </div>
            </form>
        </DialogContent>
    </Dialog>
</template>
