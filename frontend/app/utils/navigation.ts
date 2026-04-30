// utils/navigation.ts
import {
  LayoutDashboard,
  Users,
  History,
  Zap,
  Ticket,
  LogOut,
  Shield,
} from "lucide-vue-next";
import type { Component } from "vue";

export type UserRole = "admin" | "company-manager" | "worker" | "client";

export interface NavItem {
  label: string;
  icon: Component;
  path?: string | null;
  action?: string | null;
}

export const ROLE_EXTRA_LINK: Partial<Record<UserRole, NavItem>> = {
  admin: { label: "Admin Page", icon: Shield, path: "/admin" },
  "company-manager": { label: "Manager Page", icon: Users, path: "/manager" },
  worker: { label: "Worker Page", icon: Ticket, path: "/worker" },
};

export const NAVIGATION_MAP: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Tickets", icon: Ticket, path: "" },
    { label: "Users", icon: Users, path: "" },
    { label: "Stations", icon: Zap, path: "" },
    { label: "Logout", icon: LogOut, action: "logout" },
  ],
  "company-manager": [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Stations", icon: Zap, path: "" },
    { label: "Tickets", icon: Ticket, path: "" },
    { label: "Personnel", icon: Users, path: "" },
    { label: "Logout", icon: LogOut, action: "logout" },
  ],
  worker: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Assigned Tickets", icon: Ticket, path: "" },
    { label: "Logout", icon: LogOut, action: "logout" },
  ],
  client: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: "Favorite Stations", icon: Zap, path: "" },
    { label: "History", icon: History, path: "" },
    { label: "Logout", icon: LogOut, action: "logout" },
  ],
};
