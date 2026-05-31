import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/swagger.js";
import userRoute from "./src/routes/user.route.js";
import companyRoute from "./src/routes/company.route.js";
import logRoute from "./src/routes/log.route.js";
import stationRoute from "./src/routes/station.route.js";
import ticketRoute from "./src/routes/ticket.route.js";
import errorHandler from "./src/middleware/error.middleware.js";
import vehicleRoute from "./src/routes/vehicle.route.js";
import usageRoute from "./src/routes/usage.route.js";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/companies", companyRoute);
app.use("/api/logs", logRoute);
app.use("/api/stations", stationRoute);
app.use("/api/tickets", ticketRoute);
app.use("/api/vehicles", vehicleRoute);
app.use("/api/usages", usageRoute);

app.get("/api/status", (req, res) => res.json({ status: "Alive" }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));

app.use(errorHandler);

export default app;
