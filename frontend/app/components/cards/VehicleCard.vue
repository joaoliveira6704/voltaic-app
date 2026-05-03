<script setup lang="ts">
import { Pencil, Trash2 } from "lucide-vue-next";

const userStore = useUserStore();
const { t } = useI18n();

interface VehicleData {
    id: number;
    brand: string;
    model: string;
    plate: string;
    slug?: string;
}

interface Props {
    data: VehicleData;
}

const props = defineProps<Props>();

const emit = defineEmits(["delete", "edit"]);

const logoSrc = computed(() => {
    // Guard against missing slug
    if (!props.data.slug) return "/voltaic-logo.svg";

    // Reassign the transformations properly
    const slug = props.data.slug.trim().toLowerCase().replace(/\s+/g, "-"); // Replaces one or more spaces with a single hyphen

    return `https://www.carlogos.org/car-logos/${slug}-logo.png`;
});

// Function to handle broken external links
const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement;
    target.src = "/voltaic-logo.png";
};
</script>

<template>
    <div
        class="relative hover:bg-green-600/20 dark:hover:border-white/20 h-30 transition-all duration-300 w-60 bg-neutral-200 dark:bg-[#1A1A1A] dark:border dark:border-[#232323] rounded-xl p-5 gap-2 flex flex-col justify-between font-mono group"
    >
        <!-- <Pencil
      @click="emit('edit')"
      class="absolute top-2 right-8 w-4 hover:text-blue-600 cursor-pointer transition-all duration-300"
    ></Pencil> -->
        <Trash2
            class="absolute top-2 right-2 w-4 hover:text-red-500 cursor-pointer transition-all duration-300"
            @click="emit('delete')"
        />
        <div class="flex flex-col content-center items-start gap-3">
            <span
                class="text-md font-black uppercase text-neutral-800 dark:text-white/80 line-clamp-1 h-12 mt-2"
            >
                {{ props.data.model }}
            </span>

            <div class="flex gap-2 items-center">
                <img
                    :src="logoSrc"
                    :alt="props.data.brand"
                    @error="handleImageError"
                    class="w-16 object-contain dark:filter dark:brightness-0 dark:invert"
                />
                <div
                    v-if="!userStore.currentUser?.preferences?.hidePlates"
                    class="flex flex-col items-left gap-1"
                >
                    <span
                        class="text-sm font-bold text-neutral-600 dark:text-white/80 uppercase"
                    >
                        {{ t("plate") }}:
                    </span>
                    <span
                        class="text-sm font-bold text-neutral-800 dark:text-white/50 tracking-wider"
                    >
                        {{ props.data.plate }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
