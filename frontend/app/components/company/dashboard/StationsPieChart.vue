<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface StationsData {
  available: number;
  unavailable: number;
  maintenance: number;
}

const props = defineProps<{ data: StationsData }>();

const chartData = computed(() => ({
  labels: ["Available", "Unavailable", "Maintenance"],
  datasets: [
    {
      data: [
        props.data.available,
        props.data.unavailable,
        props.data.maintenance,
      ],
      backgroundColor: ["#00c885", "#f87171", "#fbbf24"],
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
  <DashboardCard title="Stations" :has-line="false">
    <CardContent class="py-4 flex items-center justify-center">
      <div class="w-full h-[100px]">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </CardContent>
  </DashboardCard>
</template>
