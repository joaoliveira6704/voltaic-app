<script setup lang="ts">
import { PencilIcon, Trash2Icon } from "lucide-vue-next";

interface Props {
    type: string;
}

const props = defineProps<Props>();

defineEmits(["edit", "delete"]);
</script>

<template>
    <div class="flex">
        <Button
            v-if="props.type !== 'tickets'"
            variant="ghost"
            class="hover:text-blue-500"
            size="sm"
            @click.stop="$emit('edit')"
        >
            <PencilIcon />
        </Button>
        <Button
            variant="ghost"
            class="hover:text-red-500"
            size="sm"
            @click.stop="$emit('delete')"
        >
            <Trash2Icon />
        </Button>
    </div>
</template>
