<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  hasBtn?: boolean;
  buttonText?: string;
  scrollable?: boolean;
}

defineProps<Props>();

defineEmits(["btnClick"]);
</script>

<template>
  <Card
    class="h-fit w-full flex flex-col items-center lg:items-start border-gray-100 shadow-sm overflow-hidden font-mono"
  >
    <CardHeader
      v-if="title || description"
      class="shrink-0 pb-0 flex flex-row justify-between w-full"
    >
      <CardTitle
        v-if="title"
        class="text-xs font-bold uppercase tracking-widest text-gray-400 pt-0"
      >
        {{ title }}
      </CardTitle>

      <Button
        v-if="hasBtn"
        class="hover:bg-green-600 hover:text-white"
        variant="outline"
        @click="$emit('btnClick')"
        >{{ buttonText }}</Button
      >
    </CardHeader>

    <CardContent
      :class="[
        'flex-1 min-h-0 p-4 pb-0 pt-0  w-fit flex-col',
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
