export const ALL_CONNECTORS = [
  "Type2",
  "CHAdeMO",
  "CCS/SAE",
  "Type3",
  "Tesla",
  "J-1772",
  "Wall_Euro",
  "Caravan_Mains_Socket",
  "Dual_J-1772",
  "Dual_CHAdeMO",
  "Mennekes",
  "Dual_Mennekes",
  "Other",
] as const;

export type ConnectorType = (typeof ALL_CONNECTORS)[number];
