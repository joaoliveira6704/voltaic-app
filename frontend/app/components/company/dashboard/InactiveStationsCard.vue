<script setup lang="ts">
import { AlertTriangle, CheckCircle2 } from "lucide-vue-next";

interface InactiveStation {
  stationId: string;
  name: string;
}

defineProps<{ inactive: InactiveStation[] }>();
</script>

<template>
  <DashboardCard title="Station Activity" :has-line="false">
    <CardContent class="flex flex-col items-center justify-center gap-3 py-6">
      <!-- All active -->
      <template v-if="inactive.length === 0">
        <CheckCircle2 class="w-8 h-8 text-[#00c885]" />
        <p class="text-sm font-bold text-[#00c885] uppercase">
          All stations active
        </p>
        <p class="text-xs text-gray-400">No inactive stations this week</p>
      </template>

      <!-- Inactive count -->
      <template v-else>
        <AlertTriangle class="w-8 h-8 text-red-400" />
        <p class="text-3xl font-semibold text-red-400">{{ inactive.length }}</p>
        <p class="text-xs text-gray-400 uppercase font-bold">
          Stations inactive this week
        </p>
      </template>
    </CardContent>
  </DashboardCard>
</template>
