import express from "express";
import userRoutes from "./src/routes/userRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.get("/", (req, res) => res.send("Alive"));
app.use(errorHandler);

export default app;
