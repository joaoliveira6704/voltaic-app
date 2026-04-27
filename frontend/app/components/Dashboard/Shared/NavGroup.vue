<script setup lang="ts">
// 1. Import the constant and the types from your utils file
import { NAVIGATION_MAP, type UserRole } from "@/utils/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  role: UserRole;
}

const props = defineProps<Props>();
const route = useRoute();

/** * 2. We no longer need the massive navigationMap object here!
 * We just reference the imported NAVIGATION_MAP.
 */
const currentLinks = computed(() => NAVIGATION_MAP[props.role] || []);
</script>

<template>
  <nav class="flex flex-col w-full gap-1 font-mono">
    <Button
      v-for="link in currentLinks"
      :key="link.label"
      :variant="route.path === link.path ? 'secondary' : 'ghost'"
      as-child
      class="w-full justify-start gap-3 h-11 px-4 transition-all group"
    >
      <NuxtLink :to="link.path">
        <component
          :is="link.icon"
          :class="[
            'h-4 w-4 shrink-0 transition-colors',
            route.path === link.path
              ? 'text-blue-600'
              : 'text-gray-400 group-hover:text-black',
          ]"
        />
        <span class="text-xs font-bold uppercase tracking-tight">
          {{ link.label }}
        </span>
      </NuxtLink>
    </Button>
  </nav>
</template>
