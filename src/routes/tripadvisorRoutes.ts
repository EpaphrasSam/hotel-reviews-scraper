import express from "express";
import { scrapeTripAdvisor } from "../controllers/tripadvisorController";

const router = express.Router();

router.get("/", scrapeTripAdvisor);

export default router;
