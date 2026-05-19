export interface Ticket {
  ticketId: string;
  title: string;
  description: string;
  stationId?: string;
  companyId?: string;
  createdBy?: string;
  createdByUser?: {
    firstName: string;
    lastName: string;
    username: string;
  } | null;
  station?: {
    title: string;
  } | null;
  remarks?: string;
  status: "open" | "closed" | "resolved" | "unresolved";
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
