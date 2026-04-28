<script setup lang="ts">
import { MapPin } from "lucide-vue-next";

interface ChargingSession {
  date: string;
  vehicleName: string;
  stationId: string;
  duration: string;
}

interface Props {
  sessions: ChargingSession[];
}

const props = defineProps<Props>();

/**
 * We take the last 5 items.
 * .slice(-5) grabs the end of the array.
 * .reverse() ensures the most recent is at the top.
 */
const recentSessions = computed(() => {
  if (!props.sessions) return [];
  return [...props.sessions].slice(-5).reverse();
});
</script>

<template>
  <div class="w-full font-mono overflow-x-auto">
    <Table class="w-full min-w-full table-fixed">
      <TableHeader>
        <TableRow class="hover:bg-transparent border-b border-neutral-100">
          <TableHead class="px-6 text-neutral-500 font-bold"> Date </TableHead>
          <TableHead class="px-6 text-neutral-500 font-bold">
            Vehicle
          </TableHead>
          <TableHead class="text-neutral-500 font-bold text-center">
            Station
          </TableHead>
          <TableHead class="px-6 text-neutral-500 font-bold text-right">
            Duration
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="(session, index) in recentSessions"
          :key="index"
          class="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50"
        >
          <TableCell class="px-6 py-4 text-neutral-800 text-xs">
            &lt;{{ session.date }}&gt;
          </TableCell>
          <TableCell class="px-6 py-4 text-neutral-800 text-xs">
            &lt;{{ session.vehicleName }}&gt;
          </TableCell>
          <TableCell class="py-4 text-center">
            <div class="flex justify-center">
              <MapPin class="w-4 h-4 text-black" />
            </div>
          </TableCell>
          <TableCell
            class="px-6 py-4 text-right text-neutral-800 text-xs tabular-nums"
          >
            &lt;{{ session.duration }}&gt;
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
