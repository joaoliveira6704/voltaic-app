<script setup>
import { ChevronDownIcon } from "lucide-vue-next";
import { UserRoles, TicketStatus, colorMap } from "@/utils/constants";
import { computed, watchEffect } from "vue"; // Ensure these are imported if not auto-imported
import { useI18n } from "vue-i18n";

const props = defineProps({
    value: String,
    type: String,
});

const { t } = useI18n();

// Helper to find the correct data object based on type
const activeData = computed(() => {
    if (props.type === "users") {
        return UserRoles.find((r) => r.key === props.value) ?? null;
    }
    if (props.type === "tickets") {
        // If TicketStatus is an array (per your hint), use .find()
        return TicketStatus.find((s) => s.key === props.value) ?? null;
    }
    return null;
});

// Logic for CSS Classes
const displayClass = computed(() => {
    if (!activeData.value) return "bg-muted text-muted-foreground";

    if (props.type === "users") {
        // Users use the colorMap lookup
        return colorMap[activeData.value.color] ?? "bg-muted";
    }

    // Tickets use the color string directly from the object
    return activeData.value.color;
});

// Logic for Labels
const displayLabel = computed(() => {
    if (!activeData.value) return props.value ?? "—";

    if (props.type === "users") {
        return t(`modal.addUser.roles.${activeData.value.key}`);
    }

    return activeData.value.label;
});

watchEffect(() => {
    console.log(
        `[Badge] Type: ${props.type} | Value: ${props.value} | Class: ${displayClass.value}`,
    );
});
</script>

<template>
    <div
        v-if="activeData || props.value"
        class="font-mono text-xs uppercase tracking-tight px-2 py-0.5 rounded flex items-center w-fit border dark:border-[#232323]"
        :class="displayClass"
    >
        {{ displayLabel }}
    </div>
</template>
