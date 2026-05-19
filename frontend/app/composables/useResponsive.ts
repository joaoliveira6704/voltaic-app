import { ref, onMounted, onUnmounted } from "vue";

export function useResponsive(breakpoint = 768) {
  const isMobile = ref(false);

  function init() {
    isMobile.value = window.innerWidth < breakpoint;
  }

  let debounceTimer: ReturnType<typeof setTimeout>;
  function onResize() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      isMobile.value = window.innerWidth < breakpoint;
    }, 150);
  }

  onMounted(() => {
    init();
    window.addEventListener("resize", onResize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    clearTimeout(debounceTimer);
  });

  return { isMobile };
}
