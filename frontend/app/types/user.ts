// types/user.ts — extract User interface so it can be shared
export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password?: string;
  currentPassword?: string;
  newPassword?: string;
  role: "client" | "worker" | "company-manager" | "admin";
  vehicles?: Vehicle[];
  assignedTickets?: any[];
  tickets?: any[];
  preferences?: Preferences;
  favorites?: string[];
}

export interface Preferences {
  darkMode: boolean;
  language: "en" | "pt" | "es";
  hidePlates: boolean;
}

export interface Vehicle {
  plate: string;
  model: string;
  slug: string;
  color: string;
  connector: string;
}
