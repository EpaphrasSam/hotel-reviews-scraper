import { Request, Response } from "express";
import { scrapeAirbnbService } from "../services/airbnbService";

export const scrapeAirbnb = async (req: Request, res: Response) => {
  try {
    const reviews = await scrapeAirbnbService();
    res.json({
      message: "Airbnb scraping completed",
      reviewCount: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Scraping failed" });
  }
};
