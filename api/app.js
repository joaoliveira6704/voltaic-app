import express from "express";
import userRoutes from "./src/routes/userRoutes.js";
import companyRoutes from "./src/routes/companyRoutes.js";
import logRoutes from "./src/routes/logRoutes.js";
import stationRoutes from "./src/routes/stationRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import authRoutes from "./src/routes/authRoutes.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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
