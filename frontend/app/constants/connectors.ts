export const ALL_CONNECTORS = [
  "ccs1",
  "ccs2",
  "chademo",
  "gb_t_ac",
  "gb_t_dc",
  "nacs",
  "type1",
  "type2",
] as const;

export type ConnectorType = (typeof ALL_CONNECTORS)[number];

export const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  ccs1: "CCS1",
  ccs2: "CCS2",
  chademo: "CHAdeMO",
  gb_t_ac: "GB/T AC",
  gb_t_dc: "GB/T DC",
  nacs: "NACS (Tesla)",
  type1: "Type 1 (J1772)",
  type2: "Type 2 (Mennekes)",
};
