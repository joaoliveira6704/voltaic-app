<script setup lang="ts">
import { Skeleton } from "~/components/ui/Skeleton"

defineProps<{
  lines?: number
}>()
</script>

<template>
  <div
    class="h-fit w-full flex flex-col items-center lg:items-start border border-gray-100 dark:border-[#232323] rounded-xl p-6 gap-3 dark:bg-[#171717]"
  >
    <Skeleton class="h-4 w-[100px]" />
    <Skeleton class="h-8 w-[60px]" />
    <Skeleton class="h-3 w-[80px]" />
  </div>
</template>
