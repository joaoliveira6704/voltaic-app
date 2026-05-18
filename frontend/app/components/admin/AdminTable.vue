<script setup>
const { t } = useI18n();
defineProps({
    columns: Array,
    rows: Array,
    type: "users" | "tickets" | "stations" | "companies",
});
defineEmits(["edit", "delete", "click"]);
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
                    {{ col.label }}
                </TableHead>
                <TableHead class="text-xs uppercase">{{
                    t("admin.table.actions")
                }}</TableHead>
            </TableRow>
        </TableHeader>
        <!-- AdminTable.vue -->
        <TableBody>
            <TableRow
                v-for="row in rows"
                :key="row.id"
                class="cursor-pointer hover:bg-muted/50 w-full justify-between"
                @click="$emit('click', row)"
            >
                <slot :row="row" />
                <!-- ← this must be here, passing row back out -->
                <TableCell>
                    <ActionButtons
                        @edit="$emit('edit', row)"
                        @delete="$emit('delete', row)"
                    />
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</template>
