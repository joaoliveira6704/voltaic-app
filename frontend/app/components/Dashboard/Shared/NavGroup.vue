<script setup lang="ts">
import { NAVIGATION_MAP, type UserRole } from "@/utils/navigation";
import { Button } from "@/components/ui/button";

interface Props {
    role: UserRole;
}

const props = defineProps<Props>();
const route = useRoute();
const emit = defineEmits(["logout"]);

// Helper to handle the click logic
const handleLinkClick = (action: string, event: Event) => {
    if (action === "logout") {
        event.preventDefault(); // Stop NuxtLink from navigating
        emit("logout");
    }
};

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
    <nav class="flex flex-col w-full gap-1 font-mono">
        <Button
            v-for="link in currentLinks"
            :key="link.label"
            :variant="route.path === link.path ? 'secondary' : 'ghost'"
            as-child
            class="w-full justify-start gap-3 h-11 px-4 transition-all group cursor-pointer"
        >
            <NuxtLink
                :to="link.path || ''"
                @click="(e) => handleLinkClick(link.action || '', e)"
            >
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
