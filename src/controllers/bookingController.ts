import { Request, Response } from "express";
import { scrapeBookingService } from "../services/bookingService";

export const scrapeBooking = async (req: Request, res: Response) => {
  try {
    const reviews = await scrapeBookingService();
    res.json({
      message: "Booking.com scraping completed",
      //   reviewCount: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Scraping failed" });
  }
};
