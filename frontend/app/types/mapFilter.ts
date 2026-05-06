import type { Component } from "vue";

export type MapFilterKey = "favs" | "compatible" | "free";

export interface MapFilter {
  key: MapFilterKey;
  label: string;
  icon: Component;
  active: boolean;
}
