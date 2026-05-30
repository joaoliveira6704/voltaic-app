export const AdminUserColumns = [
  { key: "username", label: "Username" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "company", label: "Company" },
  { key: "vehicles", label: "Vehicles" },
];

export const CompanyPersonnelColumns = [
  { key: "username", label: "Username" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "actions", label: "" },
];

export const AdminStationColumns = [
  { key: "stationId", label: "Station ID" },
  { key: "title", label: "Name" },
  { key: "location", label: "Location" },
  { key: "connector.socketTypes", label: "Socket Types" },
  { key: "connector.maxPower", label: "Max Power" },
  { key: "state", label: "State" },
];

export const AdminTicketColumns = [
  { key: "ticketId", label: "Ticket ID" },
  { key: "createdBy", label: "Created By" },
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "remarks", label: "Remarks" },
  { key: "status", label: "Status" },
];

export const TicketStatus = [
  {
    key: "open",
    label: "Open",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-800",
  },
  {
    key: "resolved",
    label: "Resolved",
    color: "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-800",
  },
  {
    key: "unresolved",
    label: "Unresolved",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-200 dark:text-purple-900",
  },
  { key: "closed", label: "Closed", color: "bg-red-100 text-red-800" },
];

export const AdminCompanyColumns = [
  { key: "companyId", label: "ID" },
  { key: "name", label: "Name" },
  { key: "members", label: "Members" },
];

export const UserRoles = [
  { key: "admin", color: "blue" },
  { key: "client", color: "green" },
  { key: "company-manager", color: "purple" },
  { key: "worker", color: "orange" },
];

export const TicketStates = [
  { key: "open", label: "Open", color: "bg-blue-100 text-blue-800" },
  { key: "resolved", label: "Resolved", color: "bg-green-100 text-green-800" },
  {
    key: "unresolved",
    label: "Unresolved",
    color: "bg-purple-100 text-purple-800",
  },
  { key: "closed", label: "Closed", color: "bg-red-100 text-red-800" },
];

export const colorMap = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  purple: "bg-purple-100 text-purple-800",
  orange: "bg-orange-100 text-orange-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
};
