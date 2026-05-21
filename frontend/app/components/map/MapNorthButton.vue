<template>
  <div class="absolute bottom-8 right-4 z-7">
    <button
      class="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 shadow-md hover:bg-white transition-all duration-200 group"
      :aria-label="t('map.north.ariaLabel')"
      :title="t('map.north.title')"
      @click="emit('click')"
    >
      <Navigation
        class="w-5 h-5 text-gray-700 transition-transform duration-300 group-hover:text-[#22c55e]"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Navigation } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits<{ click: [] }>();
</script>
