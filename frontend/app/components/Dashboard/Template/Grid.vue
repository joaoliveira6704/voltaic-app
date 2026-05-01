<script setup lang="ts">
interface Props {
    gap?: string;
    splitCellD?: boolean;
}

withDefaults(defineProps<Props>(), {
    gap: "gap-6",
    splitCellD: false,
});
</script>

<template>
    <!--
    Simplified to a 1-column grid.
    On desktop, it remains 1 column wide, creating a vertical stack.
  -->
    <div :class="['grid w-full h-fit px-2 py-2', 'grid-cols-1', 'h-fit', gap]">
        <!-- Cell A is removed as requested (the "most left" one) -->

        <!-- Cell B: Top -->
        <div class="min-h-0">
            <slot name="cell-b" />
        </div>

        <!-- Cell C: Middle -->
        <div class="min-h-0">
            <slot name="cell-c" />
        </div>

        <!-- Cell D: Bottom (Optional Split) -->
        <div
            :class="[
                'min-h-0',
                splitCellD ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : '',
            ]"
        >
            <template v-if="splitCellD">
                <div class="min-h-0">
                    <slot name="cell-d-left" />
                </div>
                <div class="min-h-0">
                    <slot name="cell-d-right" />
                </div>
            </template>
            <template v-else>
                <slot name="cell-d" />
            </template>
        </div>
    </div>
</template>
