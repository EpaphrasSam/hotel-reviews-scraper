import express from "express";
import { scrapeBooking } from "../controllers/bookingController";

const router = express.Router();

router.get("/", scrapeBooking);

export default router;
