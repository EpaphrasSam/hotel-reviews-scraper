import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

import expediaRoutes from "./routes/expediaRoutes";
import airbnbRoutes from "./routes/airbnbRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import tripadvisorRoutes from "./routes/tripadvisorRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Define routes
// app.use("/scrape/expedia", expediaRoutes);
app.use("/scrape/airbnb", airbnbRoutes);
// app.use("/scrape/booking", bookingRoutes);
// app.use("/scrape/tripadvisor", tripadvisorRoutes);

export default app;
