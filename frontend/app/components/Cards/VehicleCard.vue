<script setup lang="ts">
import { Wrench, Trash2 } from "lucide-vue-next";
import { type NavItem } from "@/utils/navigation"; // Reusing your NavItem definition

interface VehicleData {
  id: number;
  brand: string; // e.g., 'BMW'
  model: string; // e.g., 'iX3'
  plate: string; // e.g., '09 - EL - 53'
  logoUrl?: string; // Optional custom logo path
}

interface Props {
  data: VehicleData;
}

const props = defineProps<Props>();

const logoSrc =
  "https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo-700x394.png"; // Placeholder
</script>

<template>
  <div
    class="relative w-60 h-fit bg-neutral-200 rounded-xl p-5 gap-2 flex flex-col justify-between font-mono group"
  >
    <div class="flex items-start gap-3">
      <span class="text-md font-black uppercase text-neutral-800">
        {{ data.model }}
      </span>
    </div>

    <div class="flex items-center gap-6">
      <div class="flex flex-row gap-1 items-center">
        <span class="text-xs font-bold text-neutral-600 uppercase">
          Plate:
        </span>
        <span class="text-sm font-bold text-neutral-800 tracking-wider">
          {{ data.plate }}
        </span>
      </div>
    </div>
  </div>
</template>
