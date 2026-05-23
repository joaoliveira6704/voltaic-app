<script setup lang="ts">
import { TrendingUp, TrendingDown, Minus } from "lucide-vue-next";

interface Usage {
  thisWeek: number;
  lastWeek: number;
  percentageDelta: number;
}

defineProps<{ usage: Usage }>();
</script>

<template>
  <DashboardCard title="Weekly Usage" :has-line="false">
    <CardContent class="py-4 flex items-center justify-center">
      <div class="w-full h-[260px] flex flex-col justify-center gap-4 px-4">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-xs text-gray-400 uppercase font-bold">This Week</p>
            <p class="text-3xl font-semibold">{{ usage.thisWeek }}</p>
          </div>
          <div class="space-y-1 text-right">
            <p class="text-xs text-gray-400 uppercase font-bold">Last Week</p>
            <p class="text-3xl font-semibold text-gray-400">
              {{ usage.lastWeek }}
            </p>
          </div>
        </div>
        <div class="h-px bg-gray-100 dark:bg-[#2a2a2a]" />
        <div class="flex items-center gap-2">
          <TrendingUp
            v-if="usage.percentageDelta > 0"
            class="w-5 h-5 text-[#00c885]"
          />
          <TrendingDown
            v-else-if="usage.percentageDelta < 0"
            class="w-5 h-5 text-red-400"
          />
          <Minus v-else class="w-5 h-5 text-gray-400" />
          <span
            :class="[
              'text-sm font-bold',
              usage.percentageDelta > 0
                ? 'text-[#00c885]'
                : usage.percentageDelta < 0
                  ? 'text-red-400'
                  : 'text-gray-400',
            ]"
          >
            {{ usage.percentageDelta > 0 ? "+" : ""
            }}{{ usage.percentageDelta }}% vs last week
          </span>
        </div>
      </div>
    </CardContent>
  </DashboardCard>
</template>
