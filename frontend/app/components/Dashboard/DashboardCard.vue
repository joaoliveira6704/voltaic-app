<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Props {
  title?: string;
  description?: string;
  button?: boolean;
  buttonText?: string;
  scrollable?: boolean;
}

defineProps<Props>();
</script>

<template>
  <Card
    class="h-fit w-full flex flex-col border-gray-100 shadow-sm overflow-hidden font-mono"
  >
    <CardHeader
      v-if="title || description"
      class="shrink-0 pb-4 flex flex-row justify-between"
    >
      <CardTitle
        v-if="title"
        class="text-xs font-bold uppercase tracking-widest text-gray-400"
      >
        {{ title }}
      </CardTitle>
      <Button v-if="button" variant="outline">{{ buttonText }}</Button>
      <CardDescription v-if="description" class="text-[10px]">
        {{ description }}
      </CardDescription>
    </CardHeader>

    <CardContent
      :class="[
        'flex-1 min-h-0 p-6 pt-0  w-fit flex-col',
        scrollable ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden',
      ]"
    >
      <slot />
    </CardContent>

    <CardFooter
      v-if="$slots.footer"
      class="shrink-0 pt-4 border-t border-gray-50"
    >
      <slot name="footer" />
    </CardFooter>
  </Card>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f1f1;
  border-radius: 10px;
}
</style>
