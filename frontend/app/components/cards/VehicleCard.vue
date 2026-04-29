<script setup lang="ts">
import { Pencil, Trash2 } from "lucide-vue-next";

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

const logoSrc = computed(
  () => `https://www.carlogos.org/car-logos/${props.data.slug}-logo.png`,
);
</script>

<template>
  <div
    class="relative hover:bg-green-600/20 transition-all duration-300 w-60 h-fit bg-neutral-200 rounded-xl p-5 gap-2 flex flex-col justify-between font-mono group"
  >
    <Pencil
      @click="emit('edit')"
      class="absolute top-2 right-8 w-4 hover:text-blue-600 cursor-pointer transition-all duration-300"
    ></Pencil>
    <Trash2
      @click="emit('delete')"
      class="absolute top-2 right-2 w-4 hover:text-red-500 cursor-pointer transition-all duration-300"
    ></Trash2>
    <div class="flex flex-col content-center items-start gap-3">
      <span
        class="text-md font-black uppercase text-neutral-800 line-clamp-2 h-12"
      >
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
