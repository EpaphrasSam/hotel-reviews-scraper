import express from "express";
import { scrapeExpedia } from "../controllers/expediaController";

const router = express.Router();

router.get("/", scrapeExpedia);

export default router;
