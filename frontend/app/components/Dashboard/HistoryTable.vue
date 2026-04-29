<script setup lang="ts">
import { MapPin } from "lucide-vue-next";

interface ChargingSession {
  stationUsageId: string;
  userId: string;
  stationId: string;
  startTime: string;
  endTime?: string;
  plate: string;
}

interface Props {
  sessions: ChargingSession[];
}

defineProps<Props>();

const duration = (session: ChargingSession) => {
  if (!session.endTime) return "In Progress";
  const start = new Date(session.startTime);
  const end = new Date(session.endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHrs = Math.round(diffMs / 3600000);
  return `${diffHrs} hrs`;
};
</script>

<template>
  <div class="w-full font-mono overflow-x-auto">
    <Table class="w-full min-w-full table-fixed">
      <TableHeader>
        <TableRow class="hover:bg-transparent border-b border-neutral-100">
          <TableHead
            class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300"
          >
            Date
          </TableHead>
          <TableHead
            class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300"
          >
            Vehicle
          </TableHead>
          <TableHead
            class="text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 text-center"
          >
            Station
          </TableHead>
          <TableHead
            class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 text-right"
          >
            Duration
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="session in sessions"
          :key="session.stationUsageId"
          class="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50"
        >
          <TableCell class="px-6 py-4 text-neutral-800 text-xs">
            {{ new Date(session.startTime).getDay() }}
            {{
              new Date(session.startTime).toLocaleString("default", {
                month: "short",
              })
            }}
            {{ new Date(session.startTime).getFullYear() }}
          </TableCell>
          <TableCell class="px-6 py-4 text-neutral-800 text-xs">
            {{ session.plate }}
          </TableCell>
          <TableCell class="py-4 text-center">
            <div class="flex justify-center">
              <MapPin class="w-4 h-4 text-black" />
            </div>
          </TableCell>
          <TableCell
            class="px-6 py-4 text-right text-neutral-800 text-xs tabular-nums"
          >
            {{ duration(session) }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
