<!-- components/Admin/StationsMap.vue -->
<script setup>
import { onMounted, ref, watch } from "vue";

const { t } = useI18n();
const props = defineProps({
    stations: { type: Array, default: () => [] },
});

const STATUS_COLOR = {
    online: "#1D9E75",
    maintenance: "#EF9F27",
    offline: "#E24B4A",
    empty: "#FFFFFF", // Land color when no station is present
};

function resolveStatus(station) {
    if (!station.alive) return "offline";
    if (station.state === "available") return "online";
    if (station.state === "maintenance") return "maintenance";
    if (station.state === "unavailable") return "offline";
}

const W = 960;
const H = 500;
const DOT_STEP = 6;
const DOT_R = 1;

const ready = ref(false);
const mapGrid = ref([]);
const hoveredDot = ref(null);

onMounted(async () => {
    // 1. Load D3 and TopoJSON
    const [d3, topojson] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/d3@7/+esm"),
        import("https://cdn.jsdelivr.net/npm/topojson-client@3/+esm"),
    ]);

    const world = await fetch(
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    ).then((r) => r.json());

    // 2. Setup Projection
    const projection = d3
        .geoNaturalEarth1()
        .scale(153)
        .translate([W / 2, H / 2]);

    const path = d3.geoPath(projection);
    const land = topojson.feature(world, world.objects.land);

    // 3. Project Stations to Pixel Space
    const projectedStations = props.stations.map((s) => {
        const [lon, lat] = s.location.coordinates;
        const [x, y] = projection([lon, lat]) ?? [0, 0];
        return {
            ...s,
            px: x,
            py: y,
            status: resolveStatus(s),
        };
    });

    // 4. Create Land Mask via Canvas
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><path d="${path(land)}" fill="white"/></svg>`;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svgString);

    await new Promise((res) => (img.onload = res));
    ctx.drawImage(img, 0, 0);

    // 5. Generate Integrated Grid (deferred to avoid blocking paint)
    const schedule = typeof requestIdleCallback === "function"
        ? requestIdleCallback
        : (cb) => setTimeout(cb, 50);

    schedule(() => {
        const result = [];
        for (let x = 0; x < W; x += DOT_STEP) {
            for (let y = 0; y < H; y += DOT_STEP) {
                const pixelData = ctx.getImageData(x, y, 1, 1).data;

                if (pixelData[0] > 128) {
                    const localStations = projectedStations.filter((s) => {
                        const dx = s.px - x;
                        const dy = s.py - y;
                        return Math.sqrt(dx * dx + dy * dy) < DOT_STEP * 0.7;
                    });

                    const count = localStations.length;
                    const status = count > 0 ? localStations[0].status : "empty";

                    result.push({
                        x,
                        y,
                        count,
                        color: STATUS_COLOR[status],
                        stations: localStations,
                    });
                }
            }
        }

        mapGrid.value = result;
        ready.value = true;
    });
});
</script>

<template>
    <div
        class="relative w-full rounded-xl overflow-hidden border border-white/5"
    >
        <!-- Legend -->
        <div class="absolute top-4 left-4 flex gap-4 z-10">
            <div
                v-for="(color, key) in STATUS_COLOR"
                :key="key"
                v-show="key !== 'empty'"
                class="flex items-center gap-2 text-[10px] uppercase"
            >
                <span
                    class="w-2 h-2 rounded-full"
                    :style="{ background: color }"
                />
                {{ t(`chart.stationsMap.${key}`) }}
            </div>
        </div>

        <!-- Custom Tooltip -->
        <Transition name="fade">
            <div
                v-if="hoveredDot && hoveredDot.count > 0"
                class="absolute z-20 pointer-events-none bg-[#1A1D26] border border-white/10 p-2 rounded shadow-xl text-xs"
                :style="{
                    left: `${(hoveredDot.x / W) * 100}%`,
                    top: `${(hoveredDot.y / H) * 100}%`,
                    transform: 'translate(-50%, -120%)',
                }"
            >
                <div class="font-bold text-white">
                    {{ t("chart.stationsMap.stations", { count: hoveredDot.count }) }}
                </div>
                <div class="text-white/60 text-[10px]">
                    {{ t("chart.stationsMap.primary", { name: hoveredDot.stations[0].title }) }}
                </div>
            </div>
        </Transition>

        <!-- Map Container -->
        <svg
            :viewBox="`0 0 ${W} ${H}`"
            class="w-full h-auto block transform-gpu"
            shape-rendering="geometricPrecision"
        >
            <g v-if="ready">
                <circle
                    v-for="(dot, i) in mapGrid"
                    :key="i"
                    :cx="dot.x"
                    :cy="dot.y"
                    :r="dot.count > 0 ? DOT_R * 1.4 : DOT_R"
                    :fill="dot.color"
                    :fill-opacity="dot.count > 0 ? 1 : 0.2"
                    class="transition-all duration-300 ease-out dark:fill-white fill-black"
                    @mouseenter="hoveredDot = dot"
                    @mouseleave="hoveredDot = null"
                />
            </g>

            <!-- Loading Overlay -->
            <g v-else>
                <text
                    :x="W / 2"
                    :y="H / 2"
                    fill="white"
                    fill-opacity="0.5"
                    text-anchor="middle"
                    font-size="12"
                >
                    {{ t("chart.stationsMap.initializing") }}
                </text>
            </g>
        </svg>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

circle {
    cursor: crosshair;
}

circle:hover {
    stroke: white;
    stroke-width: 0.5;
    stroke-opacity: 0.5;
}
</style>
