<script setup lang="ts">
import { MapPin } from "lucide-vue-next";

const { t } = useI18n();

interface ChargingSession {
    stationUsageId: string;
    userId: string;
    stationId: string;
    createdAt: string;
    endTime?: string;
    plate: string;
}

interface Props {
    sessions: ChargingSession[];
}

defineProps<Props>();

const duration = (session: ChargingSession) => {
    console.log(session);
    if (!session.endTime) return t("historyTable.inProgress");

    const start = new Date(session.createdAt).getTime();
    const end = new Date(session.endTime).getTime();
    const diffMs = end - start;

    if (diffMs < 0) {
        return t("historyTable.timeError");
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
                    <!-- Left Aligned -->
                    <TableHead
                        class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 dark:text-white/80 text-left"
                    >
                        {{ t("historyTable.date") }}
                    </TableHead>

                    <TableHead
                        class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 dark:text-white/80 text-left"
                    >
                        {{ t("historyTable.vehicle") }}
                    </TableHead>

                    <TableHead
                        class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 text-center dark:text-white/80"
                    >
                        {{ t("historyTable.station") }}
                    </TableHead>

                    <TableHead
                        class="px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 text-right dark:text-white/80"
                    >
                        {{ t("historyTable.duration") }}
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableRow
                    v-for="session in sessions"
                    :key="session.stationUsageId"
                    class="border-b border-neutral-50 dark:border-[#272727] last:border-0 hover:bg-neutral-50/50 dark:hover:bg-[#272727]/50"
                >
                    <!-- Date: Left -->
                    <TableCell
                        class="px-6 py-4 text-neutral-800 dark:text-white/80 text-xs text-left"
                    >
                        {{ new Date(session.createdAt).getDate() }}
                        {{
                            new Date(session.createdAt).toLocaleString(
                                "default",
                                { month: "short" },
                            )
                        }}
                        {{ new Date(session.createdAt).getFullYear() }}
                    </TableCell>

                    <!-- Vehicle: Left -->
                    <TableCell
                        class="px-6 py-4 text-neutral-800 dark:text-white/80 text-xs text-left"
                    >
                        {{ session.plate }}
                    </TableCell>

                    <!-- Station: Center (Matches Header) -->
                    <TableCell
                        class="px-6 py-4 text-center text-neutral-800 dark:text-white/80 text-xs"
                    >
                        {{ session.stationName }}
                    </TableCell>

                    <!-- Duration: Right (Matches Header) -->
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
