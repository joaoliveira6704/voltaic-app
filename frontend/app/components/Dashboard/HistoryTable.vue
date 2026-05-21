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
    duration: string;
}

interface Props {
    sessions: ChargingSession[];
}

const props = defineProps<Props>();

console.log(props.sessions);
</script>

<template>
    <div class="w-full overflow-x-auto">
        <Table class="w-full min-w-[600px]">
            <TableHeader>
                <TableRow
                    class="hover:bg-transparent border-b border-neutral-100 dark:border-[#272727]"
                >
                    <TableHead
                        class="px-3 sm:px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 dark:text-white/80 text-left"
                    >
                        {{ t("historyTable.date") }}
                    </TableHead>
                    <TableHead
                        class="px-3 sm:px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 dark:text-white/80 text-left"
                    >
                        {{ t("historyTable.vehicle") }}
                    </TableHead>
                    <TableHead
                        class="px-3 sm:px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 text-center dark:text-white/80"
                    >
                        {{ t("historyTable.station") }}
                    </TableHead>
                    <TableHead
                        class="px-3 sm:px-6 text-neutral-500 font-bold underline underline-offset-4 decoration-neutral-300 text-right dark:text-white/80"
                    >
                        {{ t("historyTable.duration") }}
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody v-if="sessions?.length > 0">
                <TableRow
                    v-for="session in sessions"
                    :key="session.stationUsageId"
                    class="border-b border-neutral-50 dark:border-[#272727] last:border-0 hover:bg-neutral-50/50 dark:hover:bg-[#272727]/50"
                >
                    <TableCell class="px-3 sm:px-6 py-4 text-neutral-800 dark:text-white/80 text-xs text-left whitespace-nowrap">
                        {{ new Date(session.createdAt).getDate() }}
                        {{ new Date(session.createdAt).toLocaleString("default", { month: "short" }) }}
                        {{ new Date(session.createdAt).getFullYear() }}
                    </TableCell>
                    <TableCell class="px-3 sm:px-6 py-4 text-neutral-800 dark:text-white/80 text-xs text-left whitespace-nowrap">
                        {{ session.plate }}
                    </TableCell>
                    <TableCell class="px-3 sm:px-6 py-4 text-center text-neutral-800 dark:text-white/80 text-xs whitespace-nowrap">
                        {{ session.stationName }}
                    </TableCell>
                    <TableCell class="px-3 sm:px-6 py-4 text-right text-neutral-800 dark:text-white/80 text-xs tabular-nums whitespace-nowrap">
                        {{ session.duration === "active" ? "In Progress" : session.duration }}
                    </TableCell>
                </TableRow>
            </TableBody>
            <TableBody v-else>
                <TableRow>
                    <TableCell
                        colspan="4"
                        class="px-6 py-4 text-center text-neutral-800 dark:text-white/80 text-xs"
                    >
                        No Charges Yet
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>
