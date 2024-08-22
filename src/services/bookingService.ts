import { runApifyActor } from "../utils/apify";
import { saveToCSV } from "../utils/csvWriter";
import { Review } from "../types/review";
import { initBrowser } from "../utils/puppeteer";

export const scrapeBookingService = async (
  numHotels: number = 5
): Promise<Review[]> => {
  let browser;
  try {
    browser = await initBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);

    const url = "https://www.booking.com/searchresults.html?ss=Ghana";
    await page.goto(url);

    console.log("Navigated to search results page. Extracting hotel links...");

    const hotelLinks = await page.evaluate(() => {
      const hotelAnchors = Array.from(
        document.querySelectorAll('a[data-testid="title-link"]')
      );
      console.log(hotelAnchors);
      return hotelAnchors.map((anchor) => {
        const titleDiv = anchor.querySelector('div[data-testid="title"]');
        return {
          name: titleDiv ? titleDiv.textContent : "Unknown Hotel",
          url: (anchor as HTMLAnchorElement).href,
        };
      });
    });

    console.log(`Found ${hotelLinks.length} hotel links. Scraping reviews...`);

    const allReviews: Review[] = [];

    for (const link of hotelLinks.slice(0, numHotels)) {
      console.log(`Scraping reviews for ${link.name}`);

      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

      const items = await runApifyActor("voyager/booking-reviews-scraper", {
        startUrls: [{ url: link.url }],
        maxReviews: 100,
        language: "en-us",
      });

      const hotelReviews: Review[] = items.map((item: any) => ({
        hotel: item.hotelId,
        rating: item.rating,
        date: item.reviewDate,
        stayDuration: item.stayDuration,
        content: Object.values(item.reviewTextParts).join(" "),
        reviewer: item.reviewer,
        // userName: item.userName,
        // userLocation: item.userLocation,
        // stayDate: item.stayDate,
        // travelerType: item.travelerType,
        // roomInfo: item.roomInfo,
      }));

      allReviews.push(...hotelReviews);

      allReviews.push(...hotelReviews);
    }

    // if (allReviews.length > 0) {
    //   await saveToCSV(allReviews, "booking_reviews.csv", [
    //     { id: "hotel", title: "Hotel" },
    //     { id: "rating", title: "Rating" },
    //     { id: "date", title: "Review Date" },
    //     { id: "content", title: "Content" },
    //     { id: "userName", title: "User Name" },
    //     { id: "userLocation", title: "User Location" },
    //     { id: "stayDate", title: "Stay Date" },
    //     { id: "travelerType", title: "Traveler Type" },
    //     { id: "roomInfo", title: "Room Info" },
    //   ]);
    // }

    return allReviews;
  } catch (error) {
    console.error("Error in scrapeBookingService:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.disconnect();
    }
  }
};
