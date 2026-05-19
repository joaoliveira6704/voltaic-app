<script setup lang="ts">
import { Skeleton } from "~/components/ui/Skeleton"
</script>

<template>
  <div
    class="relative w-60 bg-neutral-200 dark:bg-[#1A1A1A] dark:border dark:border-[#232323] rounded-xl p-5 gap-2 flex flex-col justify-between"
    style="height: 120px"
  >
    <Skeleton class="absolute top-2 right-2 h-4 w-4" />
    <div class="flex flex-col content-center items-start gap-3">
      <Skeleton class="h-5 w-40 mt-2" />
      <div class="flex gap-2 items-center">
        <Skeleton class="h-10 w-16" />
        <div class="flex flex-col items-left gap-1">
          <Skeleton class="h-3 w-8" />
          <Skeleton class="h-4 w-20" />
        </div>
      </div>
    </div>
  </div>
</template>
