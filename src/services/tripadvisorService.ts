import { runApifyActor } from "../utils/apify";
import { Review } from "../types/review";
import { saveToCSV } from "../utils/csvWriter";

export const scrapeTripAdvisorService = async (): Promise<Review[]> => {
  try {
    const items = await runApifyActor("apify/tripadvisor-scraper", {
      locationFullName: "Ghana",
      maxReviews: 100,
      includeReviews: true,
    });

    const reviews: Review[] = items.flatMap((item: any) =>
      item.reviews.map((review: any) => ({
        hotel: item.name,
        rating: review.rating,
        date: review.publishedDate,
        content: review.text,
      }))
    );

    // await saveToCSV(reviews, "tripadvisor_reviews.csv", [
    //   { id: "hotel", title: "Hotel" },
    //   { id: "rating", title: "Rating" },
    //   { id: "date", title: "Date" },
    //   { id: "content", title: "Content" },
    // ]);

    return reviews;
  } catch (error) {
    console.error("Error in scrapeTripAdvisorService:", error);
    throw error;
  }
};
