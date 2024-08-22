import { runApifyActor } from "../utils/apify";
import { Review } from "../types/review";
import { saveToCSV } from "../utils/csvWriter";

export const scrapeExpediaService = async (): Promise<Review[]> => {
  try {
    const items = await runApifyActor("apify/expedia-scraper", {
      search: "Ghana",
      maxReviews: 100,
      includeReviews: true,
    });

    const reviews: Review[] = items.flatMap((item: any) =>
      item.reviews.map((review: any) => ({
        hotel: item.name,
        rating: review.rating,
        date: review.date,
        content: review.text,
      }))
    );

    // await saveToCSV(reviews, "expedia_reviews.csv", [
    //   { id: "hotel", title: "Hotel" },
    //   { id: "rating", title: "Rating" },
    //   { id: "date", title: "Date" },
    //   { id: "content", title: "Content" },
    // ]);

    return reviews;
  } catch (error) {
    console.error("Error in scrapeExpediaService:", error);
    throw error;
  }
};
