<!-- components/Admin/UserChart.vue -->
<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const { t } = useI18n();
import {
    Chart,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Tooltip,
    Filler,
} from "chart.js";

Chart.register(
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Tooltip,
    Filler,
);

const mockData = [34, 51, 42, 67, 58, 29, 38];
const labels = [t("chart.userChart.dayMon"), t("chart.userChart.dayTue"), t("chart.userChart.dayWed"), t("chart.userChart.dayThu"), t("chart.userChart.dayFri"), t("chart.userChart.daySat"), t("chart.userChart.daySun")];

const canvas = ref(null);
let chart = null;

onMounted(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const accentColor = isDark ? "#185FA5" : "#378ADD";

    chart = new Chart(canvas.value, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: t("chart.userChart.label"),
                    data: mockData,
                    borderColor: accentColor,
                    backgroundColor: isDark
                        ? "rgba(24, 95, 165, 0.2)"
                        : "rgba(55, 138, 221, 0.2)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: isDark ? "#888" : "#666",
                        font: { size: 11 },
                    },
                },
                y: {
                    grid: {
                        color: isDark
                            ? "rgba(255,255,255,0.07)"
                            : "rgba(0,0,0,0.07)",
                    },
                    ticks: {
                        color: isDark ? "#888" : "#666",
                        font: { size: 11 },
                    },
                    beginAtZero: true,
                },
            },
        },
    });
});

onUnmounted(() => chart?.destroy());
</script>

<template>
    <div class="relative h-44">
        <canvas
            ref="canvas"
            role="img"
            :aria-label="t('chart.userChart.ariaLabel')"
        />
    </div>
</template>
