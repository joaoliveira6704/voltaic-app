<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const navLinks = [{ path: "/", label: "Map" }]; /* link map page */
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-white font-mono overflow-hidden">
    <nav class="shrink-0 w-full border-b border-gray-100 bg-white">
      <div
        class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8"
      >
        <NuxtLink to="/" class="flex items-center gap-1">
          <NuxtImg src="/voltaic-logo.svg" width="50" />
        </NuxtLink>

        <div class="flex items-center gap-1">
          <Button
            v-for="link in navLinks"
            :key="link.path"
            variant="ghost"
            as-child
            class="text-xs"
          >
            <NuxtLink :to="link.path" active-class="text-[#007bff]">{{
              link.label
            }}</NuxtLink>
          </Button>
        </div>
      </div>
    </nav>

    <main class="flex-1 overflow-hidden">
      <slot />
    </main>

    <footer class="shrink-0 w-full border-t border-gray-100 bg-green-500 py-4">
      <div></div>
    </footer>
  </div>
</template>
