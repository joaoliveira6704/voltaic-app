export interface Ticket {
  ticketId: string;
  title: string;
  description: string;
  stationId?: string;
  companyId?: string;
  createdBy?: string;
  remarks?: string;
  status: "open" | "closed" | "resolved" | "unresolved";
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  tickets: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
