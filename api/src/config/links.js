export const linkGroups = [
  // ── AUTH ──
  {
    match: { methods: ["POST"], path: "/api/users" },
    links: {
      login: { method: "POST", path: "/api/users/login", roles: null },
      refresh: { method: "POST", path: "/api/users/refresh", roles: null },
      forgotPassword: { method: "POST", path: "/api/users/forgot-password", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/login" },
    links: {
      register: { method: "POST", path: "/api/users", roles: null },
      refresh: { method: "POST", path: "/api/users/refresh", roles: null },
      forgotPassword: { method: "POST", path: "/api/users/forgot-password", roles: null },
      profile: { method: "GET", path: "/api/users/me", roles: ["admin", "company-manager", "worker", "client"] },
      verify: { method: "POST", path: "/api/users/verify", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/verify" },
    links: {
      profile: { method: "GET", path: "/api/users/me", roles: ["admin", "company-manager", "worker", "client"] },
      logout: { method: "POST", path: "/api/users/logout", roles: ["admin", "company-manager", "worker", "client"] },
      refresh: { method: "POST", path: "/api/users/refresh", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/forgot-password" },
    links: {
      login: { method: "POST", path: "/api/users/login", roles: null },
      register: { method: "POST", path: "/api/users", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/forgot-password/:token" },
    links: {
      resetPassword: { method: "POST", path: "/api/users/reset-password", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/reset-password" },
    links: {
      login: { method: "POST", path: "/api/users/login", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/refresh" },
    links: {
      login: { method: "POST", path: "/api/users/login", roles: null },
      register: { method: "POST", path: "/api/users", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/logout" },
    links: {
      login: { method: "POST", path: "/api/users/login", roles: null },
      register: { method: "POST", path: "/api/users", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/logout-all" },
    links: {
      login: { method: "POST", path: "/api/users/login", roles: null },
      register: { method: "POST", path: "/api/users", roles: null },
    },
  },

  // ── USERS ──
  {
    match: { methods: ["GET", "PATCH", "DELETE"], path: "/api/users/me" },
    links: {
      self: { method: "GET", path: "/api/users/me", roles: null },
      update: { method: "PATCH", path: "/api/users/me", roles: ["admin", "company-manager", "worker", "client"] },
      delete: { method: "DELETE", path: "/api/users/me", roles: ["admin", "company-manager", "worker", "client"] },
      favorites: { method: "GET", path: "/api/users/me/favorites", roles: ["admin", "company-manager", "worker", "client"] },
      vehicles: { method: "GET", path: "/api/users/me/vehicles", roles: ["admin", "company-manager", "worker", "client"] },
      usages: { method: "GET", path: "/api/users/me/usages", roles: ["admin", "company-manager", "worker", "client"] },
      tickets: { method: "GET", path: "/api/users/me/tickets", roles: ["admin", "company-manager", "worker", "client"] },
      company: { method: "GET", path: "/api/users/my_company", roles: ["company-manager", "worker"] },
      logout: { method: "POST", path: "/api/users/logout", roles: ["admin", "company-manager", "worker", "client"] },
      "logout-all": { method: "POST", path: "/api/users/logout-all", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/users/me/favorites" },
    links: {
      self: { method: "GET", path: "/api/users/me/favorites", roles: null },
      add: { method: "POST", path: "/api/users/me/favorites", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/me/favorites" },
    links: {
      favorites: { method: "GET", path: "/api/users/me/favorites", roles: null },
    },
  },
  {
    match: { methods: ["DELETE"], path: "/api/users/me/favorites/:stationId" },
    links: {
      favorites: { method: "GET", path: "/api/users/me/favorites", roles: null },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/users/me/vehicles" },
    links: {
      self: { method: "GET", path: "/api/users/me/vehicles", roles: null },
      add: { method: "POST", path: "/api/users/me/vehicles", roles: ["admin", "company-manager", "worker", "client"] },
      catalog: { method: "GET", path: "/api/vehicles", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/users/me/vehicles" },
    links: {
      vehicles: { method: "GET", path: "/api/users/me/vehicles", roles: null },
      catalog: { method: "GET", path: "/api/vehicles", roles: null },
    },
  },
  {
    match: { methods: ["PATCH", "DELETE"], path: "/api/users/me/vehicles/:plate" },
    links: {
      vehicles: { method: "GET", path: "/api/users/me/vehicles", roles: null },
      catalog: { method: "GET", path: "/api/vehicles", roles: null },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/users/me/usages" },
    links: {
      self: { method: "GET", path: "/api/users/me/usages", roles: null },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/users/me/tickets" },
    links: {
      self: { method: "GET", path: "/api/users/me/tickets", roles: null },
      create: { method: "POST", path: "/api/tickets", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/users" },
    links: {
      self: { method: "GET", path: "/api/users", roles: null },
      register: { method: "POST", path: "/api/users", roles: null },
    },
  },
  {
    match: { methods: ["GET", "PATCH", "DELETE"], path: "/api/users/:id" },
    links: {
      self: { method: "GET", path: "/api/users/:id", roles: null },
      update: { method: "PATCH", path: "/api/users/:id", roles: ["admin", "company-manager"] },
      delete: { method: "DELETE", path: "/api/users/:id", roles: ["admin"] },
      list: { method: "GET", path: "/api/users", roles: ["admin", "company-manager"] },
    },
  },

  // ── COMPANY ──
  {
    match: { methods: ["GET"], path: "/api/users/my_company" },
    links: {
      self: { method: "GET", path: "/api/users/my_company", roles: null },
      stations: { method: "GET", path: "/api/users/my_company/stations", roles: ["company-manager", "worker"] },
      tickets: { method: "GET", path: "/api/users/my_company/tickets", roles: ["company-manager", "worker"] },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/users/my_company/stations" },
    links: {
      company: { method: "GET", path: "/api/users/my_company", roles: null },
      tickets: { method: "GET", path: "/api/users/my_company/tickets", roles: ["company-manager", "worker"] },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/users/my_company/tickets" },
    links: {
      company: { method: "GET", path: "/api/users/my_company", roles: null },
      stations: { method: "GET", path: "/api/users/my_company/stations", roles: ["company-manager", "worker"] },
    },
  },

  // ── COMPANIES ──
  {
    match: { methods: ["GET"], path: "/api/companies" },
    links: {
      self: { method: "GET", path: "/api/companies", roles: null },
      create: { method: "POST", path: "/api/companies", roles: ["admin"] },
      dashboard: { method: "GET", path: "/api/companies/me/dashboard", roles: ["admin", "company-manager"] },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/companies" },
    links: {
      list: { method: "GET", path: "/api/companies", roles: null },
    },
  },
  {
    match: { methods: ["GET", "PATCH", "DELETE"], path: "/api/companies/:id" },
    links: {
      self: { method: "GET", path: "/api/companies/:id", roles: null },
      update: { method: "PATCH", path: "/api/companies/:id", roles: ["admin", "company-manager"] },
      delete: { method: "DELETE", path: "/api/companies/:id", roles: ["admin", "company-manager"] },
      groups: { method: "GET", path: "/api/companies/:id/groups", roles: ["admin", "company-manager"] },
      assignGroup: { method: "PATCH", path: "/api/companies/:id/groups/assign", roles: ["admin"] },
      unassignGroup: { method: "PATCH", path: "/api/companies/:id/groups/unassign", roles: ["admin"] },
      list: { method: "GET", path: "/api/companies", roles: null },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/companies/me/dashboard" },
    links: {
      self: { method: "GET", path: "/api/companies/me/dashboard", roles: null },
      week: { method: "GET", path: "/api/companies/me/dashboard/week", roles: ["admin", "company-manager"] },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/companies/me/dashboard/week" },
    links: {
      dashboard: { method: "GET", path: "/api/companies/me/dashboard", roles: null },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/companies/:id/groups" },
    links: {
      company: { method: "GET", path: "/api/companies/:id", roles: null },
      assignGroup: { method: "PATCH", path: "/api/companies/:id/groups/assign", roles: ["admin"] },
      unassignGroup: { method: "PATCH", path: "/api/companies/:id/groups/unassign", roles: ["admin"] },
    },
  },
  {
    match: { methods: ["PATCH"], path: "/api/companies/:id/groups/assign" },
    links: {
      groups: { method: "GET", path: "/api/companies/:id/groups", roles: null },
      unassignGroup: { method: "PATCH", path: "/api/companies/:id/groups/unassign", roles: ["admin"] },
    },
  },
  {
    match: { methods: ["PATCH"], path: "/api/companies/:id/groups/unassign" },
    links: {
      groups: { method: "GET", path: "/api/companies/:id/groups", roles: null },
      assignGroup: { method: "PATCH", path: "/api/companies/:id/groups/assign", roles: ["admin"] },
    },
  },

  // ── STATIONS ──
  {
    match: { methods: ["GET"], path: "/api/stations" },
    links: {
      self: { method: "GET", path: "/api/stations", roles: null },
      create: { method: "POST", path: "/api/stations", roles: ["admin"] },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/stations" },
    links: {
      list: { method: "GET", path: "/api/stations", roles: null },
    },
  },
  {
    match: { methods: ["GET", "PATCH", "DELETE"], path: "/api/stations/:id" },
    links: {
      self: { method: "GET", path: "/api/stations/:id", roles: null },
      update: { method: "PATCH", path: "/api/stations/:id", roles: ["admin", "company-manager", "worker"] },
      delete: { method: "DELETE", path: "/api/stations/:id", roles: ["admin"] },
      execute: { method: "POST", path: "/api/stations/:id/execute", roles: ["admin", "company-manager", "worker"] },
      usages: { method: "GET", path: "/api/stations/:id/usages", roles: ["admin", "company-manager", "worker", "client"] },
      tickets: { method: "GET", path: "/api/stations/:id/tickets", roles: ["company-manager", "worker"] },
      list: { method: "GET", path: "/api/stations", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/stations/:stationId/execute" },
    links: {
      station: { method: "GET", path: "/api/stations/:stationId", roles: null },
      usages: { method: "GET", path: "/api/stations/:stationId/usages", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/stations/:stationId/usages" },
    links: {
      station: { method: "GET", path: "/api/stations/:stationId", roles: null },
      tickets: { method: "GET", path: "/api/stations/:stationId/tickets", roles: ["company-manager", "worker"] },
    },
  },
  {
    match: { methods: ["GET"], path: "/api/stations/:stationId/tickets" },
    links: {
      station: { method: "GET", path: "/api/stations/:stationId", roles: null },
      usages: { method: "GET", path: "/api/stations/:stationId/usages", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },

  // ── TICKETS ──
  {
    match: { methods: ["GET"], path: "/api/tickets" },
    links: {
      self: { method: "GET", path: "/api/tickets", roles: null },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/tickets" },
    links: {
      list: { method: "GET", path: "/api/tickets", roles: ["admin"] },
    },
  },
  {
    match: { methods: ["GET", "PATCH", "DELETE"], path: "/api/tickets/:id" },
    links: {
      self: { method: "GET", path: "/api/tickets/:id", roles: null },
      update: { method: "PATCH", path: "/api/tickets/:id", roles: ["admin", "company-manager"] },
      delete: { method: "DELETE", path: "/api/tickets/:id", roles: ["admin"] },
      list: { method: "GET", path: "/api/tickets", roles: ["admin"] },
    },
  },

  // ── USAGES ──
  {
    match: { methods: ["GET"], path: "/api/usages" },
    links: {
      self: { method: "GET", path: "/api/usages", roles: null },
      start: { method: "POST", path: "/api/usages", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/usages" },
    links: {
      list: { method: "GET", path: "/api/usages", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["GET", "PATCH"], path: "/api/usages/:id" },
    links: {
      self: { method: "GET", path: "/api/usages/:id", roles: null },
      end: { method: "PATCH", path: "/api/usages/:id", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },

  // ── VEHICLES (catalog) ──
  {
    match: { methods: ["GET"], path: "/api/vehicles" },
    links: {
      self: { method: "GET", path: "/api/vehicles", roles: null },
    },
  },

  // ── LOGS ──
  {
    match: { methods: ["GET"], path: "/api/logs" },
    links: {
      self: { method: "GET", path: "/api/logs", roles: null },
      create: { method: "POST", path: "/api/logs", roles: ["admin", "company-manager", "worker", "client"] },
    },
  },
  {
    match: { methods: ["POST"], path: "/api/logs" },
    links: {
      list: { method: "GET", path: "/api/logs", roles: null },
    },
  },
  {
    match: { methods: ["DELETE"], path: "/api/logs/:id" },
    links: {
      list: { method: "GET", path: "/api/logs", roles: null },
    },
  },
];
