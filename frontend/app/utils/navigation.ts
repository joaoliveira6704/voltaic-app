// utils/navigation.ts
import {
  LayoutDashboard,
  Users,
  History,
  Zap,
  Ticket,
  LogOut,
} from "lucide-vue-next";
import type { Component } from "vue";

export type UserRole = "Admin" | "Company" | "Worker" | "User";

export interface NavItem {
  label: string;
  icon: Component;
  path: string;
}

export const NAVIGATION_MAP: Record<UserRole, NavItem[]> = {
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
