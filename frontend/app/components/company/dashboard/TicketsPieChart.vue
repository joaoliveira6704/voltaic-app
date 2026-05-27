<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TicketsData {
  open: number;
  closed: number;
  resolved: number;
  unresolved: number;
}

const props = defineProps<{ data: TicketsData }>();

const chartData = computed(() => ({
  labels: ["Open", "Closed", "Resolved", "Unresolved"],
  datasets: [
    {
      data: [
        props.data.open,
        props.data.closed,
        props.data.resolved,
        props.data.unresolved,
      ],
      backgroundColor: ["#60a5fa", "#94a3b8", "#00c885", "#f87171"],
      borderWidth: 0,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        font: { size: 11 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}`,
      },
    },
  },
};
</script>

<template>
  <DashboardCard title="Tickets" :has-line="false">
    <div class="py-4 flex items-center justify-center">
      <div class="w-full h-[100px]">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </DashboardCard>
</template>
