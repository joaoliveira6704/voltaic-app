<script setup lang="ts">
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAVIGATION_MAP, type UserRole } from "@/utils/navigation";

interface Props {
    role: UserRole;
}

const props = defineProps<Props>();
const route = useRoute();

const navLinks = computed(() =>
    currentLinks.value.filter((l) => l.label !== "Logout"),
);
const logoutLink = computed(() =>
    currentLinks.value.find((l) => l.label === "Logout"),
);

const currentLinks = computed(() => {
    const isProfilePage = route.path.startsWith("/profile");

    if (isProfilePage) {
        const base = NAVIGATION_MAP["client"];
        const extra = ROLE_EXTRA_LINK[props.role];
        const logout = base.find((l) => l.action === "logout");
        const withoutLogout = base.filter((l) => l.action !== "logout");
        return [
            ...withoutLogout,
            ...(extra ? [extra] : []),
            ...(logout ? [logout] : []),
        ];
    }

    return NAVIGATION_MAP[props.role] || [];
});
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button
                variant="ghost"
                size="icon"
                class="h-10 w-10 lg:hidden absolute right-0"
            >
                <Menu class="h-6 w-6" />
                <span class="sr-only">Toggle menu</span>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-56 font-mono bg-white">
            <DropdownMenuItem
                v-for="link in navLinks"
                :key="link.label"
                class="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                :class="{ 'bg-secondary': route.path === link.path }"
                @click="navigateTo(link.path)"
            >
                <component
                    :is="link.icon"
                    :class="[
                        'h-4 w-4',
                        route.path === link.path
                            ? 'text-blue-600'
                            : 'text-muted-foreground',
                    ]"
                />
                <span class="text-xs font-bold uppercase">{{
                    link.label
                }}</span>
            </DropdownMenuItem>

            <template v-if="logoutLink">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    class="flex items-center gap-3 px-3 py-2.5 cursor-pointer text-red-600 focus:text-red-600"
                    @click="navigateTo(logoutLink.path)"
                >
                    <component :is="logoutLink.icon" class="h-4 w-4" />
                    <span class="text-xs font-bold uppercase">{{
                        logoutLink.label
                    }}</span>
                </DropdownMenuItem>
            </template>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
