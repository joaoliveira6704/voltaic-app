<script setup>
import { PencilIcon, Trash2Icon } from "lucide-vue-next";

defineEmits(["edit", "delete"]);
</script>

<template>
    <div class="flex">
        <Button
            variant="ghost"
            class="hover:text-blue-500"
            size="sm"
            @click="$emit('edit')"
        >
            <PencilIcon />
        </Button>
        <Button
            variant="ghost"
            class="hover:text-red-500"
            size="sm"
            @click="$emit('delete')"
        >
            <Trash2Icon />
        </Button>
    </div>
</template>
