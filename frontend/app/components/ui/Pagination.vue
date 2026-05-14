<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next";
import { Button } from "~/components/ui/button";

const props = defineProps<{
    currentPage: number;
    totalPages: number;
}>();

const emit = defineEmits<{
    (e: "update:page", page: number): void;
}>();

function goToPage(page: number) {
    if (page < 1 || page > props.totalPages) return;
    emit("update:page", page);
}

const pages = computed(() => {
    const p: number[] = [];
    const total = props.totalPages;
    const current = props.currentPage;

    if (total <= 5) {
        for (let i = 1; i <= total; i++) p.push(i);
    } else {
        p.push(1);
        if (current > 3) p.push(-1);
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) p.push(i);
        if (current < total - 2) p.push(-2);
        p.push(total);
    }
    return p;
});
</script>

<template>
    <div
        v-if="totalPages > 1"
        class="flex items-center justify-center gap-1 pt-4"
    >
        <Button
            variant="outline"
            size="icon-sm"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
        >
            <ChevronLeftIcon class="h-4 w-4" />
        </Button>

        <template v-for="p in pages" :key="p">
            <span
                v-if="p < 0"
                class="px-1 text-xs text-muted-foreground"
            >...</span>
            <Button
                v-else
                :variant="p === currentPage ? 'default' : 'outline'"
                size="icon-sm"
                @click="goToPage(p)"
            >
                {{ p }}
            </Button>
        </template>

        <Button
            variant="outline"
            size="icon-sm"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
        >
            <ChevronRightIcon class="h-4 w-4" />
        </Button>
    </div>
</template>
