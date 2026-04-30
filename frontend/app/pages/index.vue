<script setup lang="ts">
import Hero from "@/components/landing-page/Hero.vue";
import FeatureCard from "@/components/landing-page/FeatureCard.vue";
import { onMounted, nextTick, computed } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { t } = useI18n();

useHead({
  title: t("landing.head.title"),
  meta: [{ name: "description", content: t("landing.head.description") }],
});

definePageMeta({ layout: "default" });

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger);
}

onMounted(async () => {
  await nextTick();

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

const stats = computed<{ id: number; number: string; label: string }[]>(() => [
  { id: 1, number: "2000+", label: t("landing.stats.activeUsers") },
  { id: 2, number: "10K+", label: t("landing.stats.chargingStations") },
  { id: 3, number: "99.9%", label: t("landing.stats.uptimeGuarantee") },
  { id: 4, number: "200+", label: t("landing.stats.companiesRegistered") },
]);
</script>

<template>
  <main class="antialiased text-gray-900 bg-white">
    <Hero />

    <section class="reveal py-10 border-y border-gray-100">
      <div class="max-w-7xl mx-auto flex flex-wrap justify-around text-center">
        <div v-for="stat in stats" :key="stat.id">
          <h4 class="text-3xl font-bold text-green-600">{{ stat.number }}</h4>
          <p class="text-gray-500 text-sm">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <section id="features" class="reveal py-24 px-10 max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold">
          {{ t("landing.features.sectionTitle") }} <br />
          <span class="text-green-500">{{
            t("landing.features.sectionTitleHighlight")
          }}</span>
        </h2>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <FeatureCard
          v-for="feature in features"
          :key="feature.title"
          :title="feature.title"
          :description="feature.description"
          :icon="feature.icon"
        />
      </div>
    </section>

    <section class="reveal px-10 mb-20">
      <div
        class="max-w-7xl mx-auto bg-green-600 rounded-[3rem] p-16 text-center text-white relative overflow-hidden"
      >
        <h2 class="text-4xl font-bold mb-6">
          {{ t("landing.cta.title") }} <br />
          <span class="text-green-200">{{
            t("landing.cta.titleHighlight")
          }}</span>
        </h2>
        <p class="mb-10 opacity-90">{{ t("landing.cta.subtitle") }}</p>
        <div class="flex justify-center gap-4">
          <button
            class="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-100 transition"
          >
            {{ t("landing.cta.button") }}
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped></style>
