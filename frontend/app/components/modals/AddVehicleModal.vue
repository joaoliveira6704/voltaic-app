<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useVehicleStore } from "~/stores/vehicle";
import { useUserStore } from "~/stores/user";

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
  console.log(q, vehicleStore.vehicles);
  if (!q) return vehicleStore.vehicles.slice(0, 20);
  return vehicleStore.vehicles
    .filter((v: any) => {
      const label = `${v.make?.name} ${v.model?.name} ${v.year}`.toLowerCase();
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
const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) handleClose();
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
          aria-labelledby="add-vehicle-modal-title"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-neutral-200"
          >
            <h2
              id="add-vehicle-modal-title"
              class="font-mono text-xs font-semibold tracking-widest text-neutral-800 uppercase"
            >
              {{ t("modal.addVehicle.title") }}
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
            <!-- Vehicle search / selector -->
            <div class="flex flex-col gap-1.5">
              <label
                class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
              >
                {{ t("modal.addVehicle.vehicleLabel") }}
              </label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors"
                  :placeholder="t('modal.addVehicle.searchPlaceholder')"
                  autocomplete="off"
                  @input="handleSearchInput"
                  @focus="isDropdownOpen = true"
                />
                <!-- Loading indicator -->
                <span
                  v-if="vehicleStore.isLoading"
                  class="absolute right-3 top-1/2 -translate-y-1/2 inline-block w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"
                />
                <!-- Clear / check icon -->
                <template v-else-if="searchQuery">
                  <svg
                    v-if="selectedCatalogVehicle"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2 7L6 11L12 3"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <button
                    v-else
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                    @click="resetForm"
                    aria-label="Clear"
                  >
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M1 1L13 13M13 1L1 13"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
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
                    class="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-neutral-200 shadow-md max-h-52 overflow-y-auto"
                  >
                    <li
                      v-for="v in filteredVehicles"
                      :key="v._id"
                      class="px-3 py-2 font-mono text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer flex items-center justify-between gap-2 border-b border-neutral-100 last:border-b-0"
                      @mousedown.prevent="selectVehicle(v)"
                    >
                      <span>{{ vehicleLabel(v) }}</span>
                      <span
                        class="text-[10px] text-neutral-300 uppercase tracking-widest shrink-0"
                      >
                        {{ v.charge_ports?.[0]?.connector ?? "—" }}
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
                    class="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-neutral-200 shadow-md"
                  >
                    <p
                      class="px-3 py-2.5 font-mono text-[10px] text-neutral-400 tracking-wide"
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
                <div class="flex-1 h-px bg-neutral-100" />
                <span
                  class="font-mono text-[10px] tracking-widest text-neutral-300 uppercase whitespace-nowrap"
                >
                  {{ t("modal.addVehicle.autoPopulated") }}
                </span>
                <div class="flex-1 h-px bg-neutral-100" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <!-- Model (read-only) -->
                <div class="flex flex-col gap-1.5">
                  <label
                    class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                    >{{ t("modal.addVehicle.model") }}</label
                  >
                  <input
                    :value="form.model"
                    type="text"
                    readonly
                    class="w-full border border-neutral-100 bg-neutral-50/50 px-3 py-2 font-mono text-xs text-neutral-400 outline-none cursor-default select-none"
                    placeholder="—"
                  />
                </div>

                <!-- Connector (read-only) -->
                <div class="flex flex-col gap-1.5">
                  <label
                    class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                    >{{ t("modal.addVehicle.connector") }}</label
                  >
                  <input
                    :value="form.connector"
                    type="text"
                    readonly
                    class="w-full border border-neutral-100 bg-neutral-50/50 px-3 py-2 font-mono text-xs text-neutral-400 outline-none cursor-default select-none uppercase"
                    placeholder="—"
                  />
                </div>
              </div>

              <!-- Slug (read-only) -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                  >{{ t("modal.addVehicle.slug") }}</label
                >
                <input
                  :value="form.slug"
                  type="text"
                  readonly
                  class="w-full border border-neutral-100 bg-neutral-50/50 px-3 py-2 font-mono text-xs text-neutral-400 outline-none cursor-default select-none"
                  placeholder="—"
                />
              </div>
            </div>

            <!-- Manual fields -->
            <div class="flex items-center gap-3">
              <div class="flex-1 h-px bg-neutral-100" />
              <span
                class="font-mono text-[10px] tracking-widest text-neutral-300 uppercase whitespace-nowrap"
              >
                {{ t("modal.addVehicle.yourDetails") }}
              </span>
              <div class="flex-1 h-px bg-neutral-100" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <!-- Plate -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                  >{{ t("modal.addVehicle.plate") }}</label
                >
                <input
                  v-model="form.plate"
                  type="text"
                  class="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors uppercase"
                  :placeholder="t('modal.addVehicle.platePlaceholder')"
                  autocomplete="off"
                />
              </div>

              <!-- Color -->
              <div class="flex flex-col gap-1.5">
                <label
                  class="font-mono text-[10px] tracking-widest text-neutral-400 uppercase"
                  >{{ t("modal.addVehicle.color") }}</label
                >
                <input
                  v-model="form.color"
                  type="text"
                  class="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 placeholder-neutral-300 outline-none focus:border-neutral-400 transition-colors"
                  :placeholder="t('modal.addVehicle.colorPlaceholder')"
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
                class="font-mono text-[10px] tracking-wide text-neutral-300"
              >
                {{
                  selectedCatalogVehicle
                    ? vehicleLabel(selectedCatalogVehicle)
                    : t("modal.addVehicle.noVehicleSelected")
                }}
              </span>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-4 py-1.5 font-mono text-[11px] tracking-widest uppercase border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 transition-colors"
                  @click="handleClose"
                >
                  {{ t("modal.addVehicle.cancel") }}
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="flex items-center justify-center min-w-[64px] px-4 py-1.5 font-mono text-[11px] tracking-widest uppercase border transition-colors"
                  :class="
                    !isSubmitting
                      ? 'bg-neutral-800 border-neutral-800 text-white hover:bg-neutral-900 hover:border-neutral-900'
                      : 'bg-neutral-100 border-neutral-100 text-neutral-300 cursor-not-allowed'
                  "
                >
                  <span
                    v-if="isSubmitting"
                    class="inline-block w-3 h-3 border border-neutral-400 border-t-neutral-700 rounded-full animate-spin"
                  />
                  <span v-else>{{ t("modal.addVehicle.add") }} </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
