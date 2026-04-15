import "dotenv/config";
import app from "./app.js";
import connectDB from "./src/services/db.service.js";

const PORT = 3000;

connectDB();
app.listen(PORT, () => console.log(`Api running on: http://0.0.0.0:${PORT}`));
