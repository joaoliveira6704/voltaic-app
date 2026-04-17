<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/login", label: "Login" },
  { path: "/signup", label: "Signup" },
];
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-white font-mono overflow-scroll">
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

    <footer class="shrink-0 w-full border-t border-gray-100 bg-white py-4">
      <div
        class="container mx-auto max-w-7xl px-4 md:px-8 flex justify-between items-center"
      >
        <Label class="text-[10px] text-gray-400 uppercase tracking-widest"
          >© 2026 Voltaic</Label
        >
        <div class="flex gap-4">
          <Button variant="link" class="p-0 h-auto text-[10px] text-gray-400"
            >Privacy</Button
          >
          <Button variant="link" class="p-0 h-auto text-[10px] text-gray-400"
            >Terms</Button
          >
        </div>
      </div>
    </footer>
  </div>
</template>
