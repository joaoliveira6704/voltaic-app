export interface Ticket {
  ticketId: string;
  title: string;
  description: string;
  stationId?: number;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  remarks?: string;
  status: "open" | "closed" | "resolved" | "unresolved";
  createdBy?: string;
}
