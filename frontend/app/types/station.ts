export type StationState = "available" | "unavailable" | "inactive";

export interface StationLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat] — GeoJSON convention
}

export interface StationConnector {
  socketTypes: string[];
  maxPower: number;
}

export interface StationTelemetry {
  amperage: number;
  voltage: number;
  temperature: number;
}

export interface Station {
  stationId: string;
  title: string;
  companyId: string;
  location: StationLocation;
  connector: StationConnector;
  telemetry: StationTelemetry;
  state: StationState;
  alive: boolean;
}
