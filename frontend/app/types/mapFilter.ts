import type { Component } from "vue";

export type MapFilterKey = "favs" | "compatible" | "free" | "company";

export interface MapFilter {
  key: MapFilterKey;
  label: string;
  labelKey: string;
  icon: Component;
  active: boolean;
}
