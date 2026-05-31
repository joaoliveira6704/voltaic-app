<script setup>
defineProps({
  columns: Array,
  rows: Array,
  rowKey: { type: String, default: "userId" },
});
defineEmits(["remove"]);
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
    <TableBody>
      <TableRow v-for="row in rows" :key="row[rowKey]">
        <slot :row="row" />
      </TableRow>
    </TableBody>
  </Table>
</template>
