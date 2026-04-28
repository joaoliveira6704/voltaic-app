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

export type UserRole = "admin" | "company" | "worker" | "client";

export interface NavItem {
  label: string;
  icon: Component;
  path: string;
}

export const NAVIGATION_MAP: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Tickets", icon: Ticket, path: "" },
    { label: "Users", icon: Users, path: "" },
    { label: "Stations", icon: Zap, path: "" },
    { label: "Logout", icon: LogOut, path: "" },
  ],
  company: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Stations", icon: Zap, path: "" },
    { label: "Tickets", icon: Ticket, path: "" },
    { label: "Personel", icon: Users, path: "" },
    { label: "Logout", icon: LogOut, path: "/" },
  ],
  worker: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Assigned Tickets", icon: Ticket, path: "" },
    { label: "Logout", icon: LogOut, path: "/" },
  ],
  client: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Favorite Stations", icon: Zap, path: "" },
    { label: "History", icon: History, path: "" },
    { label: "Logout", icon: LogOut, path: "/" },
  ],
};
