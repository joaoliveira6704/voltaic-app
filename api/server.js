import "dotenv/config";
import app from "./app.js";
import connectDB from "./src/services/db.service.js";
import redis from "./src/services/redis.service.js";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;

connectDB();

const server = app.listen(PORT, () =>
  console.log(`Api running on: http://0.0.0.0:${PORT}`),
);

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await redis.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await redis.quit();
  process.exit(0);
});
