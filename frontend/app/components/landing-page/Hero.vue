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
        class="pt-10 md:pt-32 pb-10 md:pb-20 px-5 md:px-10 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-[#0a0a0a] overflow-hidden"
    >
        <div
            class="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 text-center md:text-start items-center"
        >
            <div>
                <h1
                    class="hero-content text-4xl transition-all duration-300 min-[540px]:text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white"
                >
                    {{ t("landing.hero.chargeSmarter") }},<br />
                    <span
                        class="text-green-500 underline decoration-green-200"
                        >{{ t("landing.hero.driveFurther") }}</span
                    >
                </h1>
                <p
                    class="hero-content text-sm min-[540px]:text-base mt-6 md:text-lg text-gray-600 max-w-md dark:text-white/50 mx-auto md:mx-0"
                >
                    {{ t("landing.hero.subtitle") }}
                </p>
                <div class="hero-content mt-8 flex gap-4 mx-auto md:mx-0 w-fit">
                    <button
                        class="bg-black text-white px-8 py-4 rounded-xl flex items-center gap-2 text-xs md:text-base"
                    >
                        {{ t("landing.cta.button") }}
                    </button>
                </div>
            </div>
            <div class="hero-image relative">
                <NuxtImg
                    src="/ev-mockup.webp"
                    alt="EV Car"
                    class="w-full drop-shadow-2xl"
                    loading="lazy"
                />
                <div
                    class="absolute top-10 right-0 bg-white dark:bg-[#171717] dark:border-[#232323] p-4 rounded-2xl shadow-xl border border-green-100"
                >
                    <p class="text-xs text-gray-400">
                        {{ t("landing.hero.networkCoverage") }}
                    </p>
                    <p
                        class="text-base min-[540px]:text-xl font-bold text-green-600"
                    >
                        10,000+ Posts
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
