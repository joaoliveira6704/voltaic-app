import express from "express";
import userRoutes from "./src/routes/userRoutes.js";
import companyRoutes from "./src/routes/companyRoutes.js";
import logRoutes from "./src/routes/logRoutes.js";
import stationRoutes from "./src/routes/stationRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/tickets", ticketRoutes);
app.get("/api/status", (req, res) => res.json({ status: "Alive" }));

app.use(errorHandler);

export default app;
