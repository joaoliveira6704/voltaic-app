import express from "express";
import userRoutes from "./src/routes/userRoutes.js";
import companyRoutes from "./src/routes/companyRoutes.js";
import logRoutes from "./src/routes/logRoutes.js";
import sessionRoutes from "./src/routes/sessionRoutes.js";
import stationRoutes from "./src/routes/stationRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use("/companies", companyRoutes);
app.use("/logs", logRoutes);
app.use("/sessions", sessionRoutes);
app.use("/stations", stationRoutes);
app.use("/tickets", ticketRoutes);
app.get("/", (req, res) => res.send("Alive"));
app.use(errorHandler);

export default app;
