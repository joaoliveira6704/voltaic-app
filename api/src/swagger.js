import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Voltaic API",
      version: "1.0.0",
      description:
        "API de gestão de estações de carregamento de veículos elétricos. Permite gerir utilizadores, empresas, estações, tickets e sessões de carregamento.\n\nGrupo 5 — João Pedro Teixeira Oliveira (40240391), Miguel José Carvalho Neto (40240358)",
    },
    servers: [
      {
        url: "https://voltaic.diacidos.pt",
        description: "Servidor de produção",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT obtido no login",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Bad Request" },
            details: {
              type: "object",
              description: "Erros de validação (opcional)",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: { type: "object", description: "Payload da resposta" },
            message: { type: "string", example: "Operação concluída" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { type: "object" },
              description: "Array de resultados",
            },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 100 },
            pages: { type: "integer", example: 5 },
          },
        },
        User: {
          type: "object",
          properties: {
            userId: { type: "string", example: "abc123" },
            username: { type: "string", example: "joaosilva" },
            email: { type: "string", format: "email", example: "joao@example.com" },
            firstName: { type: "string", example: "João" },
            lastName: { type: "string", example: "Silva" },
            role: {
              type: "string",
              enum: ["client", "admin", "worker", "company-manager"],
              example: "client",
            },
            companyId: { type: "string", example: "comp001" },
            preferences: {
              type: "object",
              properties: {
                darkMode: { type: "boolean", default: false },
                hidePlates: { type: "boolean", default: false },
                language: { type: "string", default: "en" },
              },
            },
            vehicles: {
              type: "array",
              items: { $ref: "#/components/schemas/Vehicle" },
            },
            favorites: {
              type: "array",
              items: { type: "string" },
              description: "IDs das estações favoritas",
            },
          },
        },
        CreateUserInput: {
          type: "object",
          required: ["username", "email", "firstName", "lastName", "password"],
          properties: {
            username: { type: "string", minLength: 8, maxLength: 20, example: "joaosilva" },
            email: { type: "string", format: "email", example: "joao@example.com" },
            firstName: { type: "string", example: "João" },
            lastName: { type: "string", example: "Silva" },
            password: {
              type: "string",
              minLength: 8,
              description: "Deve conter maiúscula, minúscula e caractere especial",
              example: "Password123!",
            },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "joao@example.com" },
            password: { type: "string", example: "Password123!" },
          },
        },
        Station: {
          type: "object",
          properties: {
            stationId: { type: "string", example: "st001" },
            title: { type: "string", example: "Estação Central" },
            location: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["Point"], default: "Point" },
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                  example: [-8.653, 40.638],
                  description: "[longitude, latitude]",
                },
              },
            },
            groupId: { type: "string", example: "grp001" },
            connector: {
              type: "object",
              properties: {
                socketTypes: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: [
                      "ccs1", "ccs2", "chademo", "gb_t_ac",
                      "gb_t_dc", "nacs", "type1", "type2",
                    ],
                  },
                },
                maxPower: { type: "number", example: 150 },
              },
            },
            telemetry: {
              type: "object",
              properties: {
                amperage: { type: "number", example: 32 },
                voltage: { type: "number", example: 400 },
                temperature: { type: "number", example: 45 },
              },
            },
            state: {
              type: "string",
              enum: ["available", "unavailable", "maintenance"],
              example: "available",
            },
            alive: { type: "boolean", example: true },
          },
        },
        CreateStationInput: {
          type: "object",
          required: ["title", "location", "connector", "state"],
          properties: {
            title: { type: "string", example: "Estação Central" },
            location: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["Point"], default: "Point" },
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                  example: [-8.653, 40.638],
                },
              },
            },
            connector: {
              type: "object",
              properties: {
                socketTypes: {
                  type: "array",
                  items: { type: "string" },
                },
                maxPower: { type: "number", example: 150 },
              },
            },
            state: {
              type: "string",
              enum: ["available", "unavailable", "maintenance"],
            },
            alive: { type: "boolean", default: true },
          },
        },
        Company: {
          type: "object",
          properties: {
            companyId: { type: "string", example: "comp001" },
            name: { type: "string", example: "EletroPosto Lda" },
            groups: {
              type: "array",
              items: { type: "string" },
              description: "IDs dos grupos atribuídos",
            },
          },
        },
        CreateCompanyInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "EletroPosto Lda" },
          },
        },
        Ticket: {
          type: "object",
          properties: {
            ticketId: { type: "string", example: "tck001" },
            stationId: { type: "string", example: "st001" },
            companyId: { type: "string", example: "comp001" },
            createdBy: { type: "string", example: "usr001" },
            title: { type: "string", example: "Equipamento avariado" },
            description: { type: "string", example: "Conector não encaixa" },
            remarks: { type: "string", example: "Urgente" },
            status: {
              type: "string",
              enum: ["open", "closed", "resolved", "unresolved"],
              example: "open",
            },
            closedAt: { type: "string", format: "date-time" },
          },
        },
        CreateTicketInput: {
          type: "object",
          required: ["title", "description"],
          properties: {
            stationId: { type: "string", example: "st001" },
            title: { type: "string", example: "Equipamento avariado" },
            description: { type: "string", example: "Conector não encaixa" },
            remarks: { type: "string", example: "Por favor resolver ASAP" },
            status: {
              type: "string",
              enum: ["open", "closed", "resolved", "unresolved"],
            },
          },
        },
        UpdateTicketInput: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            remarks: { type: "string" },
            status: {
              type: "string",
              enum: ["open", "closed", "resolved", "unresolved"],
            },
          },
        },
        Usage: {
          type: "object",
          properties: {
            usageId: { type: "string", example: "usg001" },
            userId: { type: "string", example: "usr001" },
            stationId: { type: "string", example: "st001" },
            plate: { type: "string", example: "AA-00-BB" },
            endTime: { type: "string", format: "date-time", nullable: true },
            state: { type: "string", enum: ["active", "completed"], example: "active" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        StartUsageInput: {
          type: "object",
          required: ["stationId", "plate"],
          properties: {
            stationId: { type: "string", example: "st001" },
            plate: { type: "string", example: "AA-00-BB" },
          },
        },
        Log: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665abc..." },
            userId: { type: "string", example: "usr001" },
            stationId: { type: "string", example: "st001" },
            type: { type: "string", example: "info" },
            action: { type: "string", example: "start" },
            details: { type: "string", example: "Station started successfully" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateLogInput: {
          type: "object",
          required: ["type"],
          properties: {
            type: { type: "string", example: "info" },
            action: { type: "string", example: "start" },
            details: { type: "string", example: "Station started" },
          },
        },
        Vehicle: {
          type: "object",
          properties: {
            plate: { type: "string", example: "AA-00-BB" },
            model: { type: "string", example: "Tesla Model 3" },
            slug: { type: "string", example: "tesla-model-3" },
            connector: {
              type: "string",
              enum: [
                "ccs1", "ccs2", "chademo", "gb_t_ac",
                "gb_t_dc", "nacs", "type1", "type2",
              ],
              example: "ccs2",
            },
          },
        },
        AddVehicleInput: {
          type: "object",
          required: ["plate", "model", "color", "connector", "slug"],
          properties: {
            plate: { type: "string", example: "AA-00-BB" },
            model: { type: "string", example: "Tesla Model 3" },
            color: { type: "string", example: "red" },
            connector: {
              type: "string",
              enum: [
                "ccs1", "ccs2", "chademo", "gb_t_ac",
                "gb_t_dc", "nacs", "type1", "type2",
              ],
            },
            slug: { type: "string", example: "tesla-model-3" },
          },
        },
        EditVehicleInput: {
          type: "object",
          properties: {
            model: { type: "string" },
            color: { type: "string" },
            connector: {
              type: "string",
              enum: [
                "ccs1", "ccs2", "chademo", "gb_t_ac",
                "gb_t_dc", "nacs", "type1", "type2",
              ],
            },
            slug: { type: "string" },
          },
        },
        AddFavoriteInput: {
          type: "object",
          required: ["stationId"],
          properties: {
            stationId: { type: "string", example: "st001" },
          },
        },
        UpdateOwnUserInput: {
          type: "object",
          properties: {
            username: { type: "string" },
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            currentPassword: { type: "string", description: "Obrigatório se newPassword for fornecido" },
            newPassword: { type: "string", minLength: 8 },
            preferences: {
              type: "object",
              properties: {
                darkMode: { type: "boolean" },
                hidePlates: { type: "boolean" },
                language: { type: "string" },
              },
            },
          },
        },
        UpdateRoleInput: {
          type: "object",
          required: ["role"],
          properties: {
            role: {
              type: "string",
              enum: ["client", "admin", "worker", "company-manager"],
            },
          },
        },
        ExecuteCommandInput: {
          type: "object",
          required: ["command"],
          properties: {
            command: {
              type: "string",
              example: "start",
              description: "Comando a executar na estação",
            },
          },
        },
        Group: {
          type: "object",
          properties: {
            groupId: { type: "string", example: "grp001" },
            name: { type: "string", example: "Grupo A" },
          },
        },
        RefreshTokenInput: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "Refresh token obtido no login",
            },
          },
        },
        ForgotPasswordInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
          },
        },
        ResetPasswordInput: {
          type: "object",
          required: ["token", "newPassword"],
          properties: {
            token: { type: "string", example: "reset-token-abc" },
            newPassword: { type: "string", minLength: 8, example: "NewPass123!" },
          },
        },
        CompanyDashboard: {
          type: "object",
          properties: {
            stations: {
              type: "object",
              properties: {
                available: { type: "integer" },
                unavailable: { type: "integer" },
                maintenance: { type: "integer" },
                inactive: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      stationId: { type: "string" },
                      name: { type: "string" },
                    },
                  },
                },
              },
            },
            tickets: {
              type: "object",
              properties: {
                open: { type: "integer" },
                closed: { type: "integer" },
                resolved: { type: "integer" },
                unresolved: { type: "integer" },
              },
            },
            usage: {
              type: "object",
              properties: {
                thisWeek: { type: "integer" },
                lastWeek: { type: "integer" },
                percentageDelta: { type: "integer" },
              },
            },
            weeklyTotals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  weekStart: { type: "string", format: "date" },
                  total: { type: "integer" },
                },
              },
            },
            latestTickets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ticketId: { type: "string" },
                  title: { type: "string" },
                  status: { type: "string" },
                  groupName: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        StationDashboard: {
          type: "object",
          properties: {
            total: { type: "integer" },
            available: { type: "integer" },
            unavailable: { type: "integer" },
            maintenance: { type: "integer" },
            alive: { type: "integer" },
          },
        },
        CatalogVehicle: {
          type: "object",
          properties: {
            _id: { type: "string" },
            make: {
              type: "object",
              properties: {
                slug: { type: "string" },
                name: { type: "string" },
              },
            },
            model: {
              type: "object",
              properties: {
                slug: { type: "string" },
                name: { type: "string" },
              },
            },
            year: { type: "integer", example: 2024 },
            charge_ports: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  kind: { type: "string" },
                  connector: { type: "string" },
                  location: {
                    type: "object",
                    properties: {
                      side: { type: "string" },
                      position: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Autenticação e recuperação de password" },
      { name: "Users", description: "Gestão de utilizadores" },
      { name: "Companies", description: "Gestão de empresas" },
      { name: "Stations", description: "Gestão de estações de carregamento" },
      { name: "Tickets", description: "Gestão de tickets de suporte" },
      { name: "Usages", description: "Sessões de carregamento" },
      { name: "Logs", description: "Registos de atividades" },
      { name: "Vehicles", description: "Catálogo de veículos" },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
