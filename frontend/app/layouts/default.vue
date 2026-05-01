<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Map } from "lucide-vue-next";

const navLinks = [{ path: "/", label: "Map" }]; /* link map page */
const { t } = useI18n();
const userStore = useUserStore();

const currentUser = userStore.currentUser;
</script>

<template>
    <div class="h-screen w-full flex flex-col bg-white font-mono">
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
                        class="text-sm"
                    >
                        <!-- <NuxtLink :to="link.path" active-class="text-[#007bff]">{{
              link.label
            }}</NuxtLink> -->
                        <NuxtLink :to="link.path" active-class="text-[#007bff]">
                            <Map class="w-10 h-10" />
                        </NuxtLink>
                    </Button>
                </div>
            </div>
        </nav>

        <main class="flex pl-4 w-full h-screen gap-5 overflow-y-auto">
            <div class="flex flex-col py-4 pl-2 justify-between">
                <DashboardCard :title="t('profile')">
                    <NavGroup :role="currentUser?.role" />
                </DashboardCard>

                <DashboardCard :hasTitle="false">
                    <LowerCard />
                </DashboardCard>
            </div>
            <slot class="flex-1 min-w-0 overflow-y-auto" />
        </main>
    </div>
</template>
