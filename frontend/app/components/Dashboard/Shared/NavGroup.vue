<script setup lang="ts">
import {
  LayoutDashboard,
  Users,
  Settings,
  History,
  Zap,
  Truck,
  LifeBuoy,
  ClipboardList,
  Ticket,
  LogOut,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";

type UserRole = "Admin" | "Company" | "Worker" | "User";

interface Props {
  role: UserRole;
}

interface NavItem {
  label: string;
  icon: Component;
  path: string;
}

const props = defineProps<Props>();
const route = useRoute();

const navigationMap: Record<UserRole, NavItem[]> = {
  Admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Tickets", icon: Ticket, path: "/profile/users" },
    { label: "Users", icon: Users, path: "/profile/logs" },
    { label: "Stations", icon: Zap, path: "/profile/settings" },
    { label: "Logout", icon: LogOut, path: "/profile/kb" },
  ],
  Company: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Stations", icon: Zap, path: "/profile/stations" },
    { label: "Tickets", icon: Ticket, path: "/profile/history" },
    { label: "Personel", icon: Users, path: "/profile/payments" },
    { label: "Logout", icon: LogOut, path: "/profile/kb" },
  ],
  Worker: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Assigned Tickets", icon: Ticket, path: "/profile/jobs" },
    { label: "Logout", icon: LogOut, path: "/profile/kb" },
  ],
  User: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Favorite Stations", icon: Zap, path: "/profile/chats" },
    { label: "History", icon: History, path: "/profile/kb" },
    { label: "Logout", icon: LogOut, path: "/profile/kb" },
  ],
};

// Get the current links based on the passed prop
const currentLinks = computed(() => navigationMap[props.role] || []);
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
