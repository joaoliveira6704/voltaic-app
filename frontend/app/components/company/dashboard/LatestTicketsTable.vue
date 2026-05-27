<script setup lang="ts">
import { useRouter } from "vue-router";
import { TicketStatus } from "@/utils/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface Ticket {
  ticketId: string;
  title: string;
  status: string;
  groupName: string;
  createdAt: string;
}

defineProps<{ tickets: Ticket[] }>();

const router = useRouter();

function getStatusBadge(status: string) {
  const entry = TicketStatus.find((s) => s.key === status);
  return {
    color: entry?.color ?? "bg-muted text-muted-foreground",
    label: entry?.label ?? status ?? "—",
  };
}

function formatDate(date: string) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}
</script>

<template>
  <DashboardCard title="Latest Tickets" :has-line="false">
    <CardContent class="py-4 w-full">
      <Table>
        <TableHeader>
          <TableRow class="border-gray-100 dark:border-[#232323]">
            <TableHead class="text-xs font-bold uppercase text-gray-400"
              >Title</TableHead
            >
            <TableHead class="text-xs font-bold uppercase text-gray-400"
              >Status</TableHead
            >
            <TableHead class="text-xs font-bold uppercase text-gray-400"
              >Group</TableHead
            >
            <TableHead class="text-xs font-bold uppercase text-gray-400"
              >Created At</TableHead
            >
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="ticket in tickets"
            :key="ticket.ticketId"
            class="border-gray-100 dark:border-[#232323] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
            @click="router.push('/company/tickets')"
          >
            <TableCell class="text-xs font-medium">{{
              ticket.title
            }}</TableCell>
            <TableCell>
              <div
                class="text-xs uppercase px-2 py-0.5 rounded w-fit border dark:border-[#232323]"
                :class="getStatusBadge(ticket.status).color"
              >
                {{ getStatusBadge(ticket.status).label }}
              </div>
            </TableCell>
            <TableCell class="text-xs text-gray-500 dark:text-white/50">{{
              ticket.groupName
            }}</TableCell>
            <TableCell class="text-xs text-gray-500 dark:text-white/50">{{
              formatDate(ticket.createdAt)
            }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </DashboardCard>
</template>
