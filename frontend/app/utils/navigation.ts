import {
  LayoutDashboard,
  Users,
  History,
  Zap,
  Ticket,
  Shield,
  Building2,
} from "lucide-vue-next";
import type { Component } from "vue";

export type UserRole = "admin" | "company-manager" | "worker" | "client";

export interface NavItem {
  label: string;
  icon: Component;
  path?: string | null;
  action?: string | null;
}

type TFunction = (key: string) => string;

export const getRoleExtraLink = (
  t: TFunction,
): Partial<Record<UserRole, NavItem>> => ({
  admin: { label: t("nav.admin"), icon: Shield, path: "/admin" },
  "company-manager": {
    label: t("nav.companyManager"),
    icon: Users,
    path: "/manager",
  },
  worker: { label: t("nav.worker"), icon: Ticket, path: "/worker" },
});

export const getNavigationMap = (
  t: TFunction,
): Record<UserRole, NavItem[]> => ({
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: t("nav.users"), icon: Users, path: "/admin/users" },
    { label: t("nav.stations"), icon: Zap, path: "/admin/stations" },
    { label: t("nav.tickets"), icon: Ticket, path: "/admin/tickets" },
    {
      label: t("nav.companies"),
      icon: Building2,
      path: "/admin/companies",
    },
  ],
  "company-manager": [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: t("nav.stations"), icon: Zap, path: "" },
    { label: t("nav.tickets"), icon: Ticket, path: "" },
    { label: t("nav.personnel"), icon: Users, path: "" },
  ],
  worker: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/profile" },
    { label: t("nav.assignedTickets"), icon: Ticket, path: "" },
  ],
  client: [
    { label: t("nav.map"), icon: LayoutDashboard, path: "/map" },
    { label: t("nav.favoriteStations"), icon: Zap, path: "" },
    { label: t("nav.history"), icon: History, path: "" },
  ],
});
