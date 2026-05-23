<script setup lang="ts">
import { Bar, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { ArrowLeft } from "lucide-vue-next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface WeeklyTotal {
  weekStart: string;
  total: number;
}

interface DrilldownDay {
  date: string;
  groups: {
    groupId: string;
    name: string;
    uses: number;
  }[];
}

interface Drilldown {
  days: DrilldownDay[];
}

const props = defineProps<{
  weeklyTotals: WeeklyTotal[];
  drilldown: Drilldown | null;
  selectedWeek: string | null;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: "select-week", weekStart: string): void;
  (e: "clear"): void;
}>();

// ── Colors ────────────────────────────────────────────────────────────────
const GROUP_COLORS = [
  "#00c885",
  "#60a5fa",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#38bdf8",
  "#e879f9",
  "#94a3b8",
];

// ── Bar chart (weekly totals) ─────────────────────────────────────────────
function getWeekLabel(weekStart: string) {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(start)} - ${fmt(end)}`;
}

const barData = computed(() => ({
  labels: props.weeklyTotals.map((w) => getWeekLabel(w.weekStart)),
  datasets: [
    {
      label: "Total Uses",
      data: props.weeklyTotals.map((w) => w.total),
      backgroundColor: "#00c885",
      borderRadius: 6,
      hoverBackgroundColor: "#00a86b",
    },
  ],
}));

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  onClick: (_: any, elements: any[]) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      emit("select-week", props.weeklyTotals[index].weekStart);
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => ` ${ctx.raw} uses`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 } },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { font: { size: 10 } },
    },
  },
};

// ── Line/area chart (drilldown) ───────────────────────────────────────────
const groupNames = computed(() => {
  if (!props.drilldown) return [];
  const names = new Set<string>();
  props.drilldown.days.forEach((day) =>
    day.groups.forEach((g) => names.add(g.name)),
  );
  return Array.from(names);
});

const lineData = computed(() => {
  if (!props.drilldown) return { labels: [], datasets: [] };

  const labels = props.drilldown.days.map((d) => {
    const date = new Date(d.date);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  });

  const datasets = groupNames.value.map((name, i) => {
    const color = GROUP_COLORS[i % GROUP_COLORS.length];
    return {
      label: name,
      data: props.drilldown!.days.map(
        (day) => day.groups.find((g) => g.name === name)?.uses ?? 0,
      ),
      borderColor: color,
      backgroundColor: color + "33",
      fill: true,
      tension: 0.4,
      pointRadius: 4,
    };
  });

  return { labels, datasets };
});

const lineOptions = {
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
        label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw} uses`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 } },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { font: { size: 10 } },
    },
  },
};

const selectedWeekLabel = computed(() =>
  props.selectedWeek ? getWeekLabel(props.selectedWeek) : "",
);
</script>

<template>
  <DashboardCard :has-line="false">
    <template #default>
      <CardContent class="py-4 w-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <button
              v-if="selectedWeek"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              @click="emit('clear')"
            >
              <ArrowLeft class="w-4 h-4" />
            </button>
            <p class="text-xs font-bold uppercase text-gray-400">
              {{
                selectedWeek ? `Week of ${selectedWeekLabel}` : "Weekly Usage"
              }}
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div
          v-if="isLoading"
          class="flex items-center justify-center h-[260px] text-sm text-gray-400"
        >
          Loading...
        </div>

        <!-- Bar chart -->
        <div v-else-if="!selectedWeek" class="h-[260px]">
          <Bar :data="barData" :options="barOptions" />
        </div>

        <!-- Area/line chart -->
        <div v-else class="h-[260px]">
          <Line :data="lineData" :options="lineOptions" />
        </div>
      </CardContent>
    </template>
  </DashboardCard>
</template>
