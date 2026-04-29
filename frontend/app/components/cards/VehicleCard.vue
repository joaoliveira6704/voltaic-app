<script setup lang="ts">
import { Pencil, Trash2, Trash } from "lucide-vue-next";
/* import { type NavItem } from "@/utils/navigation"; // Reusing your NavItem definition */

interface VehicleData {
  id: number;
  brand: string; // e.g., 'BMW'
  model: string; // e.g., 'iX3'
  plate: string; // e.g., '09 - EL - 53'
  slug?: string; // e.g., 'bmw' (used for logo fetching)
}

interface Props {
  data: VehicleData;
}

const props = defineProps<Props>();

const logoSrc = computed(
  () => `https://www.carlogos.org/car-logos/${props.data.slug}-logo.png`,
);
</script>

<template>
  <div
    class="relative w-60 h-fit bg-neutral-200 rounded-xl p-5 gap-2 flex flex-col justify-between font-mono group"
  >
    <Pencil
      class="absolute top-2 right-8 w-5 hover:text-blue-600 cursor-pointer transition-all duration-300"
    ></Pencil>
    <Trash2
      class="absolute top-2 right-2 w-5 hover:text-red-500 cursor-pointer transition-all duration-300"
    ></Trash2>
    <div class="flex flex-col content-center items-start gap-3">
      <span class="text-md font-black uppercase text-neutral-800">
        {{ props.data.model }}
      </span>

      <div class="flex gap-2 items-center">
        <img :src="logoSrc" :alt="$props.data.slug" class="w-16" />
        <div class="flex flex-col items-left gap-1">
          <span class="text-sm font-bold text-neutral-600 uppercase">
            Plate:
          </span>
          <span class="text-sm font-bold text-neutral-800 tracking-wider">
            {{ props.data.plate }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
