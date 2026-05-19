<script setup lang="ts">
import { Skeleton } from "~/components/ui/Skeleton"
</script>

<template>
  <div
    class="border px-4 py-5 rounded-xl bg-white/80 dark:bg-[#232323] dark:border-[#2a2a2a] flex flex-col gap-0 h-full"
  >
    <div class="flex justify-between gap-2 items-start mb-3">
      <Skeleton class="h-6 w-[140px]" />
      <Skeleton class="h-5 w-16 rounded-full" />
    </div>
    <div class="flex-1 space-y-2">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-4/5" />
      <Skeleton class="h-4 w-2/3" />
    </div>
    <div class="flex justify-end mt-3 pt-3 border-t border-[#2a2a2a]">
      <Skeleton class="h-3 w-24" />
    </div>
  </div>
</template>
