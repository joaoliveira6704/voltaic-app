<script setup lang="ts">
import { gsap } from "gsap";

const heroRef = ref<HTMLElement | null>(null);

const { t } = useI18n();

let ctx: gsap.Context;

onMounted(() => {
    ctx = gsap.context(() => {
        gsap.from(".hero-content", {
            opacity: 0,
            x: -50,
            duration: 1,
            stagger: 0.3,
        });
        gsap.from(".hero-image", {
            opacity: 0,
            scale: 0.8,
            duration: 1.2,
            ease: "back.out(1.7)",
        });
    }, heroRef.value!);
});

onUnmounted(() => {
    ctx.revert();
});
</script>

<template>
    <section
        ref="heroRef"
        class="pt-32 pb-20 px-10 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-[#0a0a0a] overflow-hidden"
    >
        <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
                <h1
                    class="hero-content text-6xl font-extrabold leading-tight text-gray-900 dark:text-white"
                >
                    {{ t("landing.hero.chargeSmarter") }},<br />
                    <span
                        class="text-green-500 underline decoration-green-200"
                        >{{ t("landing.hero.driveFurther") }}</span
                    >
                </h1>
                <p
                    class="hero-content mt-6 text-lg text-gray-600 max-w-md dark:text-white/50"
                >
                    {{ t("landing.hero.subtitle") }}
                </p>
                <div class="hero-content mt-8 flex gap-4">
                    <button
                        class="bg-black text-white px-8 py-4 rounded-xl flex items-center gap-2"
                    >
                        {{ t("landing.cta.button") }}
                    </button>
                </div>
            </div>
            <div class="hero-image relative">
                <img
                    src="/ev-mockup.webp"
                    alt="EV Car"
                    class="w-full drop-shadow-2xl"
                />
                <div
                    class="absolute top-10 right-0 bg-white dark:bg-[#171717] dark:border-[#232323] p-4 rounded-2xl shadow-xl border border-green-100"
                >
                    <p class="text-xs text-gray-400">
                        {{ t("landing.hero.networkCoverage") }}
                    </p>
                    <p class="text-xl font-bold text-green-600">
                        10,000+ Posts
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
