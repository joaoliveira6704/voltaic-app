<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  user: { type: Object, default: null },
});

const emit = defineEmits(["close", "updated"]);

const config = useRuntimeConfig();

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
    if (val && props.user) {
      form.value.firstName = props.user.firstName || "";
      form.value.lastName = props.user.lastName || "";
      form.value.username = props.user.username || "";
      form.value.email = props.user.email || "";
      form.value.currentPassword = "";
      form.value.newPassword = "";
      errors.value = [];
    }
  },
);

const originalData = computed(() => ({
  firstName: props.user?.firstName || "",
  lastName: props.user?.lastName || "",
  username: props.user?.username || "",
  email: props.user?.email || "",
}));

const changedFields = computed(() => {
  const changes = {};
  const f = form.value;
  if (f.firstName !== originalData.value.firstName)
    changes.firstName = f.firstName;
  if (f.lastName !== originalData.value.lastName) changes.lastName = f.lastName;
  if (f.username !== originalData.value.username) changes.username = f.username;
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
    errs.push("Current password is required to set a new password.");
  if (f.newPassword && f.newPassword.length < 8)
    errs.push("New password must be at least 8 characters.");
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
    errs.push("Please enter a valid email address.");
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
    const token = useCookie("token").value;
    await $fetch(`${config.public.apiBaseUrl}/api/users/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: changedFields.value,
    });
    emit("updated");
    emit("close");
  } catch (e) {
    const message =
      e?.data?.message ||
      e?.data?.error ||
      "Something went wrong. Please try again.";
    const serverErrors = Array.isArray(message) ? message : [message];
    errors.value = serverErrors;
  } finally {
    isSubmitting.value = false;
  }
};

const dismissError = (index) => errors.value.splice(index, 1);
const handleClose = () => emit("close");
const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) handleClose();
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm p-4"
        @click="handleBackdropClick"
      >
        <div
          class="w-full max-w-md bg-white border border-neutral-200 shadow-lg transition-all duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-neutral-200"
          >
            <h2
              id="modal-title"
              class="font-mono text-xs font-semibold tracking-widest text-neutral-800 uppercase"
            >
              Edit Profile
            </h2>
            <button
              class="flex items-center justify-center w-7 h-7 border border-neutral-200 text-neutral-400 hover:text-neutral-800 hover:border-neutral-400 transition-colors"
              @click="handleClose"
              aria-label="Close"
            >
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form
            class="px-5 py-5 flex flex-col gap-4"
            @submit.prevent="handleSave"
          >
            <!-- Name row -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label
                  class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                  >First name</label
                >
                <input
                  v-model="form.firstName"
                  type="text"
                  class="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors"
                  :placeholder="user?.firstName || 'First name'"
                  autocomplete="given-name"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label
                  class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                  >Last name</label
                >
                <input
                  v-model="form.lastName"
                  type="text"
                  class="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors"
                  :placeholder="user?.lastName || 'Last name'"
                  autocomplete="family-name"
                />
              </div>
            </div>

            <!-- Username -->
            <div class="flex flex-col gap-1.5">
              <label
                class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                >Username</label
              >
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-400 pointer-events-none select-none"
                  >@</span
                >
                <input
                  v-model="form.username"
                  type="text"
                  class="w-full border border-neutral-200 bg-neutral-50 pl-6 pr-3 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors"
                  :placeholder="user?.username || 'username'"
                  autocomplete="username"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label
                class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                >Email</label
              >
              <input
                v-model="form.email"
                type="email"
                class="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors"
                :placeholder="user?.email || 'email@example.com'"
                autocomplete="email"
              />
            </div>

            <!-- Section divider -->
            <div class="flex items-center gap-3">
              <div class="flex-1 h-px bg-neutral-100" />
              <span
                class="font-mono text-[10px] tracking-widest text-neutral-300 uppercase whitespace-nowrap"
                >Password change</span
              >
              <div class="flex-1 h-px bg-neutral-100" />
            </div>

            <!-- Current password -->
            <div class="flex flex-col gap-1.5">
              <label
                class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                >Current password</label
              >
              <div class="relative">
                <input
                  v-model="form.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  class="w-full border border-neutral-200 bg-neutral-50 px-3 pr-9 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  @click="showCurrentPassword = !showCurrentPassword"
                  :aria-label="showCurrentPassword ? 'Hide' : 'Show'"
                >
                  <svg
                    v-if="!showCurrentPassword"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    v-else
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- New password -->
            <div class="flex flex-col gap-1.5">
              <label
                class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                >New password</label
              >
              <div class="relative">
                <input
                  v-model="form.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="w-full border border-neutral-200 bg-neutral-50 px-3 pr-9 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  @click="showNewPassword = !showNewPassword"
                  :aria-label="showNewPassword ? 'Hide' : 'Show'"
                >
                  <svg
                    v-if="!showNewPassword"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    v-else
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
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
                    <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
                    <path
                      d="M6 3.5v3M6 8v.5"
                      stroke="currentColor"
                      stroke-width="1.2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span
                    class="font-mono text-[10px] leading-relaxed tracking-wide text-red-600"
                    >{{ error }}</span
                  >
                </div>
                <button
                  type="button"
                  class="shrink-0 text-red-300 hover:text-red-500 transition-colors mt-px"
                  @click="dismissError(i)"
                  aria-label="Dismiss"
                >
                  <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
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
              class="flex items-center justify-between pt-3 mt-1 border-t border-neutral-100"
            >
              <span
                class="font-mono text-[10px] tracking-wide"
                :class="hasChanges ? 'text-neutral-500' : 'text-neutral-300'"
              >
                {{
                  hasChanges
                    ? `${Object.keys(changedFields).length} field${Object.keys(changedFields).length > 1 ? "s" : ""} modified`
                    : "No changes"
                }}
              </span>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-4 py-1.5 font-mono text-[11px] tracking-widest uppercase border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 transition-colors"
                  @click="handleClose"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting || !hasChanges"
                  class="flex items-center justify-center min-w-[64px] px-4 py-1.5 font-mono text-[11px] tracking-widest uppercase border transition-colors"
                  :class="
                    hasChanges && !isSubmitting
                      ? 'bg-neutral-800 border-neutral-800 text-white hover:bg-neutral-900 hover:border-neutral-900'
                      : 'bg-neutral-100 border-neutral-100 text-neutral-300 cursor-not-allowed'
                  "
                >
                  <span
                    v-if="isSubmitting"
                    class="inline-block w-3 h-3 border border-neutral-400 border-t-neutral-700 rounded-full animate-spin"
                  />
                  <span v-else>Save</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
