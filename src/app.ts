import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

dotenv.config();

import expediaRoutes from "./routes/expediaRoutes";
import airbnbRoutes from "./routes/airbnbRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import tripadvisorRoutes from "./routes/tripadvisorRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Add rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Define routes
// app.use("/scrape/expedia", expediaRoutes);
app.use("/scrape/airbnb", airbnbRoutes);
// app.use("/scrape/booking", bookingRoutes);
// app.use("/scrape/tripadvisor", tripadvisorRoutes);

export default app;
