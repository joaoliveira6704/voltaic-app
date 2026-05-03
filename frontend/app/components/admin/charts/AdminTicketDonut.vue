<!-- components/Admin/TicketDonut.vue -->
<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import {
    Chart,
    ArcElement,
    DoughnutController,
    Tooltip,
    Legend,
} from "chart.js";

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

const props = defineProps({
    open: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    closed: { type: Number, default: 0 },
});

const canvas = ref(null);
let chart = null;

const data = computed(() => [props.open, props.pending, props.closed]);
const total = computed(() => data.value.reduce((a, b) => a + b, 0));

function buildChart() {
    if (!canvas.value) return;
    chart = new Chart(canvas.value, {
        type: "doughnut",
        data: {
            labels: ["Open", "Closed"],
            datasets: [
                {
                    data: data.value,
                    backgroundColor: ["#185FA5", "#BA7517", "#3B6D11"],
                    borderWidth: 0,
                    hoverOffset: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
                    },
                },
            },
        },
    });
}

onMounted(buildChart);
onUnmounted(() => chart?.destroy());

watch(data, (val) => {
    if (chart) {
        chart.data.datasets[0].data = val;
        chart.update();
    }
});
</script>

<template>
    <div class="space-y-3">
        <div class="relative h-44">
            <canvas
                ref="canvas"
                role="img"
                aria-label="Ticket status donut chart"
            />
        </div>
        <div class="flex justify-center gap-4 text-xs text-muted-foreground">
            <span class="flex items-center gap-1.5">
                <span
                    class="w-2.5 h-2.5 rounded-sm inline-block"
                    style="background: #185fa5"
                />
                Open: {{ open }}
            </span>

            <span class="flex items-center gap-1.5">
                <span
                    class="w-2.5 h-2.5 rounded-sm inline-block"
                    style="background: #3b6d11"
                />
                Closed: {{ closed }}
            </span>
        </div>
    </div>
</template>
