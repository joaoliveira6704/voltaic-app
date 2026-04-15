import connectDB from "../services/db.service";

const createMigration = async () => {
  await connectDB();
  console.log("Database connection established. Running injection...");

  console.log("Injection completed successfully.");
  process.exit(0);
};

createMigration();