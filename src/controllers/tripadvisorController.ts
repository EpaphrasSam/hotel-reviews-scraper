import { Request, Response } from "express";
import { scrapeTripAdvisorService } from "../services/tripadvisorService";

export const scrapeTripAdvisor = async (req: Request, res: Response) => {
  try {
    const reviews = await scrapeTripAdvisorService();
    res.json({
      message: "TripAdvisor scraping completed",
      reviewCount: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Scraping failed" });
  }
};
