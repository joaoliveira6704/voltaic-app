<script setup>
import { ChevronDownIcon } from "lucide-vue-next";
import { UserRoles, colorMap } from "@/utils/constants";

const props = defineProps({ value: String, type: String });
const { t } = useI18n();

const role = computed(() => {
    switch (props.type) {
        case "users":
            return UserRoles.find((r) => r.key === props.value) ?? null;
        default:
            return null;
    }
});
const badgeClass = computed(() => colorMap[role.value?.color] ?? "bg-muted");
watchEffect(() => {
    console.log(
        "value:",
        props.value,
        "role:",
        role.value,
        "class:",
        badgeClass.value,
    );
});
</script>

<template>
    <div
        class="font-mono text-xs uppercase tracking-tight px-2 py-0.5 rounded flex items-center w-fit"
        :class="badgeClass"
    >
        {{ role ? t(`modal.addUser.roles.${role.key}`) : (props.value ?? "—") }}
    </div>
</template>
