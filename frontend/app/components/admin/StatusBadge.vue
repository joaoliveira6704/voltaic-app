<script setup>
import { ChevronDownIcon } from "lucide-vue-next";
import { UserRoles, TicketStates, colorMap } from "@/utils/constants";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";

const props = defineProps({
    value: String,
    userId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        validator: (v) => ["users", "tickets"].includes(v),
    },
});

const emit = defineEmits(["update:value"]);

const { t } = useI18n();

const options = computed(() => {
    if (props.type === "users") return UserRoles;
    if (props.type === "tickets") return TicketStates;
    return [];
});

const activeData = computed(() => {
    return options.value.find((o) => o.key === props.value) ?? null;
});

const displayClass = computed(() => {
    if (!activeData.value) return "bg-muted text-muted-foreground";
    if (props.type === "users") {
        return colorMap[activeData.value.color] ?? "bg-muted";
    }
    return activeData.value.color;
});

function getLabel(option) {
    if (props.type === "users") {
        return t(`modal.addUser.roles.${option.key}`);
    }
    return option.label;
}

function getItemClass(option) {
    if (props.type === "users") {
        return colorMap[option.color] ?? "bg-muted text-muted-foreground";
    }
    return option.color;
}

function handleChange(val) {
    emit("update:value", { userId: props.userId, role: val });
}
</script>

<template>
    <Select :value="props.value" @update:model-value="handleChange">
        <SelectTrigger
            class="w-fit h-auto p-0 border-0 shadow-none focus:ring-0 focus:ring-offset-0 bg-transparent [&>svg]:hidden"
        >
            <div
                class="text-xs uppercase px-2 py-0.5 rounded flex items-center gap-1 w-fit border dark:border-[#232323] cursor-pointer"
                :class="displayClass"
            >
                {{ activeData ? getLabel(activeData) : (props.value ?? "—") }}
                <ChevronDownIcon class="w-3 h-3 opacity-60 shrink-0" />
            </div>
        </SelectTrigger>

        <SelectContent>
            <SelectItem
                v-for="option in options"
                :key="option.key"
                :value="option.key"
            >
                <div
                    class="text-xs uppercase px-2 py-0.5 rounded w-fit"
                    :class="getItemClass(option)"
                >
                    {{ getLabel(option) }}
                </div>
            </SelectItem>
        </SelectContent>
    </Select>
</template>
s