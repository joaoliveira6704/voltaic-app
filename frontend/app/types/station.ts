export type StationState = "available" | "unavailable" | "maintenance";

export interface Station {
  stationId: string;
  title: string;
  companyId: string;
  groupId?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  connector: {
    socketTypes: string[];
    maxPower: number;
  };
  telemetry: {
    amperage: number;
    voltage: number;
    temperature: number;
  };
  state: StationState;
  alive: boolean;
}
