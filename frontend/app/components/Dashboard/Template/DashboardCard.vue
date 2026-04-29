<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  editButton?: boolean;
  logoutButton?: boolean;
  buttonText?: string;
  scrollable?: boolean;
}

defineProps<Props>();

const emit = defineEmits(["edit", "logout"]);
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
      <div class="flex gap-2">
        <Button
          v-if="editButton"
          variant="outline"
          class="hover:bg-green-600 hover:text-white"
          >{{ buttonText }}</Button
        >
        <Button
          v-if="logoutButton"
          class="text-white bg-red-600 hover:bg-red-700"
          @click="emit('logout')"
          >Logout</Button
        >
      </div>
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
