<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Skeleton } from "~/components/ui/Skeleton";
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";
import { Map, Menu } from "lucide-vue-next";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "~/components/ui/sheet";

const { t } = useI18n();
const userStore = useUserStore();

const currentUser = userStore.currentUser;
const isLoaded = true;

const navLinks = [{ path: "/map", label: t("nav.map") }];
</script>

<template>
    <div
        class="h-screen w-full flex flex-col bg-white dark:bg-[#0a0a0a] dark:text-white dark:selection:bg-white dark:selection:text-[#0a0a0a]"
    >
        <nav
            class="shrink-0 w-full border-b border-gray-100 bg-white dark:bg-[#0a0a0a] dark:text-white dark:border-[#232323]"
        >
            <div
                class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8"
            >
                <div class="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger as-child>
                            <Button variant="ghost" class="md:hidden">
                                <Menu class="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            class="w-[240px] sm:max-w-[240px] p-0"
                        >
                            <SheetTitle class="sr-only">{{
                                t("layout.navigation")
                            }}</SheetTitle>
                            <div
                                class="flex flex-col justify-between h-full p-4 bg-white dark:bg-[#171717]"
                            >
                                <template v-if="isLoaded">
                                    <NavGroup
                                        :role="currentUser?.role"
                                        class="mt-8"
                                    />
                                </template>
                                <template v-else>
                                    <div class="flex flex-col gap-2 py-1">
                                        <Skeleton class="h-8 w-full" />
                                        <Skeleton class="h-8 w-full" />
                                    </div>
                                </template>
                                <LowerCard />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <NuxtLink to="/" class="flex items-center gap-1">
                        <NuxtImg src="/voltaic-logo.svg" width="50" />
                    </NuxtLink>
                </div>

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
            <div class="hidden md:flex flex-col py-4 md:pl-2 justify-between">
                <DashboardCard>
                    <template v-if="isLoaded">
                        <NavGroup :role="currentUser?.role" />
                    </template>
                    <template v-else>
                        <div class="flex flex-col gap-2 py-1">
                            <Skeleton class="h-8 w-full" />
                            <Skeleton class="h-8 w-full" />
                        </div>
                    </template>
                </DashboardCard>

                <DashboardCard :hasTitle="false">
                    <LowerCard />
                </DashboardCard>
            </div>
            <slot class="flex-1 min-w-0 overflow-y-auto" />
        </main>

        <Toaster position="top-right" richColors closeButton theme="dark" />
    </div>
</template>
