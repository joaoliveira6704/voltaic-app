<script setup>
import { ref, computed, watch } from "vue";
import { Eye, EyeClosed } from "lucide-vue-next";

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

import { useUserStore } from "~/stores/user";

const props = defineProps({
    isOpen: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const userStore = useUserStore();
const user = computed(() => userStore.currentUser);

const { t } = useI18n();

const isSubmitting = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const errors = ref([]);

const form = ref({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
});

watch(
    () => props.isOpen,
    (val) => {
        if (val && user.value) {
            form.value.firstName = user.value.firstName || "";
            form.value.lastName = user.value.lastName || "";
            form.value.username = user.value.username || "";
            form.value.email = user.value.email || "";
            form.value.currentPassword = "";
            form.value.newPassword = "";
            errors.value = [];
        }
    },
);

const originalData = computed(() => ({
    firstName: user.value?.firstName || "",
    lastName: user.value?.lastName || "",
    username: user.value?.username || "",
    email: user.value?.email || "",
}));

const changedFields = computed(() => {
    const changes = {};
    const f = form.value;
    if (f.firstName !== originalData.value.firstName)
        changes.firstName = f.firstName;
    if (f.lastName !== originalData.value.lastName)
        changes.lastName = f.lastName;
    if (f.username !== originalData.value.username)
        changes.username = f.username;
    if (f.email !== originalData.value.email) changes.email = f.email;
    if (f.newPassword && f.currentPassword) {
        changes.currentPassword = f.currentPassword;
        changes.newPassword = f.newPassword;
    }
    return changes;
});

const hasChanges = computed(() => Object.keys(changedFields.value).length > 0);

const validate = () => {
    const errs = [];
    const f = form.value;
    if (f.newPassword && !f.currentPassword)
        errs.push(t("modal.editProfile.errors.currentPasswordRequired"));
    if (f.newPassword && f.newPassword.length < 8)
        errs.push(t("modal.editProfile.errors.passwordTooShort"));
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errs.push(t("modal.editProfile.errors.invalidEmail"));
    return errs;
};

const handleSave = async () => {
    errors.value = [];
    if (!hasChanges.value) {
        emit("close");
        return;
    }

    const validationErrors = validate();
    if (validationErrors.length) {
        errors.value = validationErrors;
        return;
    }

    isSubmitting.value = true;
    try {
        await userStore.editUserProfile(changedFields.value);
        emit("close");
    } catch (e) {
        const message =
            e?.data?.message ||
            e?.data?.error ||
            "Something went wrong. Please try again.";
        errors.value = Array.isArray(message) ? message : [message];
    } finally {
        isSubmitting.value = false;
    }
};

const dismissError = (index) => errors.value.splice(index, 1);
const handleClose = () => emit("close");

// Sync shadcn Dialog's own open state back to parent
const handleOpenChange = (open) => {
    if (!open) handleClose();
};
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
                    {{ t("modal.editProfile.title") }}
                </DialogTitle>
                <!-- shadcn DialogContent renders its own close button by default -->
            </DialogHeader>

            <!-- Form -->
            <form
                class="px-5 py-5 flex flex-col gap-4"
                @submit.prevent="handleSave"
            >
                <!-- Name row -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                        <Label class="text-[10px] text-neutral-400 uppercase">
                            {{ t("modal.editProfile.firstName") }}
                        </Label>
                        <Input
                            v-model="form.firstName"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717]"
                            :placeholder="user?.firstName || t('modal.editProfile.firstNamePlaceholder')"
                            autocomplete="given-name"
                        />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <Label class="text-[10px] text-neutral-400 uppercase">
                            {{ t("modal.editProfile.lastName") }}
                        </Label>
                        <Input
                            v-model="form.lastName"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717]"
                            :placeholder="user?.lastName || t('modal.editProfile.lastNamePlaceholder')"
                            autocomplete="family-name"
                        />
                    </div>
                </div>

                <!-- Username -->
                <div class="flex flex-col gap-1.5">
                    <Label class="text-[10px] text-neutral-400 uppercase">
                        {{ t("modal.editProfile.username") }}
                    </Label>
                    <div class="relative">
                        <span
                            class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none select-none"
                            >@</span
                        >
                        <Input
                            v-model="form.username"
                            type="text"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] pl-6"
                            :placeholder="user?.username || t('modal.editProfile.usernamePlaceholder')"
                            autocomplete="username"
                        />
                    </div>
                </div>

                <!-- Email -->
                <div class="flex flex-col gap-1.5">
                    <Label class="text-[10px] text-neutral-400 uppercase">
                        {{ t("modal.editProfile.email") }}
                    </Label>
                    <Input
                        v-model="form.email"
                        type="email"
                        class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717]"
                        :placeholder="user?.email || t('modal.editProfile.emailPlaceholder')"
                        autocomplete="email"
                    />
                </div>

                <!-- Section divider -->
                <div class="flex items-center gap-3">
                    <Separator class="flex-1" />
                    <span
                        class="text-[10px] text-neutral-300 uppercase whitespace-nowrap"
                    >
                        {{ t("modal.editProfile.passwordSection") }}
                    </span>
                    <Separator class="flex-1" />
                </div>

                <!-- Current password -->
                <div class="flex flex-col gap-1.5">
                    <Label class="text-[10px] text-neutral-400 uppercase">
                        {{ t("modal.editProfile.currentPassword") }}
                    </Label>
                    <div class="relative">
                        <Input
                            v-model="form.currentPassword"
                            :type="showCurrentPassword ? 'text' : 'password'"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] pr-9"
                            placeholder="••••••••"
                            autocomplete="current-password"
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                            @click="showCurrentPassword = !showCurrentPassword"
                            :aria-label="showCurrentPassword ? t('modal.editProfile.hidePassword') : t('modal.editProfile.showPassword')"
                        >
                            <Eye class="w-4 h-4" v-if="!showCurrentPassword" />
                            <EyeClosed class="w-4 h-4" v-else />
                        </button>
                    </div>
                </div>

                <!-- New password -->
                <div class="flex flex-col gap-1.5">
                    <Label class="text-[10px] text-neutral-400 uppercase">
                        {{ t("modal.editProfile.newPassword") }}
                    </Label>
                    <div class="relative">
                        <Input
                            v-model="form.newPassword"
                            :type="showNewPassword ? 'text' : 'password'"
                            class="h-8 rounded-none text-xs bg-neutral-50 dark:bg-[#171717] pr-9"
                            placeholder="••••••••"
                            autocomplete="new-password"
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                            @click="showNewPassword = !showNewPassword"
                            :aria-label="showNewPassword ? t('modal.editProfile.hidePassword') : t('modal.editProfile.showPassword')"
                        >
                            <Eye class="w-4 h-4" v-if="!showNewPassword" />
                            <EyeClosed class="w-4 h-4" v-else />
                        </button>
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
                            :aria-label="t('modal.editProfile.dismiss')"
                        >
                            <svg
                                width="9"
                                height="9"
                                viewBox="0 0 14 14"
                                fill="none"
                            >
                                <path
                                    d="M1 1L13 13M13 1L1 13"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </button>
                    </li>
                </TransitionGroup>

                <!-- Footer -->
                <div
                    class="flex items-center justify-between pt-3 mt-1 border-t border-neutral-100 dark:border-[#232323]"
                >
                    <span
                        class="text-[10px] tracking-wide"
                        :class="
                            hasChanges ? 'text-neutral-500' : 'text-neutral-300'
                        "
                    >
                        {{
                            hasChanges
                                ? Object.keys(changedFields).length === 1
                                    ? t("modal.editProfile.fieldsModified", { n: Object.keys(changedFields).length })
                                    : t("modal.editProfile.fieldsModifiedPlural", { n: Object.keys(changedFields).length })
                                : t("modal.editProfile.noChanges")
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
                            {{ t("modal.editProfile.cancel") }}
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            :disabled="isSubmitting || !hasChanges"
                            class="min-w-[64px] h-7 px-4 text-[11px] uppercase rounded-none dark:bg-green-700 dark:hover:bg-green-600"
                            :variant="hasChanges ? 'default' : 'ghost'"
                        >
                            <span
                                v-if="isSubmitting"
                                class="inline-block w-3 h-3 border border-neutral-400 border-t-neutral-700 rounded-full animate-spin"
                            />
                            <span v-else>{{
                                t("modal.editProfile.save")
                            }}</span>
                        </Button>
                    </div>
                </div>
            </form>
        </DialogContent>
    </Dialog>
</template>
