<script setup lang="ts">
import Hero from "@/components/landing-page/Hero.vue";
import FeatureCard from "@/components/landing-page/FeatureCard.vue";
import { onMounted, nextTick, ref } from "vue";

const { t } = useI18n();
const userStore = useUserStore();

useHead({
    title: t("landing.head.title"),
    meta: [{ name: "description", content: t("landing.head.description") }],
});

definePageMeta({ layout: "landing" });

onBeforeMount(async () => {
    if (useCookie("token").value) {
        await userStore.fetchCurrentUser();
    }
});

interface Stat {
    id: number;
    number: string;
    label: string;
}

function formatStat(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K+`;
    return `${n}+`;
}

const stats = ref<Stat[]>([
    { id: 1, number: "0", label: t("landing.stats.activeUsers") },
    { id: 2, number: "0", label: t("landing.stats.chargingStations") },
    { id: 3, number: "99.9%", label: t("landing.stats.uptimeGuarantee") },
    { id: 4, number: "0", label: t("landing.stats.companiesRegistered") },
]);

onMounted(async () => {
    await nextTick();

    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
    ]);

    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll(".reveal");

    if (sections.length > 0) {
        sections.forEach((section) => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power2.out",
                immediateRender: false,
                onComplete: () => gsap.set(section, { clearProps: "all" }),
            });
        });
    }

    const statsStore = useStatsStore();
    await statsStore.fetchLandingStats();
    if (statsStore.landingStats) {
        stats.value = [
            { id: 1, number: formatStat(statsStore.landingStats.totalUsers), label: t("landing.stats.activeUsers") },
            { id: 2, number: formatStat(statsStore.landingStats.totalStations), label: t("landing.stats.chargingStations") },
            { id: 3, number: "99.9%", label: t("landing.stats.uptimeGuarantee") },
            { id: 4, number: formatStat(statsStore.landingStats.totalCompanies), label: t("landing.stats.companiesRegistered") },
        ];
    }
});

type IconName = "Zap" | "Map" | "Shield";

const features = computed<
    { title: string; description: string; icon: IconName }[]
>(() => [
    {
        title: t("landing.features.realTimeAvailability.title"),
        description: t("landing.features.realTimeAvailability.description"),
        icon: "Zap",
    },
    {
        title: t("landing.features.interactiveMap.title"),
        description: t("landing.features.interactiveMap.description"),
        icon: "Map",
    },
    {
        title: t("landing.features.companyManagedStations.title"),
        description: t("landing.features.companyManagedStations.description"),
        icon: "Shield",
    },
]);
</script>

<template>
    <main
        class="antialiased text-gray-900 bg-white dark:bg-[#0a0a0a] dark:text-white"
    >
        <Hero />

        <section
            class="reveal py-10 border-y border-gray-100 dark:border-[#232323]"
        >
            <div
                class="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full text-center"
            >
                <div v-for="stat in stats" :key="stat.id">
                    <h4 class="text-xl sm:text-3xl font-bold text-green-600">
                        {{ stat.number }}
                    </h4>
                    <p
                        class="text-gray-500 dark:text-white/80 text-xs min-[400px]:text-sm"
                    >
                        {{ stat.label }}
                    </p>
                </div>
            </div>
        </section>

        <section
            id="features"
            class="reveal py-10 min-[500px]:py-24 px-4 min-[500px]:px-10 max-w-7xl mx-auto"
        >
            <div class="text-center mb-8 min-[500px]:mb-16">
                <h2 class="text-3xl min-[500px]:text-4xl font-bold">
                    {{ t("landing.features.sectionTitle") }} <br />
                    <span class="text-green-500">{{
                        t("landing.features.sectionTitleHighlight")
                    }}</span>
                </h2>
            </div>
            <div class="grid lg:grid-cols-3 gap-8">
                <FeatureCard
                    v-for="feature in features"
                    :key="feature.title"
                    :title="feature.title"
                    :description="feature.description"
                    :icon="feature.icon"
                />
            </div>
        </section>

        <section class="reveal px-4 min-[500px]:px-10 mb-4 sm:mb-20">
            <div
                class="max-w-7xl mx-auto bg-green-600 rounded-[3rem] p-8 min-[500px]:p-16 text-center text-white relative overflow-hidden"
            >
                <h2
                    class="text-3xl min-[500px]:text-4xl font-bold mb-2 min-[500px]:mb-6"
                >
                    {{ t("landing.cta.title") }} <br />
                    <span class="text-green-200">{{
                        t("landing.cta.titleHighlight")
                    }}</span>
                </h2>
                <p class="mb-10 opacity-90">{{ t("landing.cta.subtitle") }}</p>
                <div class="flex justify-center gap-4">
                    <NuxtLink
                        to="/signup"
                        class="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-100 transition"
                    >
                        {{ t("landing.cta.button") }}
                    </NuxtLink>
                </div>
            </div>
        </section>
    </main>
</template>

<style lang="scss" scoped></style>
