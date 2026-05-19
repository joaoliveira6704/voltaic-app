<script setup>
defineProps({
    columns: Array,
    rows: Array,
    type: "users" | "tickets" | "stations" | "companies",
    rowKey: { type: String, default: "id" },
});
defineEmits(["click"]);

const router = useRouter();

const handleNavigation = (type, id) => {
    router.push(`${type}/${id}`);
};
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
            </TableRow>
        </TableHeader>
        <!-- AdminTable.vue -->
        <TableBody>
            <TableRow
                v-for="row in rows"
                :key="row[rowKey]"
                class="cursor-pointer hover:bg-muted/50"
                @click="handleNavigation(type, row.stationId)"
            >
                <slot :row="row" />
            </TableRow>
        </TableBody>
    </Table>
</template>
