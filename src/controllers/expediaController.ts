import { Request, Response } from "express";
import { scrapeExpediaService } from "../services/expediaService";

export const scrapeExpedia = async (req: Request, res: Response) => {
  try {
    const reviews = await scrapeExpediaService();
    res.json({
      message: "Expedia scraping completed",
      reviewCount: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Scraping failed" });
  }
};
