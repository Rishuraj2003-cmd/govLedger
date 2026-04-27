import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { join } from "node:path";
import { connectDatabase } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || true,
    credentials: true,
  }),
);
app.use(express.json());
// Serve uploaded files statically
app.use("/uploads", express.static(join(process.cwd(), "uploads")));

app.use("/api", router);
app.use(errorHandler);

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Fund tracking API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });
