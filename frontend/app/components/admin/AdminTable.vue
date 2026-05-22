<script setup lang="ts">
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-vue-next";

const { t } = useI18n();
const props = defineProps<{
    columns: any[];
    rows: any[];
    type: string;
    sortColumn?: string;
    sortDirection?: string;
}>();
const emit = defineEmits<{
    (e: "edit", row: any): void;
    (e: "delete", row: any): void;
    (e: "click", row: any): void;
    (e: "sort", payload: { column: string; direction: string }): void;
}>();

function toggleSort(columnKey: string) {
    if (props.sortColumn === columnKey) {
        if (props.sortDirection === "asc") {
            emit("sort", { column: columnKey, direction: "desc" });
        } else {
            emit("sort", { column: "", direction: "" });
        }
    } else {
        emit("sort", { column: columnKey, direction: "asc" });
    }
}

function getSortIcon(columnKey: string) {
    if (props.sortColumn !== columnKey) return ArrowUpDown;
    return props.sortDirection === "asc" ? ArrowUp : ArrowDown;
}
</script>

<template>
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead
                    v-for="col in columns"
                    :key="col.key"
                    class="text-xs uppercase"
                >
                    <button
                        class="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        @click="toggleSort(col.key)"
                    >
                        {{ col.label }}
                        <component
                            :is="getSortIcon(col.key)"
                            class="h-3 w-3"
                            :class="
                                sortColumn === col.key
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/40'
                            "
                        />
                    </button>
                </TableHead>
                <TableHead class="text-xs uppercase">{{
                    t("admin.table.actions")
                }}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow
                v-for="row in rows"
                :key="row.id"
                class="cursor-pointer hover:bg-muted/50 w-full justify-between"
                @click="$emit('click', row)"
            >
                <slot :row="row" />
                <TableCell>
                    <ActionButtons
                        :type="props.type"
                        @edit="$emit('edit', row)"
                        @delete="$emit('delete', row)"
                    />
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</template>
