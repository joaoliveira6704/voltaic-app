<script setup lang="ts">
import Hero from "@/components/landing-page/Hero.vue";
import FeatureCard from "@/components/landing-page/FeatureCard.vue";
import { onMounted, nextTick } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

useHead({
  title: "Voltaic - Landing Page",
  meta: [
    {
      name: "description",
      content: "Voltaic is a electric vehicle charger company built for you.",
    },
  ],
});

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

const features: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Real-Time Availability",
    description:
      "Live updates on station availability and wait times at your fingertips.",
    icon: "Zap",
  },
  {
    title: "Interactive Map",
    description:
      "Find nearby stations with filters for charger type, location, and more.",
    icon: "Map",
  },
  {
    title: "Company Managed Stations",
    description:
      "For every station listed, we ensure it's maintained and reliable for your journey.",
    icon: "Shield",
  },
];

const stats: { id: number; number: string; label: string }[] = [
  { id: 1, number: "2000+", label: "Active Users" },
  { id: 2, number: "10K+", label: "Charging Stations" },
  { id: 3, number: "99.9%", label: "Uptime Guarantee" },
  { id: 4, number: "200+", label: "Companies Registered" },
];
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
          Everything You Need <br /><span class="text-green-500"
            >All in One Place</span
          >
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
          Join the EV Revolution <br /><span class="text-green-200"
            >Charge Smarter, Drive Further</span
          >
        </h2>
        <p class="mb-10 opacity-90">
          Join thousands of drivers who charge smarter every day.
        </p>
        <div class="flex justify-center gap-4">
          <button
            class="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-100 transition"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped></style>
