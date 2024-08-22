import express from "express";
import { scrapeAirbnb } from "../controllers/airbnbController";

const router = express.Router();

router.get("/", scrapeAirbnb);

export default router;
