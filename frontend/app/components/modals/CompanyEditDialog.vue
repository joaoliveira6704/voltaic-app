<script setup lang="ts">
import { X, Plus, Minus, Building2 } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface Group {
  groupId: string;
  name: string;
}

interface Company {
  companyId: string;
  name: string;
  groups: string[];
}

const props = defineProps<{
  isOpen: boolean;
  company: Company | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const apiBase = () => useRuntimeConfig().public.apiBaseUrl;
const token = () => useCookie("token").value;

const assigned = ref<Group[]>([]);
const unassigned = ref<Group[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);

// Track staged changes
const toAssign = ref<string[]>([]);
const toUnassign = ref<string[]>([]);

async function fetchGroups() {
  if (!props.company) return;
  isLoading.value = true;
  try {
    const data = await $fetch<{ assigned: Group[]; unassigned: Group[] }>(
      `${apiBase()}/api/companies/${props.company.companyId}/groups`,
      { headers: { Authorization: `Bearer ${token()}` } },
    );
    assigned.value = [...data.assigned];
    unassigned.value = [...data.unassigned];
  } catch (e) {
    console.error("Failed to fetch groups:", e);
  } finally {
    isLoading.value = false;
  }
}

function stageAssign(group: Group) {
  unassigned.value = unassigned.value.filter(
    (g) => g.groupId !== group.groupId,
  );
  assigned.value.push(group);
  if (toUnassign.value.includes(group.groupId)) {
    toUnassign.value = toUnassign.value.filter((id) => id !== group.groupId);
  } else {
    toAssign.value.push(group.groupId);
  }
}

function stageUnassign(group: Group) {
  assigned.value = assigned.value.filter((g) => g.groupId !== group.groupId);
  unassigned.value.push(group);
  if (toAssign.value.includes(group.groupId)) {
    toAssign.value = toAssign.value.filter((id) => id !== group.groupId);
  } else {
    toUnassign.value.push(group.groupId);
  }
}

async function saveChanges() {
  if (!props.company) return;
  isSaving.value = true;
  try {
    await Promise.all([
      ...toAssign.value.map((groupId) =>
        $fetch(
          `${apiBase()}/api/companies/${props.company!.companyId}/groups/assign`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token()}` },
            body: { groupId },
          },
        ),
      ),
      ...toUnassign.value.map((groupId) =>
        $fetch(
          `${apiBase()}/api/companies/${props.company!.companyId}/groups/unassign`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token()}` },
            body: { groupId },
          },
        ),
      ),
    ]);
    emit("saved");
    handleClose();
  } catch (e) {
    console.error("Failed to save group changes:", e);
  } finally {
    isSaving.value = false;
  }
}

function handleClose() {
  toAssign.value = [];
  toUnassign.value = [];
  assigned.value = [];
  unassigned.value = [];
  emit("close");
}

const hasChanges = computed(
  () => toAssign.value.length > 0 || toUnassign.value.length > 0,
);

watch(
  () => props.isOpen,
  (val) => {
    if (val) fetchGroups();
  },
);
</script>

<template>
  <Dialog :open="isOpen" @update:open="(v) => !v && handleClose()">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle
          class="text-lg font-bold leading-tight pr-8 flex items-center gap-2"
        >
          <Building2 class="w-4 h-4 text-gray-400" />
          {{ company?.name }}
        </DialogTitle>
        <DialogClose
          class="absolute top-4 right-4 p-0.5 transition-colors rounded-md hover:bg-secondary"
          @click="handleClose"
        >
          <X class="w-4 h-4" />
        </DialogClose>
      </DialogHeader>

      <template v-if="company">
        <p class="text-xs text-gray-500 uppercase font-semibold tracking-wide">
          Group Assignment
        </p>

        <div
          v-if="isLoading"
          class="flex items-center justify-center py-12 text-sm text-gray-400"
        >
          Loading groups...
        </div>

        <div v-else class="grid grid-cols-2 gap-4">
          <!-- Assigned -->
          <div class="space-y-2">
            <p class="text-xs font-bold uppercase text-gray-500 tracking-wide">
              Assigned
              <span class="text-[#00c885]">({{ assigned.length }})</span>
            </p>
            <div
              class="min-h-[200px] rounded-lg border border-gray-100 dark:border-[#2a2a2a] p-2 space-y-1"
            >
              <div
                v-if="assigned.length === 0"
                class="flex items-center justify-center h-full py-8 text-xs text-gray-300 dark:text-white/20"
              >
                No groups assigned
              </div>
              <div
                v-for="group in assigned"
                :key="group.groupId"
                class="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 dark:bg-[#1a1a1a] group/item"
              >
                <span
                  class="text-sm font-medium text-gray-800 dark:text-white/80"
                  >{{ group.name }}</span
                >
                <button
                  class="text-gray-300 hover:text-red-400 transition-colors"
                  @click="stageUnassign(group)"
                >
                  <Minus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Unassigned -->
          <div class="space-y-2">
            <p class="text-xs font-bold uppercase text-gray-500 tracking-wide">
              Available
              <span class="text-gray-400">({{ unassigned.length }})</span>
            </p>
            <div
              class="min-h-[200px] rounded-lg border border-gray-100 dark:border-[#2a2a2a] p-2 space-y-1"
            >
              <div
                v-if="unassigned.length === 0"
                class="flex items-center justify-center h-full py-8 text-xs text-gray-300 dark:text-white/20"
              >
                No available groups
              </div>
              <div
                v-for="group in unassigned"
                :key="group.groupId"
                class="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 dark:bg-[#1a1a1a]"
              >
                <span
                  class="text-sm font-medium text-gray-800 dark:text-white/80"
                  >{{ group.name }}</span
                >
                <button
                  class="text-gray-300 hover:text-[#00c885] transition-colors"
                  @click="stageAssign(group)"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

        <div class="flex justify-end gap-2">
          <Button
            variant="outline"
            class="text-xs uppercase h-9"
            @click="handleClose"
          >
            Cancel
          </Button>
          <Button
            :disabled="!hasChanges || isSaving"
            class="text-xs uppercase h-9 bg-[#007bff] hover:bg-[#0069d9] transition-all"
            @click="saveChanges"
          >
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </Button>
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>
