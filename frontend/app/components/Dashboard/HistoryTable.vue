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

    const start = new Date(session.startTime).getTime();
    const end = new Date(session.endTime).getTime();
    const diffMs = end - start;

    // Logic for negative durations (Data Error)
    if (diffMs < 0) {
        return "Time Error"; // Or Math.abs(diffMs) if you want to force it positive
    }

    const totalMinutes = Math.floor(diffMs / 60000);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};
</script>

<template>
    <div class="w-full overflow-x-auto">
        <Table class="w-full min-w-full table-fixed">
            <TableHeader>
                <TableRow
                    class="hover:bg-transparent border-b border-neutral-100 dark:border-[#272727]"
                >
                    <TableHead
                        class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 dark:text-white/80"
                    >
                        Date
                    </TableHead>
                    <TableHead
                        class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 dark:text-white/80"
                    >
                        Vehicle
                    </TableHead>
                    <TableHead
                        class="text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 text-center dark:text-white/80"
                    >
                        Station
                    </TableHead>
                    <TableHead
                        class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 text-right dark:text-white/80"
                    >
                        Duration
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableRow
                    v-for="session in sessions"
                    :key="session.stationUsageId"
                    class="border-b border-neutral-50 dark:border-[#272727] last:border-0 hover:bg-neutral-50/50 dark:hover:bg-[#272727]/50"
                >
                    <TableCell
                        class="px-6 py-4 text-neutral-800 dark:text-white/80 text-xs"
                    >
                        {{ new Date(session.startTime).getDay() }}
                        {{
                            new Date(session.startTime).toLocaleString(
                                "default",
                                {
                                    month: "short",
                                },
                            )
                        }}
                        {{ new Date(session.startTime).getFullYear() }}
                    </TableCell>
                    <TableCell
                        class="px-6 py-4 text-neutral-800 dark:text-white/80 text-xs"
                    >
                        {{ session.plate }}
                    </TableCell>
                    <TableCell
                        class="px-6 py-4 text-right text-neutral-800 dark:text-white/80 text-xs tabular-nums"
                    >
                        {{ session.stationId.slice(0, 10) }}...
                    </TableCell>
                    <TableCell
                        class="px-6 py-4 text-right text-neutral-800 dark:text-white/80 text-xs tabular-nums"
                    >
                        {{ duration(session) }}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>
